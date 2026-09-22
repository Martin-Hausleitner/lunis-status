import fs from 'node:fs';
// Reproducible source correction following visual inspection of the first
// genuine mobile screenshot. Only the account text may be hidden, not logout.
const cssPath='experience/style.css';
let css=fs.readFileSync(cssPath,'utf8');
css=css.replace('.topbar .small{display:none}', '.topbar div.small{display:none}');
if(!css.includes('.topbar div.small{display:none}'))throw Error('Mobile account selector changed; review required');
fs.writeFileSync(cssPath,css);
const appPath='experience/app.js';
let app=fs.readFileSync(appPath,'utf8');
const before="document.body.dataset.liveEvents='0';}";
const after="document.body.dataset.liveEvents='0';$('#realtime').lastElementChild.textContent='Anmeldung erforderlich';$('#auth-error').hidden=true;}";
if(app.includes(before))app=app.replace(before,after);
fs.writeFileSync(appPath,app);
const testPath='experience/tests/cloud.mjs';
let tests=fs.readFileSync(testPath,'utf8');
const name='Mobile logout remains accessible and clears the private session';
if(!tests.includes(name)){
 const marker=" await step('PWA caches only the application shell, never Supabase/private files'";
 if(!tests.includes(marker))throw Error('Expected mobile regression insertion point missing');
 const extra=` await step('${name}',async()=>{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await signIn(page,'member');await expect(page.getByRole('button',{name:'Abmelden',exact:true})).toBeVisible();await shot(page,'11-mobile-account-controls');await page.getByRole('button',{name:'Abmelden',exact:true}).click();await expect(page.locator('body')).toHaveAttribute('data-auth','signed-out');expect(await page.locator('#signed-app').innerHTML()).toBe('');await expect(page.locator('#realtime')).toContainText('Anmeldung erforderlich');await context.close();});\n`;
 tests=tests.replace(marker,extra+marker);
}
if(!tests.includes("css.includes('.topbar div.small{display:none}')"))tests=tests.replace("if(r.ok&&r.headers", "const css=await fetch(SITE+'style.css?build='+process.env.GITHUB_SHA,{cache:'no-store'}).then(r=>r.text());if(css.includes('.topbar div.small{display:none}')&&r.ok&&r.headers");
fs.writeFileSync(testPath,tests);
console.log('MOBILE_POLISH_OK');
