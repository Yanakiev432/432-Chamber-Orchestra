<?php
declare(strict_types=1);
use function Orchestra\Buyer\{schema,credential,inspect,redeem,sessionGrant,openDownload,byteRange};
use Orchestra\Buyer\Denied;
require __DIR__.'/buyer-core.php';
$n=0;
function ok(bool $yes,string $label):void{global $n;if(!$yes)throw new RuntimeException($label);echo "PASS $label\n";$n++;}
function denies(callable $fn,string $label):void{try{$fn();}catch(Denied $e){ok(true,$label);return;}throw new RuntimeException("NOT DENIED: ".$label);}
$root=sys_get_temp_dir().'/432-buyer-qa-'.bin2hex(random_bytes(8));
mkdir($root,0700);$p=$root.'/fixture.wav';file_put_contents($p,'0123456789');chmod($p,0600);
$db=new PDO('sqlite::memory:');schema($db);$t=1800000000;$secret=str_repeat('T',64);$id=str_repeat('a',32);
$make=fn($prod=7,$file=null,$order='wc_order_TESTONLY',$kind='email',$identity='example@example.invalid')=>credential($secret,$prod,$file??$id,$order,$kind,$identity);
try {
$db->prepare('INSERT INTO media VALUES(?,?,?,?)')->execute(['m','fixture.wav',hash_file('sha256',$p),10]);
$db->exec("INSERT INTO grants VALUES(1,'m',1,NULL,1),(2,'m',NULL,NULL,1),(3,'m',1,1799999999,1),(4,'m',2,NULL,0),(5,'m',0,NULL,1)");
$insert=$db->prepare('INSERT INTO credentials VALUES(?,?)');$dig=$make();$uid=$make(7,null,'wc_order_TESTONLY','uid',hash('sha256','example@example.invalid'));
$insert->execute([$dig,1]);$insert->execute([$uid,1]);foreach([2,3,4,5] as $g)$insert->execute([$make($g),$g]);
ok(inspect($db,$dig,$t)['id']==1,'old email tuple');
ok(inspect($db,$uid,$t)['id']==1,'old uid tuple');
ok($make(7,null,'wc_order_TESTONLY','email','EXAMPLE@example.invalid')===$dig,'email normalization');
denies(fn()=>inspect($db,$make(7,null,'wc_order_OTHER'),$t),'wrong order');
denies(fn()=>inspect($db,$make(8),$t),'wrong product');
denies(fn()=>inspect($db,$make(7,str_repeat('b',32)),$t),'wrong download');
denies(fn()=>inspect($db,$make(7,null,'wc_order_TESTONLY','email','other@example.invalid'),$t),'wrong email');
denies(fn()=>credential($secret,7,$id,'invalid','email','example@example.invalid'),'malformed order');
denies(fn()=>inspect($db,$make(3),$t),'expired');
denies(fn()=>inspect($db,$make(4),$t),'disabled');
denies(fn()=>inspect($db,$make(5),$t),'exhausted');
ok((int)$db->query('SELECT remaining FROM grants WHERE id=1')->fetchColumn()===1,'inspect never consumes');
file_put_contents($p,'tampered!!');denies(fn()=>redeem($db,$dig,$root,$t),'tampered asset denied');
ok((int)$db->query('SELECT remaining FROM grants WHERE id=1')->fetchColumn()===1,'tampering no quota consumed');file_put_contents($p,'0123456789');
$token=redeem($db,$dig,$root,$t);
ok((int)$db->query('SELECT remaining FROM grants WHERE id=1')->fetchColumn()===0,'atomic decrement');
ok($db->query('SELECT digest FROM sessions')->fetchColumn()===hash('sha256',$token),'token hash only');
denies(fn()=>redeem($db,$uid,$root,$t),'aliases share one quota');
[$f,$size]=openDownload($db,$token,$root,$t+10);ok(stream_get_contents($f)==='0123456789'&&$size===10,'private bytes match');fclose($f);
ok(sessionGrant($db,$token,$t+30)['id']==1,'session resume after zero remaining');
ok(byteRange('bytes=2-5',10)===[2,5,206],'bounded range');
ok(byteRange('bytes=7-',10)===[7,9,206],'open ended range');
ok(byteRange('bytes=-3',10)===[7,9,206],'suffix range');
ok(byteRange(null,10)===[0,9,200],'full range');
denies(fn()=>byteRange('bytes=10-',10),'outside range');
denies(fn()=>byteRange('bytes=0-1,3-4',10),'multi range denied');
denies(fn()=>byteRange('bytes=-0',10),'zero suffix denied');
denies(fn()=>sessionGrant($db,$token,$t+3600),'session expiry');
denies(fn()=>sessionGrant($db,str_repeat('b',64),$t),'wrong token');
$db->prepare('UPDATE sessions SET revoked=1 WHERE digest=?')->execute([hash('sha256',$token)]);denies(fn()=>sessionGrant($db,$token,$t),'revocation');
$u=redeem($db,$make(2),$root,$t);$u2=redeem($db,$make(2),$root,$t);
ok($u!==$u2&&$db->query('SELECT remaining FROM grants WHERE id=2')->fetchColumn()===null,'unlimited preserved');
$db->exec('UPDATE grants SET enabled=0 WHERE id=2');denies(fn()=>sessionGrant($db,$u,$t),'grant disable revokes sessions');
$db->exec('UPDATE grants SET enabled=1 WHERE id=2');unlink($p);symlink('/etc/hosts',$p);denies(fn()=>openDownload($db,$u,$root,$t),'symlink denied');unlink($p);
// Real two-connection SQLite locking and rollback with synthetic file-backed database.
$dbpath=$root.'/qa.sqlite';
file_put_contents($p,'0123456789');chmod($p,0600);
$a=new PDO('sqlite:'.$dbpath);schema($a);chmod($dbpath,0600);
$b=new PDO('sqlite:'.$dbpath);schema($b);$b->exec('PRAGMA busy_timeout=20');
$a->prepare('INSERT INTO media VALUES(?,?,?,?)')->execute(['m','fixture.wav',hash_file('sha256',$p),10]);
$a->exec("INSERT INTO grants VALUES(1,'m',1,NULL,1)");
$a->prepare('INSERT INTO credentials VALUES(?,?)')->execute([$dig,1]);
$a->exec("CREATE TRIGGER force_failure BEFORE INSERT ON sessions BEGIN SELECT RAISE(ABORT,'QA_FAILURE'); END");
try{redeem($a,$dig,$root,$t);throw new RuntimeException('rollback not triggered');}catch(PDOException $e){ok((int)$a->query('SELECT remaining FROM grants')->fetchColumn()===1 && (int)$a->query('SELECT COUNT(*) FROM sessions')->fetchColumn()===0,'failed session insert rolls back quota');}
$a->exec('DROP TRIGGER force_failure');
$a->exec('BEGIN IMMEDIATE');
try{redeem($b,$dig,$root,$t);throw new RuntimeException('lock not enforced');}catch(PDOException $e){ok((int)$e->errorInfo[1]===5,'second connection denied while writer holds lock');}finally{$a->exec('ROLLBACK');}
$last=redeem($b,$dig,$root,$t);
denies(fn()=>redeem($a,$dig,$root,$t),'second connection cannot overspend last quota');
ok((int)$a->query('SELECT COUNT(*) FROM sessions')->fetchColumn()===1,'exactly one committed session');
$a=null;$b=null;unlink($dbpath);
echo "FULL RESULT: $n PASS / 0 FAIL\n";
}finally{if(is_file($p)||is_link($p))unlink($p);rmdir($root);}
