import test from "node:test";
import assert from "node:assert/strict";
import {
  CONSENT_MARKER, GA4_MEASUREMENT_ID, clearFirstPartyAnalyticsCookies,
  hasVersionedAnalyticsConsent, installConsentFirstGA4, readCookie,
} from "./consent-first-ga4.mjs";

function fakeEnvironment({ host="432hz-orchestra.com", protocol="https:", initial={} }={}) {
  const jar=new Map(Object.entries(initial));
  const scriptNodes=[];
  const listeners=new Map();
  const doc={
    get cookie(){return [...jar.entries()].map(([k,v])=>k+"="+v).join("; ");},
    set cookie(serialized){
      const segments=String(serialized).split(";");
      const [name,value]=segments[0].split("=");
      const deleteIt=segments.some(s=>/^\s*Max-Age=0\s*$/i.test(s));
      if(deleteIt) jar.delete(name);
      else jar.set(name,value);
    },
    head:{appendChild(s){scriptNodes.push(s);}},
    scripts:scriptNodes,
    createElement(type){if(type!=="script")throw Error("only script");return {src:"",async:false,onload:null,onerror:null};},
    querySelector(selector){return scriptNodes.find(s=>selector.includes("gtag/js")&&s.src.includes("gtag/js"))??null;},
    addEventListener(name,fn){const a=listeners.get(name)||[];a.push(fn);listeners.set(name,a);},
    removeEventListener(name,fn){const a=listeners.get(name)||[];const i=a.indexOf(fn);if(i!==-1)a.splice(i,1);},
    emit(name,value){const event=name==="click"&&typeof value==="object"?value:{detail:{value}};for(const fn of [...(listeners.get(name)||[])])fn(event);},
    listeners(name){return listeners.get(name)||[];},
    location:{search:"?utm_campaign=archive_q4"},
    click(anchor){for(const fn of [...(listeners.get("click")||[])])fn({target:{closest:(s)=>s==="a[href]"?anchor:null}});},
  };
  let reloadCount=0;
  const win={location:{hostname:host,protocol,reload(){reloadCount++;}}};
  return {doc,win,jar,scripts:scriptNodes, get reloadCount(){return reloadCount;}};
}
const configured = (ctx,options={})=> installConsentFirstGA4({
  document:ctx.doc, window:ctx.win,consentUiApproved:true,
  legacyEmittersSuppressed:true,...options,
});
function trustedAcceptClick(ctx) { ctx.doc.emit("click",{isTrusted:true,target:{closest:(selector)=>selector==="#cn-accept-cookie"?{id:"cn-accept-cookie"}:null}}); }
function setAccepted(ctx){trustedAcceptClick(ctx);ctx.doc.cookie="cookie_notice_accepted=true; Path=/";ctx.doc.emit("setCookieNotice","true");}
function setRejected(ctx){ctx.doc.cookie="cookie_notice_accepted=false; Path=/";ctx.doc.emit("setCookieNotice","false");}
function names(ctx){return (ctx.win.dataLayer||[]).map(args=>[...args][0]+"_"+[...args][1]);}
function bandcampLink(){
  return {
    protocol:"https:",hostname:"432orchestra.bandcamp.com",port:"",
    classList:{contains:s=>s==="c432-bandcamp-loop-button"},
    dataset:{c432ProductId:"919"},closest:()=>null,
  };
}

