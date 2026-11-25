<?php
declare(strict_types=1);
namespace Orchestra\Buyer;
use PDO;
use Throwable;

// Transport-neutral HTTP flow. Never put original credentials in response HTML, redirect, or token URLs.
function parseLegacyQuery(string $query,string $secret): string {
    check(strlen($query)<=2048);
    $q=[];
    foreach(explode('&',$query) as $part){
        $x=explode('=',$part,2);check(count($x)===2 && !preg_match('/%(?![a-f0-9]{2})/i',$part));
        $k=urldecode($x[0]);$v=urldecode($x[1]);
        check(in_array($k,['download_file','order','key','email','uid'],true) && !array_key_exists($k,$q) && !preg_match('/[\x00-\x1f\x7f]/',$v));
        $q[$k]=$v;
    }
    check(count($q)===4 && isset($q['download_file'],$q['order'],$q['key']) && (isset($q['email']) xor isset($q['uid'])));
    check(preg_match('/^[1-9][0-9]{0,9}$/D',$q['download_file'])===1);
    $kind=isset($q['email'])?'email':'uid';
    return credential($secret,(int)$q['download_file'],$q['key'],$q['order'],$kind,$q[$kind]);
}
function httpSchema(PDO $db): void {
    schema($db);
    $db->exec("CREATE TABLE IF NOT EXISTS challenges (digest TEXT PRIMARY KEY, browser_digest TEXT NOT NULL, credential_digest TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS throttle (bucket TEXT NOT NULL, window INTEGER NOT NULL, n INTEGER NOT NULL, PRIMARY KEY(bucket,window));");
}
function throttle(PDO $db,string $secret,string $ip,int $now,int $limit=30): void {
    check(filter_var($ip,FILTER_VALIDATE_IP)!==false && $limit>=1 && $limit<=1000);
    $key=hash_hmac('sha256','rate:'.$ip,$secret);$window=intdiv($now,300);
    $q=$db->prepare('INSERT INTO throttle VALUES(?,?,1) ON CONFLICT(bucket,window) DO UPDATE SET n=n+1 WHERE n<?');
    $q->execute([$key,$window,$limit]);check($q->rowCount()===1);
}
function challenge(PDO $db,string $digest,string $browser,int $now): string {
    check(preg_match('/^[a-f0-9]{64}$/D',$browser)===1);
    inspect($db,$digest,$now);
    $token=bin2hex(random_bytes(32));
    $q=$db->prepare('INSERT INTO challenges VALUES(?,?,?,?)');
    $q->execute([hash('sha256',$token),hash('sha256',$browser),$digest,$now+600]);
    return $token;
}
function confirm(PDO $db,string $challenge,string $browser,string $root,int $now): string {
    check(preg_match('/^[a-f0-9]{64}$/D',$challenge)===1 && preg_match('/^[a-f0-9]{64}$/D',$browser)===1);
    $h=hash('sha256',$challenge);$bh=hash('sha256',$browser);
    $read=fn()=>one($db,'SELECT * FROM challenges WHERE digest=? AND browser_digest=? AND expires_at>?',[$h,$bh,$now]);
    $c=$read();check($c!==null);
    $g=inspect($db,$c['credential_digest'],$now);$f=privateMedia($root,media($db,$g));fclose($f);
    $db->exec('BEGIN IMMEDIATE');
    try {
        $c=$read();check($c!==null);$g=inspect($db,$c['credential_digest'],$now);
        if($g['remaining']!==null){$q=$db->prepare('UPDATE grants SET remaining=remaining-1 WHERE id=? AND remaining>0');$q->execute([$g['id']]);check($q->rowCount()===1);}
        $token=bin2hex(random_bytes(32));$until=$now+3600;
        if($g['expires_at']!==null)$until=min($until,(int)$g['expires_at']);
        $q=$db->prepare('INSERT INTO sessions(digest,grant_id,expires_at) VALUES(?,?,?)');$q->execute([hash('sha256',$token),$g['id'],$until]);
        $q=$db->prepare('DELETE FROM challenges WHERE digest=?');$q->execute([$h]);check($q->rowCount()===1);
        $db->exec('COMMIT');return $token;
    }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
}
function safeHeaders(): array {
    return ['Cache-Control'=>'no-store, private','Referrer-Policy'=>'no-referrer','X-Content-Type-Options'=>'nosniff','X-Frame-Options'=>'DENY','X-Robots-Tag'=>'noindex, nofollow','Content-Security-Policy'=>"default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"];
}
// Caller must enforce actual HTTPS, exact host, paths, method, origin and cookie attributes.
// Return an opened stream and range; no response is emitted by this core.
function transfer(PDO $db,string $token,string $root,int $now,?string $range): array {
    [$f,$size]=openDownload($db,$token,$root,$now);
    try {[$a,$b,$status]=byteRange($range,$size);check(fseek($f,$a)===0);
        $headers=safeHeaders()+['Accept-Ranges'=>'bytes','Content-Type'=>'application/octet-stream','Content-Length'=>(string)($b-$a+1),'Content-Disposition'=>'attachment'];
        if($status===206)$headers['Content-Range']="bytes $a-$b/$size";
        return ['status'=>$status,'headers'=>$headers,'stream'=>$f,'length'=>$b-$a+1];
    }catch(Throwable $e){fclose($f);throw $e;}
}
