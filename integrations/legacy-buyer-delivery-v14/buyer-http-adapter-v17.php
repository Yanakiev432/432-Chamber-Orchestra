<?php
declare(strict_types=1);
namespace Orchestra\Buyer;
use PDO;
use Throwable;

require_once __DIR__.'/buyer-core.php';
require_once __DIR__.'/buyer-http-flow.php';

function privatePath(string $p,bool $directory=false): string {
    $r=realpath($p);
    check($r!==false && $r===$p && !is_link($p) && ($directory?is_dir($p):is_file($p))
        && (fileperms($p)&0077)===0 && !preg_match('~(?:^|/)(public_html|htdocs|www|dist|public)(?:/|$)~i',$p));
    return $r;
}
function reply(int $status,string $body=''): never {
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    echo $body;exit;
}
function denyHttp(int $status=403): never {reply($status,'<!doctype html><html lang="en"><meta charset="utf-8"><title>Download unavailable</title><p>Download unavailable. / Изтеглянето не е достъпно.</p></html>');}
function cookie(string $name,string $value,int $expires): void {
    check(setcookie($name,$value,['expires'=>$expires,'path'=>'/','secure'=>true,'httponly'=>true,'samesite'=>'Lax']));
}
function redirectClean(string $path): never {header('Location: '.$path,true,303);exit;}
function tokenCookie(string $name): string {
    $v=$_COOKIE[$name]??'';check(is_string($v)&&preg_match('/^[a-f0-9]{64}$/D',$v)===1);return $v;
}
// The selector is a truncated digest of a random 256-bit token, NOT a bearer credential.
function selector(string $token): string {return substr(hash('sha256',$token),0,32);}
function scopedCookie(string $kind,string $id): string {
    check(in_array($kind,['browser','challenge','download'],true)&&preg_match('/^[a-f0-9]{32}$/D',$id)===1);
    return '__Host-432-'.$kind.'-'.$id;
}
function scopedLimit(PDO $db,string $secret,string $scope,string $identity,int $now,int $limit): void {
    check(in_array($scope,['file-ip','file-session','confirm-ip'],true)&&$limit>0&&$limit<=1000);
    $key=hash_hmac('sha256','v17:'.$scope.':'.$identity,$secret);$window=intdiv($now,300);
    $q=$db->prepare('INSERT INTO throttle VALUES(?,?,1) ON CONFLICT(bucket,window) DO UPDATE SET n=n+1 WHERE n<?');
    $q->execute([$key,$window,$limit]);check($q->rowCount()===1);
}
function cleanupExpired(PDO $db,int $now,int $limit=200): array {
    check($limit>=1&&$limit<=1000);
    $db->exec('BEGIN IMMEDIATE');
    try{
        $out=[];
        foreach([
          'challenges'=>['digest','expires_at<=?',[$now]],
          'sessions'=>['digest','expires_at<=?',[$now]],
          'throttle'=>['rowid','window<?',[intdiv($now,300)-1]]
        ] as $table=>[$id,$where,$args]){
            $q=$db->prepare("DELETE FROM $table WHERE $id IN (SELECT $id FROM $table WHERE $where ORDER BY $id LIMIT $limit)");
            $q->execute($args);$out[$table]=$q->rowCount();
        }
        $db->exec('COMMIT');return $out;
    }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
}
function serve(array $config): never {
    ini_set('display_errors','0');
    foreach(safeHeaders() as $k=>$v)header($k.': '.$v);
    try{
        // QA is available only to PHP CLI's loopback server with explicitly synthetic configuration.
        $qa=($config['mode']??'')==='synthetic-loopback';
        $host=(string)($_SERVER['HTTP_HOST']??'');
        $ip=(string)($_SERVER['REMOTE_ADDR']??'');
        if($qa){
            check(PHP_SAPI==='cli-server'&&$ip==='127.0.0.1'&&preg_match('/^127\.0\.0\.1:[0-9]{1,5}$/D',$config['host'])===1);
            $origin='http://'.$config['host'];
        }else{
            check(($config['mode']??'')==='production'&&($config['releaseApproved']??false)===true
                &&($config['legacyQueryLoggingVerifiedSafe']??false)===true);
            check($config['host']==='432hz-orchestra.com'&&($_SERVER['HTTPS']??'')==='on');
            $origin='https://'.$config['host'];
        }
        check(hash_equals($config['host'],$host));
        $path=parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH);$query=$_SERVER['QUERY_STRING']??'';
        $method=$_SERVER['REQUEST_METHOD']??'';
        $route=[];$kind='';$id='';
        if($path!=='/'){
            if(!is_string($path)||!preg_match('~^/legacy-download/(confirm|file)/([a-f0-9]{32})$~D',$path,$route))denyHttp(404);
            $kind=$route[1];$id=$route[2];
        }
        if(!in_array($method,['GET','POST','HEAD'],true)){header('Allow: GET, HEAD, POST');denyHttp(405);}
        $dbpath=privatePath($config['db']);$root=privatePath($config['media'],true);$secret=$config['secret'];check(is_string($secret)&&strlen($secret)>=32);
        $db=new PDO('sqlite:'.$dbpath);$db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);$db->exec('PRAGMA foreign_keys=ON');$db->exec('PRAGMA busy_timeout=3000');
        $now=time();
        if($path==='/'){
            if($method!=='GET'){header('Allow: GET');denyHttp(405);}
            try{throttle($db,$secret,$ip,$now);}catch(Denied $e){header('Retry-After: 300');denyHttp(429);}
            $dig=parseLegacyQuery($query,$secret);
            $browser=bin2hex(random_bytes(32));$c=challenge($db,$dig,$browser,$now);
            $id=selector($c);
            cookie(scopedCookie('browser',$id),$browser,$now+600);
            cookie(scopedCookie('challenge',$id),$c,$now+600);
            // Expired rows only, bounded work; never delete grants, media or credentials.
            cleanupExpired($db,$now);
            redirectClean('/legacy-download/confirm/'.$id);
        }
        check($query==='');
        if($kind==='confirm'){
            $browser=tokenCookie(scopedCookie('browser',$id));$c=tokenCookie(scopedCookie('challenge',$id));
            check(hash_equals($id,selector($c)));
            try{scopedLimit($db,$secret,'confirm-ip',$ip,$now,90);}catch(Denied $e){header('Retry-After: 300');denyHttp(429);}
            if($method==='GET'){
                $row=one($db,'SELECT * FROM challenges WHERE digest=? AND browser_digest=? AND expires_at>?',[hash('sha256',$c),hash('sha256',$browser),$now]);
                check($row!==null);inspect($db,$row['credential_digest'],$now);
                // Only the clean confirmation URL is eligible as a same-origin referrer.
                // The legacy credential-bearing redirect retains no-referrer.
                header('Referrer-Policy: same-origin',true);
                reply(200,'<!doctype html><html lang="bg"><meta charset="utf-8"><title>Download / Изтегляне</title><h1>Изтегляне / Download</h1><form method="post" action="/legacy-download/confirm/'.$id.'"><input type="hidden" name="confirm" value="'.$c.'"><button type="submit">Изтегли / Download</button></form></html>');
            }
            if($method!=='POST'){header('Allow: GET, POST');denyHttp(405);}
            check(($_SERVER['HTTP_ORIGIN']??'')===$origin && (int)($_SERVER['CONTENT_LENGTH']??0)<=256
                && strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))==='application/x-www-form-urlencoded');
            $body=file_get_contents('php://input',false,null,0,257);
            check(is_string($body)&&hash_equals('confirm='.$c,$body));
            $token=confirm($db,$c,$browser,$root,$now);
            $fileId=selector($token);
            cookie(scopedCookie('download',$fileId),$token,$now+3600);
            cookie(scopedCookie('challenge',$id),'',1);cookie(scopedCookie('browser',$id),'',1);
            redirectClean('/legacy-download/file/'.$fileId);
        }
        if(!in_array($method,['GET','HEAD'],true)){header('Allow: GET, HEAD');denyHttp(405);}
        $token=tokenCookie(scopedCookie('download',$id));check(hash_equals($id,selector($token)));
        $g=sessionGrant($db,$token,$now);$m=media($db,$g);$size=(int)$m['bytes'];
        try{
            scopedLimit($db,$secret,'file-ip',$ip,$now,120);
            scopedLimit($db,$secret,'file-session',hash('sha256',$token),$now,60);
        }catch(Denied $e){header('Retry-After: 300');denyHttp(429);}
        $range=$_SERVER['HTTP_RANGE']??null;
        try{byteRange($range,$size);}catch(Denied $e){header('Content-Range: bytes */'.$size);header('Accept-Ranges: bytes');denyHttp(416);}
        $result=transfer($db,$token,$root,$now,$range);
        http_response_code($result['status']);
        foreach($result['headers'] as $k=>$v)header($k.': '.$v);
        header('Content-Disposition: attachment; filename="recording.'.(strtolower(pathinfo($m['relative_path'],PATHINFO_EXTENSION))==='wav'?'wav':'mp3').'"');
        $f=$result['stream'];$left=$result['length'];
        if($method==='HEAD'){fclose($f);exit;}
        // Stream only the selected range, never load the full recording into memory.
        while($left>0&&!connection_aborted()){
            $b=fread($f,min(1048576,$left));if($b===false||$b==='')break;
            echo $b;$left-=strlen($b);flush();
        }
        fclose($f);exit;
    }catch(Denied $e){denyHttp();}catch(Throwable $e){denyHttp(503);}
}
function serveFromEnvironment(): never {
    try{
        $p=getenv('BUYER_PRIVATE_CONFIG');check(is_string($p));
        $p=privatePath($p);
        check(filesize($p)<=16384);
        $config=json_decode(file_get_contents($p),true,16,JSON_THROW_ON_ERROR);
        check(is_array($config));serve($config);
    }catch(Throwable $e){foreach(safeHeaders() as $k=>$v)header($k.': '.$v);denyHttp(503);}
}
