#!/usr/bin/env python3
"""Rehearse Apache V4 -> V6 16 redirects -> V4 rollback on isolated WSL Apache.

Pure temporary fixture on 127.0.0.1 dynamic TLS port. No Docker, root,
outside traffic, network downloads, production files or secrets.
All requests are targeted exclusively at the isolated loopback Apache process.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import socket
import subprocess
import sys
import tempfile
import time
from urllib.parse import quote, unquote, urlsplit

BASE = Path(__file__).resolve().parent.parent
PLAN = BASE / "docs/wordpress-route-disposition-20261111.json"
V4_HASH = "8fbb14f21ec3df1444f8203508181008e81f69f9b382b6b41370d902139142ae"
V6_HASH = "ae9148bec5c7b701d6699c191c37d2f5505766c208f2836d75f73c7d29eee907"
HOSTS = ("432hz-orchestra.com", "www.432hz-orchestra.com")
NESTED = ("432hz-foundation.com", "432project.432hz-orchestra.com")


def require(value: bool, why: str):
    if not value:
        raise RuntimeError(why)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    p=argparse.ArgumentParser()
    p.add_argument("--v4",required=True,type=Path)
    p.add_argument("--v6",required=True,type=Path)
    p.add_argument("--private-receipt",required=True,type=Path)
    args=p.parse_args()
    v4=args.v4.read_bytes()
    v6=args.v6.read_bytes()
    require(digest(v4)==V4_HASH and digest(v6)==V6_HASH, "APACHE_CANDIDATE_HASH_DRIFT")
    require(not args.private_receipt.exists(), "REFUSE_RECEIPT_OVERWRITE")
    require("432-Orchestra-Security-QA" in args.private_receipt.resolve().parts,
            "NOT_PRIVATE_QA_RECEIPT")
    plan=json.loads(PLAN.read_text(encoding="utf-8-sig"))
    aliases=plan["proposals"]
    excluded=plan["exclusions"]["sources"]
    require(len(aliases)==16 and len(excluded)==13,"ROUTE_SNAPSHOT_DRIFT")
    require(not plan["productionCutoverApproved"],"UNEXPECTED_PRODUCTION_APPROVAL")
    require(not any(x["approved"] or x["deployed"] for x in aliases),"UNEXPECTED_REDIRECT_APPROVAL")
    require(os.name=="posix", "REQUIRES_LOCAL_LINUX_APACHE_FIXTURE")
    module_dir=Path("/usr/lib/apache2/modules")
    # Ubuntu Apache 2.4 builds unixd statically, not as a .so module.
    mod_names=["mpm_event","authz_core","authz_host","access_compat","dir",
               "mime","alias","rewrite","ssl","socache_shmcb","setenvif"]
    required=[module_dir/("mod_"+x+".so") for x in mod_names]
    require(all(x.is_file() for x in required),"APACHE_2_4_MODULES_NOT_INSTALLED")
    require(Path("/usr/sbin/apache2").exists() and Path("/usr/bin/openssl").exists(),
            "APACHE_OR_OPENSSL_MISSING")
    with socket.socket() as sock:
        sock.bind(("127.0.0.1",0))
        port=sock.getsockname()[1]
    with tempfile.TemporaryDirectory(prefix="432-v6-apache-isolated-") as temp:
        root=Path(temp)
        doc=root/"main"
        doc.mkdir()
        (root/"logs").mkdir()
        (root/"runtime").mkdir()
        # Create precisely the alias targets as static fixture pages.
        for proposal in aliases:
            target=proposal["target"]
            d=doc/target.lstrip("/")
            d.mkdir(parents=True,exist_ok=True)
            (d/"index.html").write_text("432_TEMP_STATIC_LANDING",encoding="utf-8")
        for path,text in (
            ("bg/index.html","BG_ASTRO_TEMP"),
            ("en/index.html","EN_ASTRO_TEMP"),
            ("robots.txt","STATIC_ROBOTS_TEMP"),
            ("wp-admin/index.html","FORBIDDEN_WP_ADMIN"),
            ("wp-content/uploads/2016/paid.wav","FORBIDDEN_PAID_MASTER"),
            ("wp-json/index.html","FORBIDDEN_API"),
            ("wp-login.php","FORBIDDEN_PHP"),
            ("432hz-foundation.com/index.html","FOUNDATION_PRESERVED"),
            ("432project.432hz-orchestra.com/index.php","PROJECT_PRESERVED"),
            ("432project.432hz-orchestra.com/wp-content/uploads/asset.txt","PROJECT_UPLOAD_PRESERVED"),
        ):
            f=doc/path
            f.parent.mkdir(parents=True,exist_ok=True)
            f.write_text(text,encoding="utf-8")
        (doc/"432project.432hz-orchestra.com"/".htaccess").write_text(
            "RewriteEngine On\nRewriteRule ^old$ / [R=302,L]\n",encoding="utf8")
        root_ht=doc/".htaccess"
        root_ht.write_bytes(v4)
        # Isolated TLS certificate generated, consumed and erased in temp directory.
        cert=root/"test.crt"
        key=root/"test.key"
        ssl=subprocess.run(
            ["/usr/bin/openssl","req","-x509","-newkey","rsa:2048",
             "-nodes","-days","1","-subj","/CN=localhost",
             "-keyout",str(key),"-out",str(cert)],
            stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=15)
        require(ssl.returncode==0,"ISOLATED_CERTIFICATE_GENERATION_FAILED")
        modules="\n".join(
            "LoadModule "+("mpm_event_module" if x=="mpm_event" else x+"_module")
            +" "+str(module_dir/("mod_"+x+".so")) for x in mod_names)
        host_config=f"""ServerRoot "{root}"
