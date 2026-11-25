#!/usr/bin/env python3
"""Synthetic-only loopback HTTP acceptance. No network except 127.0.0.1."""
import hashlib, http.client, json, os, pathlib, re, shutil, socket, sqlite3, subprocess, sys, tempfile, time
from http.cookies import SimpleCookie
HERE=pathlib.Path(__file__).resolve().parent
PHP=sys.argv[1] if len(sys.argv)>1 else 'php'
n=0
def ok(v,label):
    global n
    if not v: raise RuntimeError(label)
    n+=1;print('PASS '+label,flush=True)
with tempfile.TemporaryDirectory(prefix='432-buyer-http-qa-') as td:
    root=pathlib.Path(td); os.chmod(str(root),0o700)
    for name in ['buyer-core.php','buyer-import.php','buyer-http-flow.php','buyer-http-adapter.php']:
        shutil.copyfile(str(HERE/name),str(root/name))
    media=root/'vault';media.mkdir(mode=0o700)
    asset=media/'fixture.wav'; block=bytes(range(256))*4096
    with asset.open('wb') as f:
        for i in range(264):f.write(block)
        f.write(block[:277513728-264*len(block)])
    asset.chmod(0o600)
    size=asset.stat().st_size
    digest_state=hashlib.sha256()
    with asset.open('rb') as f:
        for chunk in iter(lambda:f.read(1048576),b''):digest_state.update(chunk)
    digest=digest_state.hexdigest()
    with socket.socket() as s:
        s.bind(('127.0.0.1',0));port=s.getsockname()[1]
    host='127.0.0.1:'+str(port);origin='http://'+host
    db=root/'qa.sqlite'
    secret='TEST_ONLY_SYNTHETIC_'+('x'*64)
    config={'mode':'synthetic-loopback','host':host,'db':str(db),'media':str(media),'secret':secret}
    cf=root/'qa-config.json';cf.write_text(json.dumps(config));cf.chmod(0o600)
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
    (root/'router.php').write_text("<?php require __DIR__.'/buyer-http-adapter.php'; \\Orchestra\\Buyer\\serveFromEnvironment();")
    env=dict(os.environ,BUYER_PRIVATE_CONFIG=str(cf))
    # Synthetic server logs are kept only in a private temp file; never print them.
    with (root/'qa-server.log').open('wb') as log:
        server=subprocess.Popen([PHP,'-S',host,str(root/'router.php')],cwd=str(root),env=env,stdout=log,stderr=log)
        try:
            for i in range(60):
                try:
                    with socket.create_connection(('127.0.0.1',port),timeout=0.2):break
                except OSError:time.sleep(.1)
            else:raise RuntimeError('loopback startup failed')
            cookies={}
            def request(method,path,body=None,extra=None,jar=None,save=True,stream=False):
                jar=cookies if jar is None else jar
                headers={'Host':host}
                if jar:headers['Cookie']='; '.join(k+'='+v for k,v in jar.items())
                if extra:headers.update(extra)
                c=http.client.HTTPConnection('127.0.0.1',port,timeout=30)
                try:
                    c.request(method,path,body=body,headers=headers);r=c.getresponse();hs=r.getheaders()
                    if save:
                        for k,v in hs:
                            if k.lower()=='set-cookie':
                                sc=SimpleCookie();sc.load(v)
                                for name,m in sc.items():
                                    if not m.value:jar.pop(name,None)
                                    else:jar[name]=m.value
                    if stream:
                        h=hashlib.sha256();nbytes=0
                        for chunk in iter(lambda:r.read(1048576),b''):h.update(chunk);nbytes+=len(chunk)
                        data=(nbytes,h.hexdigest())
                    else:data=r.read()
                    return r.status,dict((k.lower(),v) for k,v in hs),data,hs
                finally:c.close()
            def remaining():
                with sqlite3.connect(str(db)) as c:return c.execute('select remaining from grants').fetchone()[0]
            q='/?download_file=7&order=wc_order_TESTONLY&key='+('a'*32)+'&email=example%40example.invalid'
            ok(request('GET',q,extra={'Host':'wrong.invalid'},save=False)[0]==403,'wrong host denied')
            ok(request('GET','/not-a-route')[0]==404,'unknown route denied')
            ok(request('HEAD',q)[0]==405,'legacy HEAD denied without quota')
            ok(request('PUT',q)[0]==405,'unexpected method denied')
            ok(request('GET','/legacy-download/file')[0]==403,'anonymous download denied')
            r=request('GET',q);ok(r[0]==303 and r[1].get('location')=='/legacy-download/confirm','legacy URL clean redirect')
            cs=[v for k,v in r[3] if k.lower()=='set-cookie']
            ok(len(cs)==2 and all('secure' in x.lower() and 'httponly' in x.lower() and 'samesite=lax' in x.lower() and 'path=/' in x.lower() and 'domain=' not in x.lower() for x in cs),'host-bound secure cookie attributes')
            ok(remaining()==1,'legacy GET preserves quota')
            ok(r[1].get('referrer-policy')=='no-referrer','legacy redirect no-referrer')
            r=request('GET','/legacy-download/confirm')
            ok(r[0]==200 and b'wc_order_' not in r[2] and b'example.invalid' not in r[2],'confirmation HTML excludes legacy credentials')
            ok(r[1].get('referrer-policy')=='same-origin','clean confirmation same-origin referrer')
            m=re.search(br'name="confirm" value="([a-f0-9]{64})"',r[2]);ok(m is not None,'CSRF confirmation value')
            body='confirm='+m.group(1).decode('ascii');h={'Content-Type':'application/x-www-form-urlencoded','Origin':origin}
            ok(request('POST','/legacy-download/confirm',body,dict(h,Origin='https://foreign.invalid'))[0]==403,'foreign origin denied')
            ok(request('POST','/legacy-download/confirm','confirm='+('b'*64),h)[0]==403,'wrong CSRF denied')
            ok(request('POST','/legacy-download/confirm',body,h,jar={},save=False)[0]==403,'missing browser binding denied')
            ok(remaining()==1,'rejected POSTs preserve quota')
            old=dict(cookies);r=request('POST','/legacy-download/confirm',body,h)
            ok(r[0]==303 and r[1].get('location')=='/legacy-download/file' and remaining()==0,'explicit POST consumes exactly one')
            ok(request('POST','/legacy-download/confirm',body,h,jar=old,save=False)[0]==403,'replay denied')
            ok(request('GET','/legacy-download/file?token=bad')[0]==403,'query token denied')
            r=request('HEAD','/legacy-download/file');ok(r[0]==200 and int(r[1]['content-length'])==size and r[2]==b'','HEAD metadata')
            r=request('GET','/legacy-download/file',extra={'Range':'bytes=10-19'})
            ok(r[0]==206 and r[1]['content-range']=='bytes 10-19/'+str(size) and r[2]==bytes(range(10,20)),'actual HTTP 206 range bytes')
            r=request('GET','/legacy-download/file',extra={'Range':'bytes='+str(size)+'-'})
            ok(r[0]==416 and r[1]['content-range']=='bytes */'+str(size),'actual HTTP 416')
            started=time.monotonic()
            r=request('GET','/legacy-download/file',stream=True);ok(r[0]==200 and r[2]==(size,digest),'actual HTTP 200 277513728 bytes exact SHA-256')
            print('SYNTHETIC_TRANSFER seconds={:.3f} bytes={}'.format(time.monotonic()-started,size),flush=True)
            ok(r[1].get('cache-control')=='no-store, private' and r[1].get('referrer-policy')=='no-referrer','privacy response headers')
            ok(remaining()==0,'range and full transfer do not consume additional quota')
            with sqlite3.connect(str(db)) as c:c.execute('update sessions set revoked=1')
            ok(request('GET','/legacy-download/file')[0]==403,'revoked session denied')
            print('FULL RESULT: {} PASS / 0 FAIL'.format(n),flush=True)
        finally:
            server.terminate()
            try:server.wait(timeout=5)
            except subprocess.TimeoutExpired:server.kill();server.wait()
