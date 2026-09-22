import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const dir='experience';
let app=fs.readFileSync(dir+'/app.js','utf8');
// Normalize delegated button handling: buttons outside forms are actions, even
// when the DOM's default .type property says submit.
app=app.replace("if(!b||b.type==='submit'||b.closest('form')&&!b.hasAttribute('type'))return;","if(!b||(b.closest('form')&&(b.type==='submit'||!b.hasAttribute('type'))))return;");
app=app.replace("$('#signed-app').hidden=true;$('#auth-view').hidden=false;","$('#signed-app').hidden=true;$('#signed-app').replaceChildren();$('#dialog-content').replaceChildren();$('#auth-view').hidden=false;");
app=app.replace("if(state.user){await loadAll();navigate(button.dataset.view);}","if(state.user){if(state.workspace)await loadAll();navigate(button.dataset.view);}");
const swRegistration="\nif('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});\n";
if(!app.includes("serviceWorker.register('./sw.js'"))app+=swRegistration;
fs.writeFileSync(dir+'/app.js',app);
let html=fs.readFileSync(dir+'/index.html','utf8');
if(html.length<6000||app.length<20000||!html.startsWith('<!doctype html>')||!html.includes('data-build="clean-20260922-1"'))throw Error('Invalid or incomplete application source');
for(const content of [html,app]){
 if(content.includes('The requested file reference is not currently visible'))throw Error('Retrieval error found in application');
 if(/sb_secret_|SUPABASE_SERVICE_ROLE_KEY|service_role.{0,8}eyJ|postgres:\/\//.test(content))throw Error('Server secret marker in public app');
}
fs.mkdirSync(dir+'/vendor',{recursive:true});
const tools=process.env.LUNIS_TOOLS;
const sdk=path.join(tools,'node_modules/@supabase/supabase-js/dist/umd/supabase.js');
const license=path.join(tools,'node_modules/@supabase/supabase-js/LICENSE');
if(!fs.existsSync(sdk)||fs.statSync(sdk).size<50000)throw Error('Supabase SDK missing');
fs.copyFileSync(sdk,dir+'/vendor/supabase-2.95.3.js');
if(fs.existsSync(license))fs.copyFileSync(license,dir+'/vendor/SUPABASE-LICENSE.txt');
else fs.writeFileSync(dir+'/vendor/SUPABASE-LICENSE.txt','Supabase JavaScript SDK 2.95.3, MIT license. https://github.com/supabase/supabase-js\n');
html=html.replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.3/dist/umd/supabase.js','vendor/supabase-2.95.3.js');
html=html.replace("script-src 'self' https://cdn.jsdelivr.net","script-src 'self'");
fs.writeFileSync(dir+'/index.html',html);
let css=fs.readFileSync(dir+'/style.css','utf8').replace('font:14px/1.8 inherit','font-family:inherit;font-size:14px;line-height:1.8');
fs.writeFileSync(dir+'/style.css',css);
const logo=fs.readFileSync(dir+'/brand.svg','utf8');
const icon=logo.slice(0,logo.indexOf('<g fill='))+'</svg>';
fs.writeFileSync(dir+'/icon.svg',icon.replace('204.2 52.3','52.3 52.3'));
fs.writeFileSync(dir+'/manifest.webmanifest',JSON.stringify({id:'./',name:'Lunis Projektraum',short_name:'Lunis',lang:'de-AT',start_url:'./',scope:'./',display:'standalone',background_color:'#f6f7fa',theme_color:'#091a40',icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},null,2));
const shell=['./','./index.html','./app.js','./style.css','./brand.svg','./icon.svg','./manifest.webmanifest','./vendor/supabase-2.95.3.js'];
const version=createHash('sha256').update(html+app+css).digest('hex').slice(0,16);
fs.writeFileSync(dir+'/sw.js',`'use strict';\nconst CACHE='lunis-shell-${version}';\nconst FILES=${JSON.stringify(shell)};\nconst ALLOWED=new Set(FILES.map(p=>new URL(p,self.registration.scope).pathname));\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lunis-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!ALLOWED.has(u.pathname))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||Response.error())));});\n`);
execFileSync('node',['--check',dir+'/app.js'],{stdio:'inherit'});
execFileSync('node',['--check',dir+'/sw.js'],{stdio:'inherit'});
const manifest={build:'clean-20260922-1',source_commit:process.env.GITHUB_SHA||null,created_at:new Date().toISOString(),files:{}};
for(const name of ['index.html','app.js','style.css','brand.svg','icon.svg','manifest.webmanifest','sw.js','vendor/supabase-2.95.3.js']){
 const b=fs.readFileSync(dir+'/'+name);manifest.files[name]={bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};
}
fs.writeFileSync(dir+'/build.json',JSON.stringify(manifest,null,2));
console.log('BUILD_OK',JSON.stringify({build:manifest.build,files:Object.keys(manifest.files).length,html_bytes:manifest.files['index.html'].bytes,js_bytes:manifest.files['app.js'].bytes}));