test("module import is inert and never creates its own browser document",()=>{
  assert.equal(GA4_MEASUREMENT_ID,"G-YMLKYY9HGT");
  assert.equal(CONSENT_MARKER,"__Host-orch432-ga4-v1");
});
test("old accept-only cookie does not imply fresh versioned consent",()=>{
  const c=fakeEnvironment({initial:{cookie_notice_accepted:"true"}});
  const x=configured(c);
  assert.equal(x.getStatus().enabled,true);
  assert.equal(c.scripts.length,0);
  assert.equal(hasVersionedAnalyticsConsent(c.doc),false);
});
test("unknown consent and ordinary navigation generate no Google tag",()=>{
  const c=fakeEnvironment();
  configured(c);c.doc.emit("click","true");
  assert.equal(c.scripts.length,0);
  assert.equal(typeof c.win.gtag,"undefined");
});
test("missing one of two independent explicit approvals leaves module inert",()=>{
  for(const change of [{consentUiApproved:false},{legacyEmittersSuppressed:false}]){
    const c=fakeEnvironment({initial:{cookie_notice_accepted:"true",[CONSENT_MARKER]:"granted"}});
    const x=configured(c,change);
    assert.equal(x.getStatus().enabled,false);
    assert.equal(c.scripts.length,0);
  }
});
test("different blog host or insecure transport never loads a Google tag",()=>{
  for(const [host,protocol] of [["evil.example","https:"],["432hz-orchestra.com","http:"],["www.432hz-orchestra.com","https:"]]){
    const c=fakeEnvironment({host,protocol,initial:{cookie_notice_accepted:"true",[CONSENT_MARKER]:"granted"}});
    const x=configured(c);
    assert.equal(x.getStatus().enabled,false);assert.equal(c.scripts.length,0);
  }
});
test("explicit accept records new marker and injects only official GA4, never UA",()=>{
  const c=fakeEnvironment();
  configured(c);setAccepted(c);
  assert.equal(c.scripts.length,1);
  assert.equal(c.scripts[0].src,"https://www.googletagmanager.com/gtag/js?id=G-YMLKYY9HGT");
  assert.equal(c.scripts[0].async,true);
  assert.equal(readCookie(c.doc,CONSENT_MARKER),"granted");
  assert.equal(c.win.dataLayer.length,4);
  assert.deepEqual(names(c),["consent_default","consent_update","js_Mon Nov", "config_G-YMLKYY9HGT"].map((s,i)=>i===2?names(c)[2]:s));
  const commands=c.win.dataLayer.map(a=>[...a]);
  assert.equal(commands[0][2].analytics_storage,"denied");
  assert.equal(commands[1][2].analytics_storage,"granted");
  assert.equal(commands[1][2].ad_storage,"denied");
  assert.equal(commands[3][2].send_page_view,false);
  assert.equal(commands[3][1],GA4_MEASUREMENT_ID);
});
test("one and only one manual pageview on successful tag load",()=>{
  const c=fakeEnvironment();const x=configured(c);setAccepted(c);
  c.scripts[0].onload();c.scripts[0].onload();setAccepted(c);
  const p=c.win.dataLayer.map(a=>[...a]).filter(a=>a[0]==="event"&&a[1]==="page_view");
  assert.equal(p.length,1);assert.equal(x.getStatus().ready,true);
});
test("denial before any consent load sends nothing and does not reload",()=>{
  const c=fakeEnvironment();const x=configured(c);setRejected(c);
  assert.equal(x.getStatus().tagInjected,false);
  assert.equal(c.reloadCount,0);assert.equal(c.scripts.length,0);
});
test("rejected cookie does not validate a forged or stale consent marker",()=>{
  const c=fakeEnvironment({initial:{cookie_notice_accepted:"false",[CONSENT_MARKER]:"granted"}});
  configured(c);assert.equal(hasVersionedAnalyticsConsent(c.doc),false);assert.equal(c.scripts.length,0);
});
test("old consent true without explicit setCookieNotice event is insufficient",()=>{
  const c=fakeEnvironment();configured(c);c.doc.cookie="cookie_notice_accepted=true";
  assert.equal(c.scripts.length,0);assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
});
test("early denied turn never injects before true event",()=>{
  const c=fakeEnvironment();configured(c);setRejected(c);assert.equal(c.scripts.length,0);
  setAccepted(c);assert.equal(c.scripts.length,1);
});
test("revoke after opt-in disables new sends, clears marker/cookies and reloads",()=>{
  const c=fakeEnvironment();const x=configured(c);setAccepted(c);c.scripts[0].onload();
  c.doc.cookie="_ga=one";c.doc.cookie="_gid=two";c.doc.cookie="_ga_ABC12=three";
  c.doc.cookie="unrelated_session=keep";
  const originalCalls=c.win.dataLayer.length;
  setRejected(c);
  assert.equal(c.reloadCount,1);
  assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
  for(const k of ["_ga","_gid","_ga_ABC12"])assert.equal(readCookie(c.doc,k),null);
  assert.equal(readCookie(c.doc,"unrelated_session"),"keep");
  assert.equal(x.getStatus().ready,false);
  assert.equal(c.win.dataLayer.length,originalCalls);
});
test("late external script onload after revoke cannot produce pageview",()=>{
  const c=fakeEnvironment();const x=configured(c);setAccepted(c);setRejected(c);
  c.scripts[0].onload();
  assert.equal(x.getStatus().ready,false);
  assert.equal(c.win.dataLayer.filter(a=>[...a][1]==="page_view").length,0);
});
test("preexisting external Google script fails closed; no second tag injected",()=>{
  const c=fakeEnvironment();c.scripts.push({src:"https://www.googletagmanager.com/gtag/js?id=UA-43283273-2"});
  const issues=[];configured(c,{onDiagnostic:s=>issues.push(s)});setAccepted(c);
  assert.equal(c.scripts.length,1);
  assert.deepEqual(issues,["existing-google-tag-detected-stop"]);
});
test("preexisting window.ga fails closed",()=>{
  const c=fakeEnvironment();c.win.ga=()=>{};
  configured(c);setAccepted(c);assert.equal(c.scripts.length,0);
});
test("an invalid or absent onload never emits pageview",()=>{
  const c=fakeEnvironment();const x=configured(c);setAccepted(c);c.scripts[0].onerror();
  assert.equal(x.getStatus().ready,false);
  assert.equal(c.win.dataLayer.some(a=>[...a][1]==="page_view"),false);
});
test("outbound custom tracking OFF by default even after GA4 is ready",()=>{
  const c=fakeEnvironment();const x=configured(c);setAccepted(c);c.scripts[0].onload();
  assert.equal(x.getStatus().outboundEnabled,false);assert.equal(c.doc.listeners("click").length,1);
});
test("native outbound mode unknown => no custom click tracking",()=>{
  const c=fakeEnvironment();const x=configured(c,{captureBandcampOutbound:true});setAccepted(c);c.scripts[0].onload();
  assert.equal(x.getStatus().outboundEnabled,false);
});
test("approved outbound click sends once, sanitizes payload, never link URL",()=>{
  const c=fakeEnvironment();
  const x=configured(c,{captureBandcampOutbound:true,nativeOutboundSettingsVerified:true,allowedCampaigns:["archive_q4"]});
  setAccepted(c);c.scripts[0].onload();
  assert.equal(x.getStatus().outboundEnabled,true);
  assert.equal(c.doc.listeners("click").length,2);
  c.doc.click(bandcampLink());
  const events=c.win.dataLayer.map(a=>[...a]).filter(a=>a[0]==="event"&&a[1]==="bandcamp_outbound_click");
  assert.deepEqual(events,[["event","bandcamp_outbound_click",{placement:"shop_grid",product_id:"919",utm_campaign:"archive_q4"}]]);
  setRejected(c);
  assert.equal(c.doc.listeners("click").length,1);
});
test("dispose removes consent listener and outbound listener",()=>{
  const c=fakeEnvironment();
  const x=configured(c,{captureBandcampOutbound:true,nativeOutboundSettingsVerified:true});
  setAccepted(c);c.scripts[0].onload();assert.equal(c.doc.listeners("click").length,2);
  x.dispose();assert.equal(c.doc.listeners("click").length,0);assert.equal(c.doc.listeners("setCookieNotice").length,0);
});
test("analytics-cookie cleanup never erases unrelated first-party session",()=>{
  const c=fakeEnvironment({initial:{"_ga":"abc","_ga_DEF":"123","_gid":"ABC","session_auth":"KEEP","cookie_notice_accepted":"true"}});
  clearFirstPartyAnalyticsCookies(c.doc,"432hz-orchestra.com");
  assert.equal(readCookie(c.doc,"_ga"),null);
  assert.equal(readCookie(c.doc,"_ga_DEF"),null);
  assert.equal(readCookie(c.doc,"_gid"),null);
  assert.equal(readCookie(c.doc,"session_auth"),"KEEP");
  assert.equal(readCookie(c.doc,"cookie_notice_accepted"),"true");
});
test("event with unexpected value never authorizes",()=>{
  const c=fakeEnvironment();configured(c);
  c.doc.cookie="cookie_notice_accepted=true";c.doc.emit("setCookieNotice","accepted");
  assert.equal(c.scripts.length,0);
});
test("no side effects if onDiagnostic throws",()=>{
  const c=fakeEnvironment();c.win.ga=()=>{};configured(c,{onDiagnostic(){throw new Error("sink");}});
  assert.doesNotThrow(()=>setAccepted(c));assert.equal(c.scripts.length,0);
});