ServerName localhost
PidFile "{root}/runtime/apache.pid"
DefaultRuntimeDir "{root}/runtime"
Listen 127.0.0.1:{port}
ErrorLog "{root}/logs/error.log"
LogLevel warn
{modules}
TypesConfig /etc/mime.types
DirectoryIndex index.html index.php
<Directory />
 Require all denied
</Directory>
<Directory "{doc}">
 AllowOverride All
 Options FollowSymLinks Indexes
 Require all granted
</Directory>
<VirtualHost 127.0.0.1:{port}>
 ServerName 432hz-orchestra.com
 ServerAlias www.432hz-orchestra.com
 DocumentRoot "{doc}"
 SSLEngine On
 SSLCertificateFile "{cert}"
 SSLCertificateKeyFile "{key}"
</VirtualHost>
<VirtualHost 127.0.0.1:{port}>
 ServerName 432hz-foundation.com
 DocumentRoot "{doc}/432hz-foundation.com"
 SSLEngine On
 SSLCertificateFile "{cert}"
 SSLCertificateKeyFile "{key}"
</VirtualHost>
<VirtualHost 127.0.0.1:{port}>
 ServerName 432project.432hz-orchestra.com
 DocumentRoot "{doc}/432project.432hz-orchestra.com"
 SSLEngine On
 SSLCertificateFile "{cert}"
 SSLCertificateKeyFile "{key}"
