import fs from 'node:fs';
const cssFiles=[
  'assets/style.css',
  'experience/style.css',
  'experience/report-src/style.css',
  'experience/bericht/assets/style.css'
];
for(const file of cssFiles){
  const css=fs.readFileSync(file,'utf8');
  if(/#dc2438/i.test(css)) throw Error(file+': legacy Lunis red #dc2438 found');
  if(!css.includes('#fe0942')) throw Error(file+': canonical Lunis red missing');
  if(!css.includes('LUNIS_CANONICAL_UI_20260922')) throw Error(file+': canonical control contract missing');
}
const normalize=s=>s.replace(/\s+/g,' ').trim();
const liveLogo=normalize(fs.readFileSync('experience/brand.svg','utf8'));
const statusLogo=normalize(fs.readFileSync('assets/brand/logo.svg','utf8'));
if(liveLogo!==statusLogo) throw Error('Canonical Lunis logo drift between experience and status assets');
console.log('UI_CONTRACT_OK: logo, red token and red control keyline are consistent');