test("existing dataLayer placeholder is treated as a duplicate-tag risk and blocked",()=>{
  const c=fakeEnvironment();c.win.dataLayer=[];
  const issues=[];configured(c,{onDiagnostic:s=>issues.push(s)});setAccepted(c);
  assert.equal(c.scripts.length,0);assert.deepEqual(issues,["existing-google-tag-detected-stop"]);
});
test("consent becomes active on a new session only with both current cookies",()=>{
  const c=fakeEnvironment({initial:{cookie_notice_accepted:"true",[CONSENT_MARKER]:"granted"}});
  const x=configured(c);
  assert.equal(x.getStatus().tagInjected,true);
  c.scripts[0].onload();
  assert.equal(x.getStatus().pageviewSent,true);
});


test("revocation broadcasts to another opted-in tab and stops its old GA4 session", () => {
  const connections = new Set();
  const messages = [];
  class TestBroadcastChannel {
    constructor(name) { this.name = name; this.onmessage = null; this.closed = false; connections.add(this); }
    postMessage(data) {
      messages.push(data);
      for (const subscriber of connections) {
        if (subscriber !== this && !subscriber.closed && subscriber.name === this.name) subscriber.onmessage?.({data});
      }
    }
    close() { this.closed = true; connections.delete(this); }
  }
  const a=fakeEnvironment(), b=fakeEnvironment();
  a.win.BroadcastChannel=TestBroadcastChannel;
  b.win.BroadcastChannel=TestBroadcastChannel;
  const first=configured(a), second=configured(b);
  setAccepted(a);setAccepted(b);
  a.scripts[0].onload();b.scripts[0].onload();
  assert.equal(first.getStatus().ready,true);
  assert.equal(second.getStatus().ready,true);
  setRejected(a);
  assert.deepEqual(messages,["reject"]); // receiving tab must not re-broadcast indefinitely
  assert.equal(a.reloadCount,1);
  assert.equal(b.reloadCount,1);
  assert.equal(first.getStatus().ready,false);
  assert.equal(second.getStatus().ready,false);
  assert.equal(readCookie(b.doc,CONSENT_MARKER),null);
  first.dispose();second.dispose();
  assert.equal(connections.size,0);
});

