import { createHash } from 'node:crypto';
export async function runReadiness(c){
 const {step,expect,admin,member,adminAPI,memberAPI,viewerAPI,outsiderAPI,fixture,createClient,API,KEY,shot,rpc,resource,documentId,signIn}=c;
 const deny=async(p)=>expect((await p).error).toBeTruthy();
 await step('Readiness revision is active in both browser sessions',async()=>{
  for(const page of [admin,member])await expect(page.locator('body')).toHaveAttribute('data-readiness','readiness-20260922-2');
 });
 await step('Malformed payloads and invalid comments fail closed',async()=>{
  for(const payload of [null,[],{workspace_id:fixture.workspace_id,category:'general',body:null},{workspace_id:fixture.workspace_id,category:'general',body:'x'.repeat(6001)},{workspace_id:fixture.workspace_id,category:'unknown',body:'Invalid category'}])await deny(memberAPI.rpc('lunis_portal',{p_action:'feedback.create',p_payload:payload}));
 });
 await step('Concurrent retries produce one row and reject a changed payload',async()=>{
  const p={category:'general',body:'Parallel retry '+fixture.run_key,request_id:crypto.randomUUID(),rating:3};
  const responses=await Promise.all(Array.from({length:4},()=>rpc(memberAPI,'feedback.create',p)));
  for(const response of responses)expect(response.error).toBeNull();
  expect(new Set(responses.map(r=>r.data.id)).size).toBe(1);
  for(const change of [{category:'bug'},{rating:5},{body:'Changed body'}])await deny(rpc(memberAPI,'feedback.create',{...p,...change}));
  const count=await memberAPI.from('lunis_feedback').select('id').eq('workspace_id',fixture.workspace_id).eq('client_request_id',p.request_id);expect(count.data).toHaveLength(1);
 });
 await step('Anonymous and outsider access cannot expose private table rows',async()=>{
  const anon=createClient(API,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  for(const table of ['lunis_feedback','lunis_documents','lunis_document_versions','lunis_signatures','lunis_resources','lunis_memberships','lunis_audit','lunis_integrations','lunis_experiments']){
   const r=await outsiderAPI.from(table).select('*').eq('workspace_id',fixture.workspace_id);expect(r.error).toBeNull();expect(r.data).toEqual([]);
   const a=await anon.from(table).select('*').eq('workspace_id',fixture.workspace_id);expect(!!a.error||a.data?.length===0).toBe(true);
  }
  for(const f of ['lunis_ci_claim','lunis_ci_cleanup'])await deny(memberAPI.rpc(f,{p_run_key:fixture.run_key}));
 });
 await step('Invitations reject a wrong identity and a revoked token',async()=>{
  const inv=await rpc(adminAPI,'admin.invite',{email:fixture.users.viewer.email,role:'viewer'});expect(inv.error).toBeNull();
  await deny(rpc(outsiderAPI,'invite.accept',{token:inv.data.token}));
  expect((await rpc(adminAPI,'admin.revoke',{id:inv.data.id})).error).toBeNull();
  await deny(rpc(viewerAPI,'invite.accept',{token:inv.data.token}));
 });
 await step('Signatures reject missing consent, tampering, stale versions and duplicates',async()=>{
  const doc=await rpc(memberAPI,'document.get',{id:documentId});expect(doc.error).toBeNull();
  const p={document_id:documentId,version_id:doc.data.version.id,signer_name:fixture.users.member.name,consent:true,signature_svg:''};
  for(const change of [{consent:false},{signer_name:'Different person'},{version_id:crypto.randomUUID()},{signature_svg:'<svg><script>alert(1)</script></svg>'},{}])await deny(rpc(memberAPI,'document.sign',{...p,...change}));
  const unchanged=await rpc(memberAPI,'document.get',{id:documentId});expect(unchanged.data.signatures).toHaveLength(1);
 });
 await step('Storage rejects HTML uploads and mismatched file registration',async()=>{
  const bytes=Buffer.from('Synthetic CI MIME consistency test');const sha=createHash('sha256').update(bytes).digest('hex');
  const prefix=fixture.workspace_id+'/'+sha+'/';
  await deny(adminAPI.storage.from('lunis-reports').upload(prefix+'blocked.html',bytes,{contentType:'text/html'}));
  const upload=await adminAPI.storage.from('lunis-reports').upload(prefix+'Mismatch.zip',bytes,{contentType:'application/pdf'});expect(upload.error).toBeNull();
  await deny(rpc(adminAPI,'resource.register',{title:'Mismatch must not register',filename:'Mismatch.zip',sha256:sha,kind:'zip'}));
  await deny(rpc(adminAPI,'resource.register',{title:'No kind',filename:'Mismatch.zip',sha256:sha,kind:null}));
  await deny(rpc(memberAPI,'resource.register',{title:'Unauthorized',filename:'Mismatch.zip',sha256:sha,kind:'zip'}));
 });
 await step('Role changes take effect server-side without issuing a new login token',async()=>{
  try{
   expect((await rpc(adminAPI,'admin.role',{user_id:fixture.users.member.id,role:'viewer'})).error).toBeNull();
   await deny(rpc(memberAPI,'feedback.create',{body:'Downgraded writer must not write',category:'general'}));
  }finally{expect((await rpc(adminAPI,'admin.role',{user_id:fixture.users.member.id,role:'member'})).error).toBeNull();}
 });
 await step('Private dialog content is removed after closing',async()=>{
  await admin.locator('#app-nav [data-view="documents"]').click();
  await admin.locator('.list-card').filter({hasText:'E2E Testfreigabe '+fixture.run_key}).getByRole('button',{name:/Ansehen/}).click();
  await expect(admin.locator('#document-body')).toBeVisible();await shot(admin,'12-readiness-private-document');
  await admin.getByRole('button',{name:'Dialog schließen'}).click();expect(await admin.locator('#dialog-content').innerHTML()).toBe('');
 });
 await step('Logout suppresses a delayed private download and allows safe re-login',async()=>{
  await member.locator('#app-nav [data-view="files"]').click();
  let release,intercepted,finished;let started=false,routeError=null,downloads=0;
  const waiting=new Promise(r=>{intercepted=r;}),hold=new Promise(r=>{release=r;}),done=new Promise(r=>{finished=r;});
  const onDownload=()=>{downloads++;};member.on('download',onDownload);
  const pattern='**/storage/v1/object/**';
  const handler=async route=>{
   started=true;
   try{
    const request=route.request();
    const hasAuth=!!(await request.headerValue('authorization'))?.startsWith('Bearer ');
    const response=await route.fetch({timeout:20000});
    intercepted({url:request.url(),hasAuth,status:response.status()});
    await hold;await route.fulfill({response});
   }catch(e){routeError=String(e.message);intercepted({error:'Delayed-response harness failed'});}
   finally{finished();}
  };
  await member.route(pattern,handler);
  let timer;
  try{
   await member.getByRole('button',{name:'Herunterladen',exact:true}).click();
   const request=await Promise.race([waiting,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Authenticated download request missing')),30000);})]);
   clearTimeout(timer);
   expect(request.error).toBeUndefined();expect(request.hasAuth).toBe(true);expect(request.status).toBe(200);
   expect(new URL(request.url).pathname).toBe('/storage/v1/object/lunis-reports/'+resource.storage_path);
   expect(new URL(request.url).searchParams.has('token')).toBe(false);
   await member.getByRole('button',{name:'Abmelden',exact:true}).click();
   await expect(member.locator('body')).toHaveAttribute('data-auth','signed-out');release();await done;
   expect(routeError).toBeNull();await member.waitForTimeout(2000);
   expect(downloads).toBe(0);expect(await member.locator('#dialog-content').innerHTML()).toBe('');expect(await member.locator('#signed-app').innerHTML()).toBe('');
   await shot(member,'13-readiness-safe-logout');
  }finally{
   clearTimeout(timer);release();if(started)await done;
   await member.unroute(pattern,handler);member.off('download',onDownload);
  }
  await signIn(member,'member');await expect(member.locator('body')).toHaveAttribute('data-role','member');
 });
}
