"""Prepare fixed, reviewed public assets. Never export auth tokens or account data."""
import os,io,json,base64,hashlib,shutil,zipfile,urllib.request,urllib.error
from pathlib import Path
OUT=Path('experience/bericht/assets');OUT.mkdir(parents=True,exist_ok=True)
for name in ('brand.svg','icon.svg'):
 raw=Path('experience',name).read_bytes()
 if len(raw)<500 or b'<svg' not in raw:raise RuntimeError('Canonical branding missing')
 (OUT/name).write_bytes(raw)
FONT=Path(os.environ['LUNIS_TOOLS'])/'node_modules/@fontsource/manrope'
faces=[]
for weight in (400,600,700,800):
 raw=(FONT/f'files/manrope-latin-{weight}-normal.woff2').read_bytes()
 if not raw.startswith(b'wOF2'):raise RuntimeError('Font asset invalid')
 faces.append('@font-face{font-family:Manrope;font-style:normal;font-weight:'+str(weight)+';font-display:swap;src:url(data:font/woff2;base64,'+base64.b64encode(raw).decode()+') format("woff2")}')
(OUT/'manrope.css').write_text('\n'.join(faces))
license_files=[p for p in FONT.iterdir() if p.name.lower().startswith(('license','ofl'))]
if not license_files:raise RuntimeError('Font license missing')
shutil.copyfile(license_files[0],OUT/'OFL-Manrope.txt')
# Download only the fixed synthetic screenshot evidence; do not forward the
# GitHub API credential to the signed artifact storage URL.
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
req=urllib.request.Request('https://api.github.com/repos/Martin-Hausleitner/lunis-status/actions/artifacts/10691656355/zip',headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Lunis-Report-Builder'})
try:
 with urllib.request.build_opener(NoRedirect()).open(req,timeout=60) as r:raw=r.read()
except urllib.error.HTTPError as e:
 if e.code not in (301,302,303,307,308):raise RuntimeError('Historical evidence artifact unavailable') from None
 location=e.headers['Location']
 if not location.startswith('https://'):raise RuntimeError('Unencrypted artifact redirect')
 with urllib.request.urlopen(location,timeout=60) as r:raw=r.read()
expected='24222ac00c3bb94f732ac776504279f78eebc9ed7d621e3bb7e53e541944a6b9'
if hashlib.sha256(raw).hexdigest()!=expected:raise RuntimeError('Historical screenshot package hash mismatch')
(OUT/'screens').mkdir(exist_ok=True)
with zipfile.ZipFile(io.BytesIO(raw)) as z:
 for name in ('02-admin-overview.png','04-admin-comments.png','07-private-files.png','09-mobile-overview.png'):
  candidates=[n for n in z.namelist() if Path(n).name==name]
  if len(candidates)!=1:raise RuntimeError('Evidence image not uniquely present')
  image=z.read(candidates[0])
  if not image.startswith(b'\x89PNG\r\n\x1a\n'):raise RuntimeError('Evidence image invalid')
  (OUT/'screens'/name).write_bytes(image)
(OUT/'screens/PROVENANCE.json').write_text(json.dumps({'source_run':35720887432,'artifact_id':10691656355,'artifact_sha256':expected,'classification':'Genuine historical Chromium cloud test screenshots; synthetic test data only. Not newly captured report screenshots.'},indent=2))
print('REPORT_ASSETS_OK: canonical logo, locally embedded Manrope, four hash-verified synthetic portal screenshots')
