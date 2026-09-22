import fs from 'node:fs';
import assert from 'node:assert/strict';
const file='experience/app.js';
let app=fs.readFileSync(file,'utf8');
const mark='// readiness-20260922-2';
function replaceOnce(old,value){assert.equal(app.split(old).length,2,'Patch anchor changed: '+old.slice(0,90));app=app.replace(old,value);}
if(!app.includes(mark)){
 replaceOnce("async function openDocument(id){const x=await rpc('document.get',{id});state.doc=x;", "async function openDocument(id){const epoch=state.epoch;const x=await rpc('document.get',{id});if(epoch!==state.epoch||!state.user)return;state.doc=x;");
 const start=app.indexOf('async function getFile(id,preview){');const end=app.indexOf('\n',start);assert(start>=0&&end>start);
 app=app.slice(0,start)+`async function getFile(id,preview){const epoch=state.epoch;const workspaceId=state.workspace?.id;const f=state.resources.find(x=>x.id===id);if(!f)throw Error('Datei nicht gefunden.');notify('Datei wird geladen und geprüft …');const data=await checked(client.storage.from('lunis-reports').download(f.storage_path));const bytes=await data.arrayBuffer();if(epoch!==state.epoch||!state.user||workspaceId!==state.workspace?.id)return;if(bytes.byteLength!==Number(f.size_bytes)||await digest(bytes)!==f.content_sha256)throw Error('Dateiprüfung fehlgeschlagen. Download wurde gestoppt.');if(epoch!==state.epoch||!state.user)return;const blob=new Blob([bytes],{type:f.kind==='pdf'?'application/pdf':'application/zip'});if(preview&&f.kind==='pdf'){if(pdfURL)URLGlobal.revokeObjectURL(pdfURL);pdfURL=URLGlobal.createObjectURL(blob);dialog(f.title,'<iframe id="pdf-preview" class="file-preview" title="Private PDF-Vorschau" referrerpolicy="no-referrer"></iframe>');$('#pdf-preview').src=pdfURL;}else download(f.filename,blob);notify('Dateiinhalt erfolgreich geprüft.');}`+app.slice(end);
 replaceOnce("profile:null,integrations:[],draft:'',events:0", "profile:null,integrations:[],draft:'',events:0,doc:null,signPaths:[],view:'overview',filter:'all',query:'',limit:200");
 replaceOnce("document.body.dataset.auth='signed-out';", "document.body.dataset.auth='signed-out';delete document.body.dataset.role;");
 replaceOnce("$('#auth-view').hidden=true;$('#load-state').hidden=false;", "$('#auth-view').hidden=true;$('#signed-app').hidden=true;closeDialog();$('#load-state').hidden=false;");
 replaceOnce("await loadAll();subscribe();", "await loadAll();if(epoch!==state.epoch)return;subscribe();");
 replaceOnce("function closeDialog(){$('#dialog').close();", "function closeDialog(){$('#dialog').close();$('#dialog-content').replaceChildren();state.doc=null;state.signPaths=[];");
 replaceOnce("$('#dialog').addEventListener('close',()=>{if(pdfURL)", "$('#dialog').addEventListener('close',()=>{if($('#dialog').open)return;$('#dialog-content').replaceChildren();state.doc=null;state.signPaths=[];if(pdfURL)");
 replaceOnce("window.addEventListener('pagehide',", "window.addEventListener('pageshow',event=>{if(event.persisted&&state.user)enter(state.workspace?.id).catch(err);});\nwindow.addEventListener('pagehide',");
 replaceOnce("$('#fatal').hidden=true;document.body.dataset.build=BUILD;", "$('#fatal').hidden=true;document.body.dataset.readiness='readiness-20260922-2';document.body.dataset.build=BUILD;");
 app+='\n'+mark+'\n';fs.writeFileSync(file,app);
}
assert(!app.includes('createSignedUrl('),'Private downloads must use authenticated storage requests');
assert(app.includes('if(epoch!==state.epoch||!state.user)return;state.doc=x;'));
assert(app.includes("state.doc=null;state.signPaths=[];"));
assert(app.includes("document.body.dataset.readiness='readiness-20260922-2'"));
const cloudFile='experience/tests/cloud.mjs';
if(fs.existsSync(cloudFile)){
 let cloud=fs.readFileSync(cloudFile,'utf8');
 if(!cloud.includes("from './readiness-cloud.mjs'")){
  cloud="import { runReadiness } from './readiness-cloud.mjs';\n"+cloud;
  const marker=" await step('Logout clears session and private rendered content'";
  assert(cloud.includes(marker),'Missing E2E integration anchor');
  cloud=cloud.replace(marker," await runReadiness({step,expect,admin,member,adminAPI,memberAPI,viewerAPI,outsiderAPI,fixture,createClient,API,KEY,SITE,OUT,shot,rpc,resource,documentId,signIn});\n"+marker);
  const begin=cloud.indexOf('async function waitSite(){');const end=cloud.indexOf('\ntry{',begin);assert(begin>=0&&end>begin);
  cloud=cloud.slice(0,begin)+`async function waitSite(){const expected=JSON.parse(fs.readFileSync('experience/build.json','utf8'));for(let i=0;i<40;i++){try{const deployed=await fetch(SITE+'build.json?revision='+expected.source_commit,{cache:'no-store'}).then(r=>r.json());if(deployed.source_commit!==expected.source_commit)throw Error('Old deployment');for(const [name,file]of Object.entries(expected.files)){const r=await fetch(SITE+name+'?revision='+expected.source_commit,{cache:'no-store'});if(!r.ok)throw Error('Missing '+name);if(name==='index.html'&&!r.headers.get('content-type')?.includes('text/html'))throw Error('Not HTML');const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Mismatch '+name);}return {files:Object.keys(expected.files).length,source_commit:expected.source_commit};}catch{}await new Promise(r=>setTimeout(r,5000));}throw Error('Published files differ from this exact build');}\n`+cloud.slice(end);
  fs.writeFileSync(cloudFile,cloud);
 }
}
console.log('READINESS_PATCH_OK: authenticated storage, stale-response guards, private dialog cleanup, exact deployment hashes');