test("visibilitychange revocation fallback fails closed when cross-tab signals unavailable", () => {
  const c=fakeEnvironment();
  configured(c);
  setAccepted(c);c.scripts[0].onload();
  assert.equal(c.doc.listeners("visibilitychange").length,1);
  c.doc.cookie="cookie_notice_accepted=false";
  c.doc.emit("visibilitychange");
  assert.equal(c.reloadCount,1);
  assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
});

test("unrelated cross-tab broadcast messages cannot grant analytics consent", () => {
  let instance;
  class TestChannel{
    constructor() { instance=this; }
    postMessage() {}
    close() {}
  }
  const c=fakeEnvironment();
  c.win.BroadcastChannel=TestChannel;
  const x=configured(c);
  instance.onmessage({data:"grant"});
  instance.onmessage({data:{consent:"true"}});
  assert.equal(x.getStatus().tagInjected,false);
  assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
});

test("preconsent cross-tab reject message does not create any Google tag", () => {
  let instance;
  class TestChannel { constructor(){ instance=this; } postMessage(){} close(){} }
  const c=fakeEnvironment();c.win.BroadcastChannel=TestChannel;
  const x=configured(c);
  instance.onmessage({data:"reject"});
  assert.equal(x.getStatus().ready,false);
  assert.equal(c.scripts.length,0);
  assert.equal(c.reloadCount,0);
});


