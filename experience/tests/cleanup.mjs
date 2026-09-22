import fs from 'node:fs';
const endpoint='https://eomffuubhvsfzitphwbk.supabase.co/functions/v1/lunis-ci-fixture';
async function identity(){const url=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);url.searchParams.set('audience','urn:lunis:ci');const response=await fetch(url,{headers:{Authorization:'Bearer '+process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('CI identity unavailable');const {value}=await response.json();console.log('::add-mask::'+value);return value;}
const results=[];
for(const action of ['cleanup','recover-readiness-run']){
 try{let result;
  for(let attempt=0;attempt<3;attempt++){
   const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+await identity(),'Content-Type':'application/json'},body:JSON.stringify({action}),signal:AbortSignal.timeout(60000)});
   if(response.ok){result=await response.json();break;}
   if(attempt===2)throw Error('Scoped cleanup failed: HTTP '+response.status);
   await new Promise(r=>setTimeout(r,3000));
  }
  if(!result?.cleaned)throw Error('Cleanup was not confirmed');
  results.push({action,cleaned:true,run_key:result.run_key,deleted_test_users:result.deleted_test_users});
 }catch(e){results.push({action,cleaned:false,error:e.message});process.exitCode=1;}
}
fs.mkdirSync('proof',{recursive:true});fs.writeFileSync('proof/cleanup-independent.json',JSON.stringify({checked_at:new Date().toISOString(),results},null,2));
console.log('INDEPENDENT_CLEANUP '+JSON.stringify(results));
