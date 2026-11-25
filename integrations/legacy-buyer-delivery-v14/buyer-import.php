<?php
declare(strict_types=1);
namespace Orchestra\Buyer;
use PDO;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

// Woo uses UTC as PHP default and checks expiry against midnight. A date is valid through that UTC day.
function legacyExpiry(?string $date): ?int {
    if ($date===null || $date==='') return null;
    $tz=new DateTimeZone('UTC');
    $v=DateTimeImmutable::createFromFormat('!Y-m-d H:i:s',$date,$tz);
    check($v!==false && $v->format('Y-m-d H:i:s')===$date);
    return $v->setTime(0,0)->modify('+1 day')->getTimestamp();
}
function legacyQuota(mixed $value): ?int {
    if ($value===null || $value==='') return null;
    check((is_int($value)||is_string($value)) && preg_match('/^(0|[1-9][0-9]{0,8})$/D',(string)$value)===1);
    return (int)$value;
}
// Input is an operator-verified, normalized snapshot; no source credentials are stored.
function importSnapshot(PDO $db,string $secret,array $catalog,array $rows,string $root): array {
    check(strlen($secret)>=32 && count($catalog)>0 && count($rows)>0);
    $index=[];$mediaIndex=[];
    foreach($catalog as $m){
        check(is_int($m['productId']??null) && $m['productId']>0 && preg_match('/^[a-f0-9]{32}$/D',$m['downloadId']??'')===1
            && preg_match('/^[a-f0-9]{64}$/D',$m['sha256']??'')===1 && is_int($m['bytes']??null) && $m['bytes']>0);
        $pair=$m['productId'].':'.$m['downloadId'];
        check(!isset($index[$pair]));
        $entry=['id'=>$m['sha256'],'relative_path'=>$m['privateFilename'],'sha256'=>$m['sha256'],'bytes'=>$m['bytes']];
        if(isset($mediaIndex[$entry['id']]))check($mediaIndex[$entry['id']]===$entry);
        else{$f=privateMedia($root,$entry);fclose($f);$mediaIndex[$entry['id']]=$entry;}
        $index[$pair]=$entry['id'];
    }
    $db->exec('BEGIN IMMEDIATE');
    try {
        foreach(['media','grants','credentials','sessions'] as $table)check((int)$db->query('SELECT COUNT(*) FROM '.$table)->fetchColumn()===0);
        $ins=$db->prepare('INSERT INTO media VALUES(?,?,?,?)');
        foreach($mediaIndex as $m)$ins->execute([$m['id'],$m['relative_path'],$m['sha256'],$m['bytes']]);
        $g=$db->prepare('INSERT INTO grants VALUES(?,?,?,?,?)');
        $c=$db->prepare('INSERT INTO credentials VALUES(?,?)');
        $enabled=0;$unlimited=0;
        foreach($rows as $r){
            check(is_int($r['permission_id']??null) && $r['permission_id']>0 && is_int($r['product_id']??null) &&
                is_bool($r['enabled']??null) && is_string($r['email']??null) && is_string($r['billing_email']??null)
                && hash_equals(strtolower(trim($r['billing_email'])),strtolower(trim($r['email'])))
                && is_string($r['order_key']??null) && is_string($r['verified_order_key']??null)
                && hash_equals($r['verified_order_key'],$r['order_key']));
            $pair=$r['product_id'].':'.$r['download_id'];check(isset($index[$pair]));
            $quota=legacyQuota($r['remaining']);$expiry=legacyExpiry($r['expires']);
            $g->execute([$r['permission_id'],$index[$pair],$quota,$expiry,(int)$r['enabled']]);
            foreach(['email'=>$r['email'],'uid'=>hash('sha256',$r['billing_email'])] as $kind=>$identity){
                $digest=credential($secret,$r['product_id'],$r['download_id'],$r['order_key'],$kind,$identity);
                $c->execute([$digest,$r['permission_id']]);
            }
            $enabled+=(int)$r['enabled'];$unlimited+=(int)($quota===null);
        }
        $db->exec('COMMIT');
        return ['grants'=>count($rows),'credentials'=>2*count($rows),'media'=>count($mediaIndex),'enabled'=>$enabled,'unlimited'=>$unlimited];
    }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
}
