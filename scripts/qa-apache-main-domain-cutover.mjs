import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const fixedSha="8fbb14f21ec3df1444f8203508181008e81f69f9b382b6b41370d902139142ae";
const input=process.env.ORCHESTRA_APACHE_CANDIDATE_FILE;
assert.ok(input, "Set ORCHESTRA_APACHE_CANDIDATE_FILE to the owner-controlled V4 private candidate text file");
const source=resolve(input);
assert.ok(existsSync(source),"Candidate file not found");
const content=readFileSync(source);
assert.equal(createHash("sha256").update(content).digest("hex"),fixedSha,
 "Candidate file differs from the privately documented and tested V4 SHA-256");
const text=content.toString("utf8");
assert.ok(text.includes("RewriteOptions InheritDownBefore"),"Nested .htaccess rewrite inheritance must be enabled");
assert.ok(!text.includes("RewriteRule . index.php [L]"),"WordPress front controller must not be active in static candidate");
const docker=process.env.ORCHESTRA_DOCKER_EXE||
 (process.platform==="win32"?"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe":"docker");
const image="php:8.4-apache";
const name="orchestra-apache-40case-qa-20261107";
function execute(args,{optional=false}={}){
 const r=spawnSync(docker,args,{windowsHide:true,encoding:"utf8",maxBuffer:2*1024*1024,timeout:30000});
 if(r.error || r.status!==0){
  if(optional)return null;
  throw new Error("Isolated Docker fixture command failed: "+
     args.slice(0,3).join(" ")+" exit="+String(r.status)+
     " errorClass="+(r.error?.code??"NONZERO_EXIT"));
 }
 return r.stdout.trim();
}
assert.ok(execute(["image","inspect",image],{optional:true}),"The Apache fixture image must exist locally; do not auto-pull images");
assert.equal(execute(["ps","-a","--filter","name=^/"+name+"$","--format","{{.Names}}"]),"",
 "Refusing to overwrite an existing Docker container");
