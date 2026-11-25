#!/usr/bin/env python3
"""Temporary authenticated synthetic HTTPS test on approved Astro preview.
Run only from an operator-created private QA directory. No production or real grants.
"""
import concurrent.futures, fcntl, hashlib, http.client, json, os, pathlib, re, secrets, shutil, ssl, subprocess, sys, time
root=pathlib.Path(__file__).resolve().parent
if root.stat().st_mode & 0o077:raise RuntimeError('private QA directory required')
host='preview.432hz-orchestra.com'
preview=pathlib.Path(sys.argv[1]).resolve()
if not preview.is_dir() or preview.name!=host:raise RuntimeError('preview scope mismatch')
PHP=sys.argv[2]
prefix='/buyer-qa-'+secrets.token_hex(12)
public=preview/prefix[1:]
vault=root/'vault';vault.mkdir(mode=0o700)
locks=root/'locks';locks.mkdir(mode=0o700)
for i in range(2):
    p=locks/('slot-%d.lock'%i);p.touch(mode=0o600);p.chmod(0o600)
asset=vault/'fixture.wav';data=bytes(range(256))*4096
with asset.open('wb') as f:
    for i in range(16):f.write(data)
asset.chmod(0o600)
size=asset.stat().st_size;sha=hashlib.sha256(asset.read_bytes()).hexdigest()
db=root/'qa.sqlite'
key=secrets.token_hex(32)
cfg={'mode':'synthetic-https-preview','host':host,'prefix':prefix,'syntheticOnly':True,'qaKey':key,'qaExpires':int(time.time())+600,'db':str(db),'media':str(vault),'secret':secrets.token_hex(32),'lockDirectory':str(locks),'maxStreams':2}
config=root/'qa-config.json';config.write_text(json.dumps(cfg));config.chmod(0o600)
init=r"""<?php
require __DIR__.'/buyer-core.php';require __DIR__.'/buyer-import.php';require __DIR__.'/buyer-http-flow.php';
$c=json_decode(file_get_contents(__DIR__.'/qa-config.json'),true);$db=new PDO('sqlite:'.$c['db']);\Orchestra\Buyer\httpSchema($db);
$f=$c['media'].'/fixture.wav';$id=str_repeat('a',32);
$m=[['productId'=>7,'downloadId'=>$id,'privateFilename'=>'fixture.wav','sha256'=>hash_file('sha256',$f),'bytes'=>filesize($f)]];
$r=[['permission_id'=>1,'product_id'=>7,'download_id'=>$id,'email'=>'example@example.invalid','billing_email'=>'example@example.invalid','order_key'=>'wc_order_TESTONLY','verified_order_key'=>'wc_order_TESTONLY','remaining'=>'1','expires'=>null,'enabled'=>true]];
\Orchestra\Buyer\importSnapshot($db,$c['secret'],$m,$r,$c['media']);
"""
(root/'init.php').write_text(init)
subprocess.run([PHP,str(root/'init.php')],check=True,stdout=subprocess.DEVNULL)
db.chmod(0o600)
n=0
def ok(v,label):
    global n
    if not v:raise RuntimeError(label)
    n+=1;print('PASS '+label,flush=True)
cookies={}
def request(method,path,body=None,extra=None,auth=True,jar=None,save=True):
    jar=cookies if jar is None else jar
    headers={}
    if auth:headers['X-432-QA-Key']=key
    if jar:headers['Cookie']='; '.join(k+'='+v for k,v in jar.items())
    if extra:headers.update(extra)
    c=http.client.HTTPSConnection(host,443,timeout=30,context=ssl.create_default_context())
    try:
        c.request(method,path,body=body,headers=headers);r=c.getresponse();hs=r.getheaders();b=r.read()
        if save:
            for k,v in hs:
                if k.lower()=='set-cookie':
                    name,value=v.split(';',1)[0].split('=',1)
                    if not value or re.search(r'(?:^|;)\s*max-age=0(?:;|$)',v,re.I):jar.pop(name,None)
                    elif re.fullmatch(r'__Host-432-(browser|challenge|download)-[a-f0-9]{32}',name) and re.fullmatch(r'[a-f0-9]{64}',value):jar[name]=value
                    else:raise RuntimeError('unexpected cookie format')
        return r.status,dict((k.lower(),v) for k,v in hs),b,hs
    finally:c.close()
