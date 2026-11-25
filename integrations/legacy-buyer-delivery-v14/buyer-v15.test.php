<?php
declare(strict_types=1);
use function Orchestra\Buyer\{httpSchema,importSnapshot,legacyExpiry,legacyQuota,parseLegacyQuery,inspect,challenge,confirm,transfer,throttle,safeHeaders,credential};
use Orchestra\Buyer\Denied;
require __DIR__.'/buyer-core.php';
require __DIR__.'/buyer-import.php';
require __DIR__.'/buyer-http-flow.php';
$n=0;
function ok(bool $yes,string $label):void{global $n;if(!$yes)throw new RuntimeException($label);echo "PASS $label\n";$n++;}
function deny(callable $fn,string $label):void{try{$fn();}catch(Denied $e){ok(true,$label);return;}throw new RuntimeException("NOT DENIED: ".$label);}
$root=sys_get_temp_dir().'/432-qa-v15-'.bin2hex(random_bytes(8));mkdir($root,0700);$p=$root.'/fixture.wav';file_put_contents($p,'0123456789');chmod($p,0600);
try {
$db=new PDO('sqlite::memory:');httpSchema($db);$secret=str_repeat('T',64);$id=str_repeat('a',32);$t=1800000000;
$cat=[['productId'=>7,'downloadId'=>$id,'privateFilename'=>'fixture.wav','sha256'=>hash_file('sha256',$p),'bytes'=>10]];
$row=['permission_id'=>1,'product_id'=>7,'download_id'=>$id,'email'=>'example@example.invalid','billing_email'=>'example@example.invalid','order_key'=>'wc_order_TESTONLY','verified_order_key'=>'wc_order_TESTONLY','remaining'=>'1','expires'=>null,'enabled'=>true];
$bad=$row;$bad['verified_order_key']='wc_order_WRONG';
deny(fn()=>importSnapshot($db,$secret,$cat,[$bad],$root),'order mismatch');
ok((int)$db->query('SELECT COUNT(*) FROM media')->fetchColumn()===0,'failed import rolls back');
$bad=$row;$bad['email']='other@example.invalid';deny(fn()=>importSnapshot($db,$secret,$cat,[$bad],$root),'identity mismatch');
$bad=$row;$bad['download_id']=str_repeat('b',32);deny(fn()=>importSnapshot($db,$secret,$cat,[$bad],$root),'missing catalog relation');
ok(importSnapshot($db,$secret,$cat,[$row],$root)===['grants'=>1,'credentials'=>2,'media'=>1,'enabled'=>1,'unlimited'=>0],'exact manifest import');
deny(fn()=>importSnapshot($db,$secret,$cat,[$row],$root),'reject import over existing state');
ok(legacyExpiry('2026-11-25 00:00:00')===strtotime('2026-11-26T00:00:00Z'),'inclusive UTC expiry day');
ok(legacyExpiry(null)===null && legacyQuota('')===null && legacyQuota('0')===0,'unlimited and zero preserved');
deny(fn()=>legacyExpiry('2026-02-30 00:00:00'),'invalid date');
deny(fn()=>legacyQuota('-1'),'negative quota');
$q='download_file=7&order=wc_order_TESTONLY&key='.$id.'&email=example%40example.invalid';
$dig=parseLegacyQuery($q,$secret);
ok(inspect($db,$dig,$t)['id']===1,'legacy email link');
$uid='download_file=7&order=wc_order_TESTONLY&key='.$id.'&uid='.hash('sha256',$row['billing_email']);
ok(inspect($db,parseLegacyQuery($uid,$secret),$t)['id']===1,'legacy UID link');
foreach(['&key='.$id,'&email=x','&uid='.str_repeat('a',64),'&unknown=x','&x=%zz'] as $extra)deny(fn()=>parseLegacyQuery($q.$extra,$secret),'reject ambiguous or extra field');
deny(fn()=>parseLegacyQuery(str_replace('example%40','%00example%40',$q),$secret),'control byte rejected');
$browser=bin2hex(random_bytes(32));$c=challenge($db,$dig,$browser,$t);
ok((int)$db->query('SELECT remaining FROM grants')->fetchColumn()===1,'GET challenge does not consume quota');
deny(fn()=>confirm($db,$c,str_repeat('b',64),$root,$t),'wrong browser');
deny(fn()=>confirm($db,$c,$browser,$root,$t+600),'expired confirmation');
$db->exec("CREATE TRIGGER force_failure BEFORE INSERT ON sessions BEGIN SELECT RAISE(ABORT,'QA_FAILURE'); END");
try{confirm($db,$c,$browser,$root,$t);throw new RuntimeException('expected failure');}catch(PDOException $e){ok((int)$db->query('SELECT remaining FROM grants')->fetchColumn()===1 && (int)$db->query('SELECT COUNT(*) FROM challenges')->fetchColumn()===1,'atomic rollback of confirmation');}
$db->exec('DROP TRIGGER force_failure');
$token=confirm($db,$c,$browser,$root,$t);
ok((int)$db->query('SELECT remaining FROM grants')->fetchColumn()===0,'explicit confirmation consumes exactly one');
deny(fn()=>confirm($db,$c,$browser,$root,$t),'confirmation replay');
$x=transfer($db,$token,$root,$t+10,'bytes=2-5');
ok($x['status']===206&&$x['headers']['Content-Range']==='bytes 2-5/10'&&$x['headers']['Content-Length']==='4'&&fread($x['stream'],$x['length'])==='2345','partial response bytes and headers');fclose($x['stream']);
$x=transfer($db,$token,$root,$t+20,null);ok($x['status']===200&&stream_get_contents($x['stream'])==='0123456789','resume/full transfer without new quota');fclose($x['stream']);
deny(fn()=>transfer($db,$token,$root,$t+3600,null),'session expiry');
throttle($db,$secret,'192.0.2.1',$t,2);throttle($db,$secret,'192.0.2.1',$t,2);deny(fn()=>throttle($db,$secret,'192.0.2.1',$t,2),'rate limit');
throttle($db,$secret,'192.0.2.1',$t+300,2);ok(true,'new rate window');
ok(safeHeaders()['Referrer-Policy']==='no-referrer'&&safeHeaders()['Cache-Control']==='no-store, private','privacy headers');
echo "FULL RESULT: $n PASS / 0 FAIL\n";
}finally{unlink($p);rmdir($root);}
