"""Validate the offline report and generate its downloadable package."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import os,re,json,hashlib,zipfile
ROOT=Path('experience/bericht').resolve()
css=ROOT/'assets/style.css'
text=css.read_text()
fix='\n/* Keep the closed mobile drawer out of the keyboard focus order. */\n@media(max-width:700px){.sidebar{visibility:hidden}.sidebar.open{visibility:visible}}\n'
if 'out of the keyboard focus order' not in text:text+=fix
polish='''
/* V4 final print and currency polish: no floating keyboard link in PDFs. */
.cost-equation strong{white-space:nowrap}
@media(max-width:420px){.cost-equation{gap:10px}.cost-equation strong{font-size:25px}.cost-equation small{font-size:8px}}
@media print{
 .skip{display:none!important}
 .source{break-before:avoid;margin-top:7px}
 details>div>p{break-after:avoid}
 body[data-page=kosten] .intro{margin-bottom:20px}
 body[data-page=kosten] .page-icon{margin-bottom:12px}
 body[data-page=kosten] .cost-equation{padding:20px}
 body[data-page=kosten] .section{padding-top:18px}
 body[data-page=kosten] .grid:not(.two){grid-template-columns:repeat(3,1fr)}
 body[data-page=kosten] .card{padding:16px}
 body[data-page=kosten] .card .card-icon{margin-bottom:12px}
 body[data-page=kosten] .card p{font-size:11px}
 body[data-page=kosten] .callout{margin:12px 0;padding:14px}
 body[data-page=kosten] .roi{break-inside:avoid}
}
'''
if 'V4 final print and currency polish' not in text:text+=polish
css.write_text(text)
# Directory links must use GitHub tree, never blob.
for page in ROOT.glob('*.html'):
 s=page.read_text()
 s=re.sub(r'https://github.com/servas-ai/lunis-endbericht/blob/([^/]+)/(versions/endbericht-v[123]/endbericht/)',r'https://github.com/servas-ai/lunis-endbericht/tree/\1/\2',s)
 page.write_text(s)
class HTML(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[];self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id'in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  for name in ('src','href'):
   if a.get(name):self.refs.append((tag,name,a[name]))
parsed={};checks=0
for p in ROOT.glob('*.html'):
 doc=HTML();doc.feed(p.read_text());parsed[p]=doc
 if len(doc.ids)!=len(set(doc.ids)):raise RuntimeError('Duplicate IDs: '+p.name)
 if doc.h1!=1:raise RuntimeError('One heading required: '+p.name)
 if '<!doctype html>' not in p.read_text().lower():raise RuntimeError('Incomplete HTML')
 checks+=3
for p,doc in parsed.items():
 for tag,kind,value in doc.refs:
  url=urlsplit(value)
  if url.scheme or url.netloc:continue
  target=(p.parent/unquote(url.path)).resolve() if url.path else p
  if not target.is_relative_to(ROOT):raise RuntimeError('Escaping local reference')
  if target.name=='Lunis-Bericht-V4.zip':continue
  if not target.exists():raise RuntimeError('Missing local file: '+str(target))
  if url.fragment and target in parsed and unquote(url.fragment) not in parsed[target].ids:raise RuntimeError('Missing section: '+value)
  checks+=1
for f in ROOT.rglob('*'):
 if f.suffix.lower() not in ('.html','.js','.css','.json','.md','.txt','.csv'):continue
 t=f.read_text()
 if any(x in t for x in ('The requested file reference is not currently visible','sb_secret_','SUPABASE_SERVICE_ROLE_KEY','postgres://')):raise RuntimeError('Unsafe or placeholder content: '+str(f))
 checks+=1
font=(ROOT/'assets/manrope.css').read_text()
if font.count('@font-face')!=4 or 'data:font/woff2;base64,' not in font:raise RuntimeError('Offline font embedding missing')
# After the browser pass, reject a new dangling fourth cost-page regression.
proof_path=Path('proof/report-v4/report-e2e.json')
if proof_path.exists():
 proof=json.loads(proof_path.read_text())
 if proof.get('source_commit')==os.environ.get('GITHUB_SHA'):
  if proof.get('status')!='PASSED':raise RuntimeError('Report browser checks failed')
  pdf=Path('proof/report-v4/kosten-print-proof.pdf').read_bytes()
  pages=len(re.findall(rb'/Type\s*/Page\b',pdf))
  if not 1<=pages<=3:raise RuntimeError('Cost print layout needs review: '+str(pages)+' pages')
  print('REPORT_PRINT_GATE_OK',pages,'pages')
manifest={'build':'bericht-v4-20260922','source_commit':os.environ.get('GITHUB_SHA'),'html_pages':11,'report_chapters':10,'static_checks':checks,'portal_evidence_run':35720887432,'files':{}}
for f in sorted(ROOT.rglob('*')):
 if f.is_file() and f.name!='build.json' and f.suffix!='.zip':
  b=f.read_bytes();manifest['files'][str(f.relative_to(ROOT))]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
(ROOT/'build.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
zip_path=ROOT/'exports/Lunis-Bericht-V4.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in sorted(ROOT.rglob('*')):
  if f.is_file() and f!=zip_path:z.write(f,'Lunis-Bericht-V4/'+str(f.relative_to(ROOT)))
print('REPORT_VALIDATED',json.dumps({'checks':checks,'files':len(manifest['files']),'zip_bytes':zip_path.stat().st_size}))