test("withdrawal cleans nonessential legacy Google _gcl cookies without deleting auth cookies",()=>{
  const c=fakeEnvironment({initial:{"_ga":"a","_ga_X1":"b","_gcl_au":"c","_gcl_aw":"d","_gac_UA12":"e","session_auth":"preserve"}});
  clearFirstPartyAnalyticsCookies(c.doc,"432hz-orchestra.com");
  for(const name of ["_ga","_ga_X1","_gcl_au","_gcl_aw","_gac_UA12"])assert.equal(readCookie(c.doc,name),null);
  assert.equal(readCookie(c.doc,"session_auth"),"preserve");
});


test("synthetic Cookie Notice acceptance event alone never creates a consent marker or GA tag",()=>{
  const c=fakeEnvironment(), issues=[];
  configured(c,{onDiagnostic:x=>issues.push(x)});
  c.doc.cookie="cookie_notice_accepted=true";
  c.doc.emit("setCookieNotice","true");
  assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
  assert.equal(c.scripts.length,0);
  assert.deepEqual(issues,["ignored-untrusted-or-unmatched-consent-grant"]);
});

test("script-dispatched untrusted click on Accept followed by event is rejected",()=>{
  const c=fakeEnvironment();configured(c);
  c.doc.emit("click",{isTrusted:false,target:{closest:s=>s==="#cn-accept-cookie"?{}:null}});
  c.doc.cookie="cookie_notice_accepted=true";
  c.doc.emit("setCookieNotice","true");
  assert.equal(c.scripts.length,0);
});

test("trusted click elsewhere followed by synthetic acceptance is rejected",()=>{
  const c=fakeEnvironment();configured(c);
  c.doc.emit("click",{isTrusted:true,target:{closest:()=>null}});
  c.doc.cookie="cookie_notice_accepted=true";
  c.doc.emit("setCookieNotice","true");
  assert.equal(c.scripts.length,0);
});

test("trusted Accept click without notice consent cookie does not authorize",()=>{
  const c=fakeEnvironment();configured(c);
  trustedAcceptClick(c);
  c.doc.emit("setCookieNotice","true");
  assert.equal(c.scripts.length,0);
  assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
});

test("trusted user click intent is single-use, subsequent unsolicited event is denied",()=>{
  const c=fakeEnvironment(),messages=[];
  configured(c,{onDiagnostic:x=>messages.push(x)});
  setAccepted(c);
  assert.equal(c.scripts.length,1);
  c.doc.emit("setCookieNotice","true");
  assert.equal(c.scripts.length,1);
  assert.ok(messages.includes("ignored-untrusted-or-unmatched-consent-grant"));
});

test("trusted click and false Cookie Notice event never creates new consent",()=>{
  const c=fakeEnvironment();configured(c);
  trustedAcceptClick(c);
  c.doc.cookie="cookie_notice_accepted=false";
  c.doc.emit("setCookieNotice","false");
  c.doc.cookie="cookie_notice_accepted=true";
  c.doc.emit("setCookieNotice","true");
  assert.equal(c.scripts.length,0);
});

test("normal keyboard-activated trusted click follows the same Accept gate",()=>{
  const c=fakeEnvironment();configured(c);
  // Browser activation of a focused anchor with Enter dispatches a trusted click.
  trustedAcceptClick(c);
  c.doc.cookie="cookie_notice_accepted=true";
  c.doc.emit("setCookieNotice","true");
  assert.equal(c.scripts.length,1);
});

test("disposing the pre-consent module removes the trusted-choice click listener",()=>{
  const c=fakeEnvironment();const x=configured(c);
  assert.equal(c.doc.listeners("click").length,1);
  x.dispose();
  assert.equal(c.doc.listeners("click").length,0);
  setAccepted(c);
  assert.equal(c.scripts.length,0);
});

