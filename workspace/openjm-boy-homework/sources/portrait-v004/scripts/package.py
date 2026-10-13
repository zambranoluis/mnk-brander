"""Archive only independent editing/runtime files; extract and compare every byte."""
from pathlib import Path
import argparse,zipfile,hashlib,json,re,html
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1];a=argparse.ArgumentParser();a.add_argument('--output',required=True);a.add_argument('--evidence',required=True);args=a.parse_args();E=Path(args.evidence).resolve();E.mkdir(parents=True,exist_ok=True);archive=Path(args.output).resolve()
skip={'node_modules','.hyperframes','.thumbnails','local','renders','__pycache__','.waveform-cache'}
files=[p for p in R.rglob('*') if p.is_file() and not any(x in skip for x in p.relative_to(R).parts)]
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in files:z.write(f,'portrait-v004/'+f.relative_to(R).as_posix())
extract=E/'package-extracted';extract.mkdir(exist_ok=True)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for name in z.namelist():assert (extract/name).resolve().is_relative_to(extract)
 z.extractall(extract)
copied=extract/'portrait-v004';hashes=[]
for f in files:
 rel=f.relative_to(R);digest=hashlib.sha256(f.read_bytes()).hexdigest();assert hashlib.sha256((copied/rel).read_bytes()).hexdigest()==digest;hashes.append({'path':rel.as_posix(),'sha256':digest})
refs=[];missing=[]
def check(base,url):
 url=html.unescape(url.strip(' \"\''))
 if not url or url.startswith(('data:','http:','https:','#','blob:')):return
 target=(base.parent/url.split('?')[0].split('#')[0]).resolve()
 refs.append(str(target.relative_to(copied)) if target.is_relative_to(copied) else str(target))
 if not target.is_relative_to(copied) or not target.is_file():missing.append({'file':str(base.relative_to(copied)),'url':url})
class Parser(HTMLParser):
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  for key in ['src','data-composition-src']:
   if key in attrs:check(self.file,attrs[key])
  if tag=='link' and 'href' in attrs:check(self.file,attrs['href'])
  for url in re.findall(r'url\(([^)]+)\)',attrs.get('style','')):check(self.file,url)
for f in copied.rglob('*.html'):
 parser=Parser();parser.file=f;parser.feed(f.read_text(encoding='utf8'))
for f in copied.rglob('*.css'):
 for url in re.findall(r'url\(([^)]+)\)',f.read_text(encoding='utf8')):check(f,url)
result={'archive':archive.name,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'localReferences':len(refs),'missing':missing,'hashes':hashes}
(E/'package-check.json').write_text(json.dumps(result,indent=2));assert not missing,missing[:10];print('Verified archive',len(files),'files and',len(refs),'local runtime references')
