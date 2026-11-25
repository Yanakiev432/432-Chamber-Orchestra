#!/usr/bin/env python3
"""Synthetic-only loopback HTTP acceptance. No network except 127.0.0.1."""
import hashlib, http.client, json, os, pathlib, re, shutil, socket, sqlite3, subprocess, sys, tempfile, time
HERE=pathlib.Path(__file__).resolve().parent
PHP=sys.argv[1] if len(sys.argv)>1 else 'php'
n=0
def ok(v,label):
    global n
    if not v: raise RuntimeError(label)
    n+=1;print('PASS '+label,flush=True)
with tempfile.TemporaryDirectory(prefix='432-buyer-http-qa-') as td:
    root=pathlib.Path(td); os.chmod(str(root),0o700)
    for name in ['buyer-core.php','buyer-import.php','buyer-http-flow.php','buyer-http-adapter-v17.php']:
        shutil.copyfile(str(HERE/name),str(root/name))
    media=root/'vault';media.mkdir(mode=0o700)
    asset=media/'fixture.wav'; block=bytes(range(256))*4096
    with asset.open('wb') as f:
        for i in range(264):f.write(block)
        f.write(block[:277513728-264*len(block)])
    asset.chmod(0o600)
    second=media/'second.wav';second.write_bytes(b'SECOND RECORDING');second.chmod(0o600)
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
$f2=$c['media'].'/second.wav';$m[]=['productId'=>8,'downloadId'=>str_repeat('b',32),'privateFilename'=>'second.wav','sha256'=>hash_file('sha256',$f2),'bytes'=>filesize($f2)];$r2=$r[0];$r2['permission_id']=2;$r2['product_id']=8;$r2['download_id']=str_repeat('b',32);$r[]=$r2;
\Orchestra\Buyer\importSnapshot($db,$c['secret'],$m,$r,$c['media']);
"""
    (root/'init.php').write_text(init)
    subprocess.run([PHP,str(root/'init.php')],check=True,stdout=subprocess.DEVNULL)
    db.chmod(0o600)
    (root/'router.php').write_text("<?php require __DIR__.'/buyer-http-adapter-v17.php'; \\Orchestra\\Buyer\\serveFromEnvironment();")
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
                                # Python 3.6 SimpleCookie does not reliably recognize SameSite.
                                # Parse only the first name/value pair; never treat attributes as cookies.
                                pair=v.split(';',1)[0]
                                name,value=pair.split('=',1)
                                if not re.fullmatch(r'__Host-432-(browser|challenge|download)-[a-f0-9]{32}',name):
                                    raise RuntimeError('unexpected cookie name')
                                if not value or re.search(r'(?:^|;)\s*max-age=0(?:;|$)',v,re.I):
                                    jar.pop(name,None)
                                elif re.fullmatch(r'[a-f0-9]{64}',value):
                                    jar[name]=value
                                else:raise RuntimeError('unexpected cookie value format')
                    if stream:
                        h=hashlib.sha256();nbytes=0
                        for chunk in iter(lambda:r.read(1048576),b''):h.update(chunk);nbytes+=len(chunk)
                        data=(nbytes,h.hexdigest())
                    else:data=r.read()
                    return r.status,dict((k.lower(),v) for k,v in hs),data,hs
                finally:c.close()
            def remaining(g=1):
                with sqlite3.connect(str(db)) as c:return c.execute('select remaining from grants where id=?',(g,)).fetchone()[0]
            q='/?download_file=7&order=wc_order_TESTONLY&key='+('a'*32)+'&email=example%40example.invalid'
            ok(request('GET',q,extra={'Host':'wrong.invalid'},save=False)[0]==403,'wrong host denied')
            ok(request('GET','/not-a-route')[0]==404,'unknown route denied')
            ok(request('HEAD',q)[0]==405,'legacy HEAD denied without quota')
            ok(request('PUT',q)[0]==405,'unexpected method denied')
            ok(request('GET','/legacy-download/file/'+('a'*32))[0]==403,'anonymous download denied')
            r=request('GET',q);p1=r[1].get('location','');ok(r[0]==303 and re.fullmatch(r'/legacy-download/confirm/[a-f0-9]{32}',p1) is not None,'legacy URL non-bearer selector redirect')
            cs=[v for k,v in r[3] if k.lower()=='set-cookie']
            ok(len(cs)==2 and all('secure' in x.lower() and 'httponly' in x.lower() and 'samesite=lax' in x.lower() and 'path=/' in x.lower() and 'domain=' not in x.lower() for x in cs),'host-bound secure cookie attributes')
            ok(remaining()==1,'legacy GET preserves quota')
            ok(r[1].get('referrer-policy')=='no-referrer','legacy redirect no-referrer')
            q2=q.replace('download_file=7','download_file=8').replace('key='+('a'*32),'key='+('b'*32))
            r2=request('GET',q2);p2=r2[1].get('location','')
            ok(r2[0]==303 and p1!=p2,'independent second purchase challenge')
            ok(len(cookies)==4 and remaining(2)==1,'two pending challenges in one browser (cookie count={}, quota={})'.format(len(cookies),remaining(2)))
            ok(request('GET',p1,jar={},save=False)[0]==403,'selector alone is not a credential')
            r=request('GET',p1)
            ok(r[0]==200 and b'wc_order_' not in r[2] and b'example.invalid' not in r[2],'confirmation HTML excludes legacy credentials')
            ok(r[1].get('referrer-policy')=='same-origin','clean confirmation same-origin referrer')
            m=re.search(br'name="confirm" value="([a-f0-9]{64})"',r[2]);ok(m is not None,'CSRF confirmation value')
            body='confirm='+m.group(1).decode('ascii');h={'Content-Type':'application/x-www-form-urlencoded','Origin':origin}
            ok(request('POST',p1,body,dict(h,Origin='https://foreign.invalid'))[0]==403,'foreign origin denied')
            ok(request('POST',p1,'confirm='+('b'*64),h)[0]==403,'wrong CSRF denied')
            ok(request('POST',p1,body,h,jar={},save=False)[0]==403,'missing browser binding denied')
            ok(remaining()==1,'rejected POSTs preserve quota')
            old=dict(cookies);r=request('POST',p1,body,h)
            ok(r[0]==303 and re.fullmatch(r'/legacy-download/file/[a-f0-9]{32}',r[1].get('location','')) is not None and remaining()==0,'explicit POST consumes exactly one')
            f1=r[1]['location']
            ok(request('POST',p1,body,h,jar=old,save=False)[0]==403,'replay denied')
            r=request('GET',p2);m2=re.search(br'name="confirm" value="([a-f0-9]{64})"',r[2])
            ok(r[0]==200 and m2 is not None,'second challenge survives first confirmation')
            r=request('POST',p2,'confirm='+m2.group(1).decode('ascii'),h);f2=r[1].get('location','')
            ok(r[0]==303 and f2!=f1 and remaining(2)==0,'second independent confirmation')
            ok(request('GET',f2)[2]==b'SECOND RECORDING','second recording exact bytes')
            ok(request('GET',f1,jar={},save=False)[0]==403,'file selector alone denied')
            cookie1=[k for k in cookies if k.endswith(f1.rsplit('/',1)[1])][0]
            cookie2=[k for k in cookies if k.endswith(f2.rsplit('/',1)[1])][0]
            badjar=dict(cookies);badjar[cookie1]=badjar[cookie2]
            ok(request('GET',f1,jar=badjar,save=False)[0]==403,'swapped file cookie denied')
            ok(request('GET',f1+'?token=bad')[0]==403,'query token denied')
            r=request('HEAD',f1);ok(r[0]==200 and int(r[1]['content-length'])==size and r[2]==b'','HEAD metadata')
            r=request('GET',f1,extra={'Range':'bytes=10-19'})
            ok(r[0]==206 and r[1]['content-range']=='bytes 10-19/'+str(size) and r[2]==bytes(range(10,20)),'actual HTTP 206 range bytes')
            r=request('GET',f1,extra={'Range':'bytes='+str(size)+'-'})
            ok(r[0]==416 and r[1]['content-range']=='bytes */'+str(size),'actual HTTP 416')
            # Disconnect an actual HTTP client mid-body, then resume in the same authorized session.
            c=http.client.HTTPConnection('127.0.0.1',port,timeout=30)
            try:
                c.request('GET',f1,headers={'Host':host,'Cookie':'; '.join(k+'='+v for k,v in cookies.items())})
                partial=c.getresponse();prefix=partial.read(65536)
                ok(partial.status==200 and prefix==bytes(range(256))*256,'actual partial transfer before client disconnect')
            finally:
                c.close()
            r=request('GET',f1,extra={'Range':'bytes=65536-131071'})
            ok(r[0]==206 and r[2]==bytes(range(256))*256 and remaining()==0,'resume after actual disconnect without extra quota')
            started=time.monotonic()
            r=request('GET',f1,stream=True);ok(r[0]==200 and r[2]==(size,digest),'actual HTTP 200 277513728 bytes exact SHA-256')
            print('SYNTHETIC_TRANSFER seconds={:.3f} bytes={}'.format(time.monotonic()-started,size),flush=True)
            ok(r[1].get('cache-control')=='no-store, private' and r[1].get('referrer-policy')=='no-referrer','privacy response headers')
            ok(remaining()==0,'range and full transfer do not consume additional quota')
            # Seed expired synthetic state and test cleanup without altering active rights.
            now=int(time.time());future=now+3600
            with sqlite3.connect(str(db)) as c:
                c.execute("insert into challenges values(?,?,?,?)",('1'*64,'2'*64,'3'*64,now-10))
                c.execute("insert into sessions(digest,grant_id,expires_at) values(?,?,?)",('4'*64,1,now-10))
                c.execute("insert into throttle values(?,?,?)",('5'*64,now//300-3,1))
                c.execute("insert into throttle values(?,?,?)",('6'*64,now//300,1))
            # Direct CLI cleanup of the same synthetic DB, no production state.
            clean=(root/'clean.php')
            clean.write_text("<?php require __DIR__.'/buyer-http-adapter-v17.php'; $c=json_decode(file_get_contents(__DIR__.'/qa-config.json'),true); $db=new PDO('sqlite:'.$c['db']); echo json_encode(\\Orchestra\\Buyer\\cleanupExpired($db,time()));")
            cleanup=json.loads(subprocess.check_output([PHP,str(clean)]))
            ok(cleanup=={'challenges':1,'sessions':1,'throttle':1},'expired state removed only')
            with sqlite3.connect(str(db)) as c:
                ok(c.execute('select count(*) from grants').fetchone()[0]==2 and c.execute('select count(*) from sessions').fetchone()[0]==2 and c.execute("select count(*) from throttle where bucket=?",('6'*64,)).fetchone()[0]==1,'cleanup preserves grants, sessions and current rate windows')
                # Seed the current session limit to test denial without 60 large hashes.
                import hmac
                tokenhash=hashlib.sha256(cookies[cookie1].encode()).hexdigest()
                bucket=hmac.new(secret.encode(),('v17:file-session:'+tokenhash).encode(),hashlib.sha256).hexdigest()
                c.execute('insert or replace into throttle values(?,?,?)',(bucket,int(time.time())//300,60))
            r=request('GET',f1,extra={'Range':'bytes=0-1'})
            ok(r[0]==429 and r[1].get('retry-after')=='300','file-session rate limit before streaming')
            ok(request('GET',f2)[2]==b'SECOND RECORDING','other session remains usable')
            with sqlite3.connect(str(db)) as c:c.execute('update sessions set revoked=1')
            ok(request('GET',f1)[0]==403,'revoked session denied')
            print('FULL RESULT: {} PASS / 0 FAIL'.format(n),flush=True)
        finally:
            server.terminate()
            try:server.wait(timeout=5)
            except subprocess.TimeoutExpired:server.kill();server.wait()