created_public=False
try:
    public.mkdir(mode=0o755);created_public=True;public.chmod(0o755)
    # No secrets or data under the document root. Only a private-config pointer and routing.
    entry="<?php require "+repr(str(root/'buyer-http-adapter-v18.php'))+"; \\Orchestra\\Buyer\\serve(json_decode(file_get_contents("+repr(str(config))+"),true));"
    (public/'index.php').write_text(entry);(public/'index.php').chmod(0o644)
    rules="""Options -Indexes
DirectoryIndex index.php
<IfModule mime_module>
AddHandler application/x-httpd-ea-php84 .php
</IfModule>
RewriteEngine On
RewriteRule ^legacy-download/(confirm|file)/[a-f0-9]{32}$ index.php [END]
"""
    (public/'.htaccess').write_text(rules);(public/'.htaccess').chmod(0o644)
    q=prefix+'/?download_file=7&order=wc_order_TESTONLY&key='+('a'*32)+'&email=example%40example.invalid'
    r=request('GET',q,auth=False);print('UNAUTH_STATUS',r[0],'APP_DENIAL',b'Download unavailable.' in r[2],flush=True);ok(r[0]==403 and b'Download unavailable.' in r[2],'actual HTTPS staging authorization gate')
    r=request('GET',q)
    print('INITIAL_STATUS',r[0],'APP_DENIAL',b'Download unavailable.' in r[2],'BODY_BYTES',len(r[2]),flush=True)
    p=r[1].get('location','')
    ok(r[0]==303 and re.fullmatch(re.escape(prefix)+r'/legacy-download/confirm/[a-f0-9]{32}',p) is not None,'Apache PHP route and verified TLS clean redirect')
    cs=[v for k,v in r[3] if k.lower()=='set-cookie']
    ok(len(cs)==2 and all('secure' in x.lower() and 'httponly' in x.lower() and 'samesite=lax' in x.lower() for x in cs),'actual TLS secure cookie attributes')
    ok(r[1].get('referrer-policy')=='no-referrer','legacy response privacy')
    r=request('GET',p)
    ok(r[0]==200 and b'wc_order_' not in r[2],'actual Apache confirmation rewrite')
    ok([v for k,v in r[3] if k.lower()=='referrer-policy']==['same-origin'],'confirmation has exactly one same-origin referrer policy')
    m=re.search(br'name="confirm" value="([a-f0-9]{64})"',r[2]);ok(m is not None,'confirmation form generated')
    body='confirm='+m.group(1).decode('ascii');h={'Content-Type':'application/x-www-form-urlencoded','Origin':'https://'+host}
    r=request('POST',p,body,dict(h,Origin='https://foreign.invalid'));ok(r[0]==403,'foreign origin denied on HTTPS')
    # Hold all slots to verify confirmation backpressure preserves quota.
    import sqlite3
    held=[open(str(locks/('slot-%d.lock'%i)),'r+b') for i in range(2)]
    for f in held:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
    try:
        r=request('POST',p,body,h);ok(r[0]==503 and r[1].get('retry-after')=='10','global slots deny confirmation before quota consumption')
        with sqlite3.connect(str(db)) as c:ok(c.execute('select remaining from grants').fetchone()[0]==1,'quota preserved under slot exhaustion')
    finally:
        for f in held:f.close()
    r=request('POST',p,body,h);file=r[1].get('location','')
    ok(r[0]==303 and re.fullmatch(re.escape(prefix)+r'/legacy-download/file/[a-f0-9]{32}',file) is not None,'HTTPS confirmation succeeds after lock release')
    ok(request('GET',file,jar={},save=False)[0]==403,'URL selector cannot authorize')
    held=[open(str(locks/('slot-%d.lock'%i)),'r+b') for i in range(2)]
    for f in held:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
    try:
        r=request('GET',file,extra={'Range':'bytes=0-1'})
        ok(r[0]==503 and r[1].get('retry-after')=='10','file transfer refused when all global slots held')
    finally:
        for f in held:f.close()
    r=request('GET',file,extra={'Range':'bytes=10-19'})
    ok(r[0]==206 and r[2]==bytes(range(10,20)) and r[1].get('content-range')=='bytes 10-19/'+str(size),'actual TLS range exact bytes')
    r=request('GET',file,extra={'Range':'bytes='+str(size)+'-'})
    ok(r[0]==416 and r[1].get('content-range')=='bytes */'+str(size),'actual TLS invalid range')
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(request,'GET',file,extra={'Range':'bytes=%d-%d'%(i,i+65535)},jar=dict(cookies),save=False) for i in (0,65536)]
        results=[f.result() for f in futures]
    ok(all(r[0]==206 and r[2]==bytes(range(256))*256 for r in results),'two bounded concurrent HTTPS requests')
    r=request('GET',file);ok(r[0]==200 and len(r[2])==size and hashlib.sha256(r[2]).hexdigest()==sha,'actual TLS 16 MiB exact SHA256')
    with sqlite3.connect(str(db)) as c:ok(c.execute('select remaining from grants').fetchone()[0]==0,'all transfers use one quota')
    ok(r[1].get('cache-control','').find('no-store')>=0,'no-store response')
    print('FULL RESULT: %d PASS / 0 FAIL'%n,flush=True)
finally:
    if created_public and public.is_dir():
        for name in ['index.php','.htaccess']:
            p=public/name
            if p.exists():p.unlink()
        public.rmdir()
    print('PUBLIC_QA_REMOVED',not public.exists(),flush=True)
