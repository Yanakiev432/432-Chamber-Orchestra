<?php
declare(strict_types=1);
namespace Orchestra\Buyer;
use PDO;
use RuntimeException;
use Throwable;

final class Denied extends RuntimeException {}
function check(bool $ok): void { if (!$ok) throw new Denied('ACCESS_DENIED'); }
function credential(string $secret, int $product, string $download, string $order, string $kind, string $identity): string {
    check(strlen($secret) >= 32 && $product > 0 && preg_match('/^[a-f0-9]{32}$/iD', $download) === 1
        && preg_match('/^wc_order_[A-Za-z0-9]{1,128}$/D', $order) === 1);
    if ($kind === 'email') {
        $identity = strtolower(trim($identity));
        check(strlen($identity) <= 254 && filter_var($identity, FILTER_VALIDATE_EMAIL) !== false);
    } else {
        check($kind === 'uid' && preg_match('/^[a-f0-9]{64}$/D', $identity) === 1);
    }
    return hash_hmac('sha256', json_encode([$product,$download,$order,$kind,$identity], JSON_THROW_ON_ERROR), $secret);
}
function schema(PDO $db): void {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('PRAGMA foreign_keys=ON');
    $db->exec('PRAGMA busy_timeout=3000');
    $db->exec("CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, relative_path TEXT NOT NULL UNIQUE, sha256 TEXT NOT NULL, bytes INTEGER NOT NULL CHECK(bytes>0));
CREATE TABLE IF NOT EXISTS grants (id INTEGER PRIMARY KEY, media_id TEXT NOT NULL REFERENCES media(id), remaining INTEGER CHECK(remaining>=0), expires_at INTEGER, enabled INTEGER NOT NULL CHECK(enabled IN(0,1)));
CREATE TABLE IF NOT EXISTS credentials (digest TEXT PRIMARY KEY, grant_id INTEGER NOT NULL REFERENCES grants(id));
CREATE TABLE IF NOT EXISTS sessions (digest TEXT PRIMARY KEY, grant_id INTEGER NOT NULL REFERENCES grants(id), expires_at INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN(0,1)));");
}
function one(PDO $db, string $sql, array $args): ?array {
    $q=$db->prepare($sql);$q->execute($args);$r=$q->fetch(PDO::FETCH_ASSOC);return $r===false?null:$r;
}
function validGrant(?array $g,int $now,bool $needsQuota): array {
    check($g!==null && (int)$g['enabled']===1 && ($g['expires_at']===null || $now<(int)$g['expires_at']));
    check(!$needsQuota || $g['remaining']===null || (int)$g['remaining']>0);
    return $g;
}
function inspect(PDO $db,string $digest,int $now): array {
    check(preg_match('/^[a-f0-9]{64}$/D',$digest)===1);
    return validGrant(one($db,'SELECT g.* FROM credentials c JOIN grants g ON g.id=c.grant_id WHERE c.digest=?',[$digest]),$now,true);
}
function privateMedia(string $root,array $m) {
    $base=realpath($root);
    check($base!==false && is_dir($base) && !is_link($root) && (fileperms($base)&0077)===0);
    check(!preg_match('~(?:^|/)(public_html|htdocs|www|dist|public)(?:/|$)~i',$base));
    $relative=$m['relative_path'];
    check(is_string($relative) && preg_match('/^[A-Za-z0-9_-]{1,120}\.(wav|mp3)$/iD',$relative)===1);
    $p=$base.DIRECTORY_SEPARATOR.$relative;
    check(!is_link($p) && is_file($p) && realpath($p)===$p && (fileperms($p)&0077)===0);
    $f=fopen($p,'rb');check(is_resource($f));
    try {
        $st=fstat($f);check($st!==false && $st['size']===(int)$m['bytes']);
        $ctx=hash_init('sha256');hash_update_stream($ctx,$f);check(hash_equals($m['sha256'],hash_final($ctx)));
        check(rewind($f));return $f;
    } catch(Throwable $e){fclose($f);throw $e;}
}
function media(PDO $db,array $g): array {
    $m=one($db,'SELECT * FROM media WHERE id=?',[$g['media_id']]);check($m!==null);return $m;
}
// GET confirmation MUST call inspect only. Explicit user-confirmed POST may call redeem.
// HTTP adapter, CSRF, rate limiting, private path configuration and log controls are separate gates.
function redeem(PDO $db,string $digest,string $root,int $now): string {
    $g=inspect($db,$digest,$now);$f=privateMedia($root,media($db,$g));fclose($f);
    $token=bin2hex(random_bytes(32));$tokenHash=hash('sha256',$token);
    $db->exec('BEGIN IMMEDIATE');
    try {
        $g=inspect($db,$digest,$now);
        $q=$db->prepare('UPDATE grants SET remaining=remaining-1 WHERE id=? AND remaining>0');
        if($g['remaining']!==null){$q->execute([$g['id']]);check($q->rowCount()===1);}
        $until=$now+3600;if($g['expires_at']!==null)$until=min($until,(int)$g['expires_at']);
        $q=$db->prepare('INSERT INTO sessions(digest,grant_id,expires_at) VALUES(?,?,?)');
        $q->execute([$tokenHash,$g['id'],$until]);
        $db->exec('COMMIT');return $token;
    }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
}
function sessionGrant(PDO $db,string $token,int $now): array {
    check(preg_match('/^[a-f0-9]{64}$/D',$token)===1);
    $s=one($db,'SELECT * FROM sessions WHERE digest=?',[hash('sha256',$token)]);
    check($s!==null && (int)$s['revoked']===0 && $now<(int)$s['expires_at']);
    return validGrant(one($db,'SELECT * FROM grants WHERE id=?',[$s['grant_id']]),$now,false);
}
function openDownload(PDO $db,string $token,string $root,int $now): array {
    $g=sessionGrant($db,$token,$now);$m=media($db,$g);return [privateMedia($root,$m),(int)$m['bytes']];
}
function byteRange(?string $header,int $size): array {
    check($size>0);
    if($header===null||$header==='')return [0,$size-1,200];
    check(strlen($header)<=100 && preg_match('/^bytes=(\d{0,18})-(\d{0,18})$/D',$header,$m)===1 && ($m[1]!==''||$m[2]!==''));
    if($m[1]===''){$n=(int)$m[2];check($n>0);$a=max(0,$size-$n);$b=$size-1;}
    else{$a=(int)$m[1];$b=$m[2]===''?$size-1:min($size-1,(int)$m[2]);check($a<$size && $a<=$b);}
    return [$a,$b,206];
}