</VirtualHost>
"""
        conf=root/"apache.conf"
        conf.write_text(host_config,encoding="utf8")
        syntax=subprocess.run(["/usr/sbin/apache2","-f",str(conf),"-t"],
                              stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=20)
        require(syntax.returncode==0,"APACHE_VHOST_CONFIG_SYNTAX_FAILED")
        proc=subprocess.Popen(["/usr/sbin/apache2","-f",str(conf),"-DFOREGROUND"],
                              stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,
                              stderr=subprocess.DEVNULL,start_new_session=True)
        requests=0
        aliases_checked=0
        galleries_checked=0
        protected_checked=0
        neighbor_checked=0
        rollback_cases=0
        def hit(host: str, path: str, expect: int, target: str|None=None):
            nonlocal requests
            requrl=urlsplit(path)
            url="https://"+host+quote(requrl.path,safe="/%")+("?"+requrl.query if requrl.query else "")
            curl=["/usr/bin/curl","--silent","--show-error","--noproxy","*",
                  "--insecure","--max-time","4",
                  "--connect-to",host+":443:127.0.0.1:"+str(port),
                  "--output","/dev/null","--write-out","%{http_code}|%{redirect_url}",
                  url]
            r=subprocess.run(curl,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=7)
            require(r.returncode==0,"ISOLATED_CURL_REQUEST_FAILED")
            raw=r.stdout.decode("utf-8",errors="replace").strip()
            code,location=raw.split("|",1)
            require(int(code)==expect,"HTTP_STATUS_MISMATCH host="+host+" route="+path+" want="+str(expect)+" got="+code)
            if target:
                expected_url="https://"+host+quote(target,safe="/%")
                actual=urlsplit(location)
                expected=urlsplit(expected_url)
                require(actual.scheme=="https" and actual.hostname==host
                        and unquote(actual.path)==target
                        and actual.port in (None,443,port)
                        and not actual.query and not actual.fragment,
                        "REDIRECT_LOCATION_MISMATCH stage="+host+path+" actual="+location+" expected="+expected_url)
            requests+=1
        try:
            ready=False
            for _ in range(30):
                if proc.poll() is not None: break
                try:
                    hit(HOSTS[0],"/bg/",200)
                    ready=True
                    break
                except Exception:
                    time.sleep(.15)
            require(ready,"ISOLATED_APACHE_DID_NOT_START")
            # Before change: 15 new aliases do not redirect (V4).
            for host in HOSTS:
                for entry in aliases[1:]:
                    hit(host,entry["source"],404)
                    rollback_cases+=1
            for host in NESTED:
                hit(host,"/",200)
                neighbor_checked+=1
            # Atomic V4 -> V6 transition in the private fixture, while Apache runs.
            tmp_ht=doc/".htaccess.pending"
            tmp_ht.write_bytes(v6)
            os.replace(tmp_ht,root_ht)
            require(digest(root_ht.read_bytes())==V6_HASH,"LIVE_FIXTURE_V6_HASH_MISMATCH")
            for host in HOSTS:
                for entry in aliases:
                    hit(host,entry["source"],302,entry["target"])
                    aliases_checked+=1
                for route in excluded:
                    hit(host,route,404)
                    galleries_checked+=1
                for route in ("/wp-admin/","/wp-content/uploads/2016/paid.wav",
                              "/wp-json/","/wp-login.php",
                              "/432hz-foundation.com/","/432project.432hz-orchestra.com/index.php",
                              "/?wc-ajax=checkout","/?download_file=42"):
                    hit(host,route,403)
                    protected_checked+=1
                for route in ("/bg/","/en/","/robots.txt"):
                    hit(host,route,200)
            for host in NESTED:
                hit(host,"/",200)
                neighbor_checked+=1
            hit(NESTED[1],"/index.php",200)
            neighbor_checked+=1
            hit(NESTED[1],"/wp-content/uploads/asset.txt",200)
            neighbor_checked+=1
            hit(NESTED[1],"/old",302,"/")
            neighbor_checked+=1
            # Explicit rollback: original V4 must restore the exact old routing.
            tmp_restore=doc/".htaccess.rollback"
            tmp_restore.write_bytes(v4)
            os.replace(tmp_restore,root_ht)
            require(digest(root_ht.read_bytes())==V4_HASH,"ROLLBACK_FAILED_TO_RESTORE_V4_BYTES")
            for host in HOSTS:
                hit(host,"/",302,"/bg/")
                rollback_cases+=1
                for entry in aliases[1:]:
                    hit(host,entry["source"],404)
                    rollback_cases+=1
            for host in NESTED:
                hit(host,"/",200)
                neighbor_checked+=1
            require(aliases_checked==32 and galleries_checked==26,
                    "COUNT_MISMATCH")
            require(protected_checked==16 and rollback_cases==62,
                    "PROTECTION_OR_ROLLBACK_TEST_COUNT_MISMATCH")
            result={
                "gate":"432_APACHE_V6_16_ALIASES_REAL_ISOLATED_HTTPS_SWITCH_AND_ROLLBACK_PASS",
                "apacheVersion":"2.4.58 Ubuntu WSL2",
                "previousV4Sha256":V4_HASH,
                "candidateV6Sha256":V6_HASH,
                "newLegacyAliasRules":15,
                "oldRootRedirectPreserved":True,
                "allLegacyAliasRedirectsCorrect":aliases_checked,
                "excludedGalleryPathsStill404":galleries_checked,
                "sourceAndPhpDenialRequests403":protected_checked,
                "nestedVhostAndProtectedAppChecks":neighbor_checked,
                "baselineAndRollbackChecks":rollback_cases,
                "httpRequestsAgainstIsolatedLoopbackApache":requests,
                "liveProductionConfigModified":False,
                "fixtureV4BytesRestoredAfterRollback":True,
                "fixtureOnlySyntheticPagesNotRealSite":True,
                "realSharedHostVhostOrProductionRollbackProven":False,
                "ownerAliasApproval":False,
                "ownerProductionCutoverApproval":False
            }
            args.private_receipt.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf8")
            print(json.dumps(result,sort_keys=True),flush=True)
        finally:
            if proc.poll() is None:
                try:os.killpg(proc.pid,signal.SIGTERM)
                except ProcessLookupError:pass
                try:proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    os.killpg(proc.pid,signal.SIGKILL)
                    proc.wait(timeout=4)
    return 0


if __name__=="__main__":
    try:sys.exit(main())
    except Exception as exc:
        # Do not leak candidate body or private paths to logs on failure.
        print(json.dumps({"gate":"432_APACHE_V6_REHEARSAL_FAILED_CLOSED",
                          "errorClass":type(exc).__name__,
                          "reason":str(exc)[:320] if str(exc).startswith(("REDIRECT_LOCATION_MISMATCH","HTTP_STATUS_MISMATCH")) or str(exc).isupper() else "CHECK_FAILURE"}),
              file=sys.stderr)
        sys.exit(3)