let started=false;
const temp=mkdtempSync(join(tmpdir(),"orchestra-apache-qa-"));
try{
 execute(["run","--rm","-d","--name",name,"--network","none","--log-driver","none",
  "--memory","256m","--memory-swap","256m",image]);
 started=true;
 const isolation=execute(["inspect","--format","{{.HostConfig.NetworkMode}}|{{.HostConfig.LogConfig.Type}}|{{.HostConfig.AutoRemove}}",name]);
 assert.equal(isolation,"none|none|true","Container must have no network/logging and automatic cleanup");
 const fixtureFile=join(temp,"fixture-setup.sh");
 writeFileSync(fixtureFile,"#!/bin/sh\nset -eu\na2enmod rewrite ssl access_compat >/dev/null\nmkdir -p /var/www/html/bg /var/www/html/en /var/www/html/432hz-foundation.com /var/www/html/432project.432hz-orchestra.com/wp-content/uploads /var/www/html/wp-content/uploads/woocommerce_uploads /var/www/html/wp-content/uploads/2016 /var/www/html/wp-admin /var/www/html/wp-json\nprintf 'BG_ASTRO_STATIC_OK\\n' > /var/www/html/bg/index.html\nprintf 'EN_ASTRO_STATIC_OK\\n' > /var/www/html/en/index.html\nprintf 'MAIN_WORDPRESS_PHP_UNSAFE\\n' > /var/www/html/index.php\nprintf 'PROJECT_WORDPRESS_PHP_OK\\n' > /var/www/html/432project.432hz-orchestra.com/index.php\nprintf 'FOUNDATION_STATIC_OK\\n' > /var/www/html/432hz-foundation.com/index.html\nprintf 'PRIVATE_PAID_AUDIO_TEST_FIXTURE\\n' > /var/www/html/wp-content/uploads/woocommerce_uploads/paid.wav\nprintf 'PUBLIC_PRICED_AUDIO_TEST_FIXTURE\\n' > /var/www/html/wp-content/uploads/2016/paid.mp3\nprintf 'MAIN_ROBOTS_OK\\n' > /var/www/html/robots.txt\nprintf 'PROJECT_UPLOAD_OK\\n' > /var/www/html/432project.432hz-orchestra.com/wp-content/uploads/asset.txt\nprintf 'RewriteEngine On\\nRewriteRule ^old$ / [R=302,L]\\n' > /var/www/html/432project.432hz-orchestra.com/.htaccess\nprintf 'DirectoryIndex index.html\\n' > /var/www/html/432hz-foundation.com/.htaccess\nopenssl req -x509 -newkey rsa:2048 -nodes -keyout /tmp/orchestra-test-key.pem -out /tmp/orchestra-test-cert.pem -days 1 -subj /CN=localhost >/dev/null 2>&1\ncat > /etc/apache2/conf-enabled/orchestra-vhost-fixture.conf <<'APACHECONF'\n<Directory /var/www/html>\n AllowOverride All\n Require all granted\n</Directory>\n<VirtualHost *:443>\n ServerName 432hz-orchestra.com\n ServerAlias www.432hz-orchestra.com\n DocumentRoot /var/www/html\n SSLEngine On\n SSLCertificateFile /tmp/orchestra-test-cert.pem\n SSLCertificateKeyFile /tmp/orchestra-test-key.pem\n</VirtualHost>\n<VirtualHost *:443>\n ServerName 432hz-foundation.com\n DocumentRoot /var/www/html/432hz-foundation.com\n SSLEngine On\n SSLCertificateFile /tmp/orchestra-test-cert.pem\n SSLCertificateKeyFile /tmp/orchestra-test-key.pem\n</VirtualHost>\n<VirtualHost *:443>\n ServerName 432project.432hz-orchestra.com\n DocumentRoot /var/www/html/432project.432hz-orchestra.com\n SSLEngine On\n SSLCertificateFile /tmp/orchestra-test-cert.pem\n SSLCertificateKeyFile /tmp/orchestra-test-key.pem\n</VirtualHost>\nAPACHECONF\napache2ctl -t >/dev/null\napache2ctl -k graceful >/dev/null\n","utf8");
 execute(["cp",source,name+":/var/www/html/.htaccess"]);
 execute(["cp",fixtureFile,name+":/tmp/fixture-setup.sh"]);
 execute(["exec",name,"sh","/tmp/fixture-setup.sh"]);
 assert.equal(execute(["exec",name,"sha256sum","/var/www/html/.htaccess"]).split(/\s+/)[0],fixedSha,
  "Actual Apache fixture did not run the exact SHA256-pinned candidate");
 const tests=[["https","432hz-orchestra.com","/",302],["https","432hz-orchestra.com","/bg/",200],["https","432hz-orchestra.com","/en/",200],["https","432hz-orchestra.com","/bg/missing-x/",404],["https","432hz-orchestra.com","/robots.txt",200],["https","432hz-orchestra.com","/wp-admin/",403],["https","432hz-orchestra.com","/wp-admin",403],["https","432hz-orchestra.com","/wp-content/",403],["https","432hz-orchestra.com","/wp-content/uploads/2016/paid.mp3",403],["https","432hz-orchestra.com","/wp-content/uploads/woocommerce_uploads/paid.wav",403],["https","432hz-orchestra.com","/wp-includes/",403],["https","432hz-orchestra.com","/wp-json/",403],["https","432hz-orchestra.com","/index.php",403],["https","432hz-orchestra.com","/wp-login.php",403],["https","432hz-orchestra.com","/custom.PHP",403],["https","432hz-orchestra.com","/nested/anything.php",403],["https","432hz-orchestra.com","/?wc-api=hook",403],["https","432hz-orchestra.com","/?wc-ajax=checkout",403],["https","432hz-orchestra.com","/?rest_route=wp/v2",403],["https","432hz-orchestra.com","/bg/?add-to-cart=5",403],["https","432hz-orchestra.com","/?download_file=5",403],["https","432hz-orchestra.com","/?order-pay=5",403],["https","432hz-orchestra.com","/?wc_order_key=wc_test",403],["https","432hz-orchestra.com","/432project.432hz-orchestra.com/index.php",403],["https","432hz-orchestra.com","/432project.432hz-orchestra.com/wp-content/uploads/asset.txt",403],["https","432hz-orchestra.com","/432hz-foundation.com/index.html",403],["https","432hz-orchestra.com","/432hz-foundation.com/",403],["https","www.432hz-orchestra.com","/",302],["https","www.432hz-orchestra.com","/bg/",200],["https","www.432hz-orchestra.com","/index.php",403],["https","www.432hz-orchestra.com","/wp-content/uploads/2016/paid.mp3",403],["https","432hz-foundation.com","/",200],["https","432hz-foundation.com","/index.html",200],["https","432project.432hz-orchestra.com","/",200],["https","432project.432hz-orchestra.com","/index.php",200],["https","432project.432hz-orchestra.com","/wp-content/uploads/asset.txt",200],["https","432project.432hz-orchestra.com","/old",302],["http","432hz-orchestra.com","/bg/",301],["http","432hz-foundation.com","/",301],["http","432project.432hz-orchestra.com","/",301]];
 const failed=[];
 const statusCounts={};
 for(const [scheme,hostname,route,wantedStatus] of tests){
  const port=scheme==="https"?443:80;
  const result=execute(["exec",name,"curl","--silent","--show-error","--noproxy","*",
    "--insecure","--output","/dev/null","--write-out","%{http_code}",
    "--resolve",hostname+":"+port+":127.0.0.1",scheme+"://"+hostname+route],{optional:true});
  const received=result===null?"error":result;
  statusCounts[received]=(statusCounts[received]||0)+1;
  if(received!==String(wantedStatus))failed.push({hostname,route,expected:wantedStatus,actual:received});
 }
 assert.equal(tests.length,40);
 assert.deepEqual(failed,[],"One or more nested-domain cutover security tests failed: "+JSON.stringify(failed));
 console.log(JSON.stringify({
  gate:"ISOLATED_APACHE_CUTOVER_40_40_PASS",
  testedCandidateSha256:fixedSha,apacheImage:image,tests:tests.length,
  passed:tests.length,failed:failed.length,statusCounts,
  hostDomainNestedAppsPreserved:true,productionModified:false
 }));
} finally {
 if(started)execute(["stop","--time","5",name],{optional:true});
 rmSync(temp,{recursive:true,force:true});
}