function attachWindowStorageSupport(contexts) {
  const store = new Map();
  for (const c of contexts) {
    const listeners = new Map();
    c.win.addEventListener = (n,fn) => {
      if (!listeners.has(n)) listeners.set(n,new Set());
      listeners.get(n).add(fn);
    };
    c.win.removeEventListener = (n,fn) => listeners.get(n)?.delete(fn);
    c.win.emitWindow = (n,event) => {
      for (const fn of [...(listeners.get(n)||[])]) fn(event);
    };
    c.win.listenerCount = n => listeners.get(n)?.size||0;
    c.win.localStorage = {
      setItem(k,v) {
        store.set(k,v);
        for(const other of contexts) if(other!==c) other.win.emitWindow("storage",{key:k,newValue:v});
      },
      removeItem(k) {
        store.delete(k);
        for(const other of contexts) if(other!==c) other.win.emitWindow("storage",{key:k,newValue:null});
      },
    };
  }
  return store;
}

test("repeated reject requests after opt-in trigger only one reload",()=>{
  const c=fakeEnvironment();configured(c);setAccepted(c);c.scripts[0].onload();
  setRejected(c);setRejected(c);
  assert.equal(c.reloadCount,1);
});

test("storage fallback revokes same-origin visible second tab with BroadcastChannel absent",()=>{
  const a=fakeEnvironment(),b=fakeEnvironment();
  const storage=attachWindowStorageSupport([a,b]);
  const ax=configured(a),bx=configured(b);
  setAccepted(a);setAccepted(b);a.scripts[0].onload();b.scripts[0].onload();
  assert.equal(bx.getStatus().ready,true);
  setRejected(a);
  assert.equal(a.reloadCount,1);assert.equal(b.reloadCount,1);
  assert.equal(bx.getStatus().ready,false);
  assert.equal(readCookie(b.doc,CONSENT_MARKER),null);
  assert.equal(storage.size,0);
  ax.dispose();bx.dispose();
});

test("BroadcastChannel and storage double delivery never double reload",()=>{
  const a=fakeEnvironment(),b=fakeEnvironment();
  attachWindowStorageSupport([a,b]);
  const members=new Set();
  class Channel {
    constructor(name){this.name=name;members.add(this);}
    postMessage(data){for(const m of members)if(m!==this&&m.name===this.name)m.onmessage?.({data});}
    close(){members.delete(this);}
  }
  a.win.BroadcastChannel=Channel;b.win.BroadcastChannel=Channel;
  const ax=configured(a), bx=configured(b);
  setAccepted(a);setAccepted(b);a.scripts[0].onload();b.scripts[0].onload();
  setRejected(a);
  assert.equal(a.reloadCount,1);assert.equal(b.reloadCount,1);
  assert.equal(bx.getStatus().ready,false);
  ax.dispose();bx.dispose();
});

test("localStorage access errors leave rejection fail closed",()=>{
  const c=fakeEnvironment();
  Object.defineProperty(c.win,"localStorage",{get(){throw Error("Denied")}});
  configured(c);setAccepted(c);c.scripts[0].onload();
  assert.doesNotThrow(()=>setRejected(c));
  assert.equal(c.reloadCount,1);
  assert.equal(readCookie(c.doc,CONSENT_MARKER),null);
});

test("storage event cannot ever grant consent and ignores unrelated keys",()=>{
  const c=fakeEnvironment();attachWindowStorageSupport([c]);
  const x=configured(c);
  c.win.emitWindow("storage",{key:"orch432-ga4-revoke-v1",newValue:"grant"});
  c.win.emitWindow("storage",{key:"other-key",newValue:"reject"});
  assert.equal(c.scripts.length,0);assert.equal(x.getStatus().ready,false);
});

test("dispose releases storage listener and never authorizes analytics",()=>{
  const c=fakeEnvironment();attachWindowStorageSupport([c]);
  const x=configured(c);
  assert.equal(c.win.listenerCount("storage"),1);
  x.dispose();assert.equal(c.win.listenerCount("storage"),0);
  c.win.emitWindow("storage",{key:"orch432-ga4-revoke-v1",newValue:"reject"});
  assert.equal(c.scripts.length,0);
});