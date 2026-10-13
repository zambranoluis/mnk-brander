"""Check retained runtime references without reading the original workspace."""
import argparse
from html.parser import HTMLParser
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote


def check_project(root):
    root = Path(root).resolve()
    refs, errors = [], []

    def check(base, url):
        url = html.unescape(url).strip(' \"\'')
        if not url or url.startswith(('data:', 'http:', 'https:', '#', 'blob:')): return
        target = (base.parent / unquote(url.split('?')[0].split('#')[0])).resolve()
        refs.append({'file': str(base.relative_to(root)), 'url': url})
        if not target.is_relative_to(root) or not target.is_file(): errors.append(refs[-1])

    class Parser(HTMLParser):
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            for key in ['src', 'data-composition-src']:
                if key in attrs: check(self.file, attrs[key])
            if tag == 'link' and 'href' in attrs: check(self.file, attrs['href'])
            for url in re.findall(r'url\(([^)]+)\)', attrs.get('style', '')): check(self.file, url)

    for p in root.rglob('*'):
        if any(x in {'node_modules', '.hyperframes', 'local', '__pycache__'} for x in p.relative_to(root).parts): continue
        if p.suffix == '.html':
            parser = Parser(); parser.file = p; parser.feed(p.read_text(encoding='utf-8'))
        if p.suffix in {'.html', '.css'}:
            for url in re.findall(r'url\(([^)]+)\)', p.read_text(encoding='utf-8')): check(p, url)
    for filename, keys in [('assembly.json', []), ('sfx-cues.json', ['base_master', 'narration_sidechain', 'picture_reference', 'output'])]:
        p = root / filename
        if not p.exists(): continue
        data = json.loads(p.read_text(encoding='utf-8'))
        for key in keys: check(p, data[key])
        for slot in data.get('slots', []): check(p, slot['media'])
        for cue in data.get('cues', []): check(p, cue['asset'])
        if data.get('duck'): check(p, data['duck']['source'])
        for key in ['source', 'preview', 'baseMaster', 'cueManifest']:
            if key in data.get('audio', {}): check(p, data['audio'][key])
    prep = root / 'sfx-preparation.json'
    if prep.exists():
        for row in json.loads(prep.read_text(encoding='utf-8'))['derivatives']:
            for key in ['source', 'output']: check(prep, row[key])
    config = root / 'project.json'
    if config.exists():
        data = json.loads(config.read_text(encoding='utf-8'))
        for key in ['movie', 'mix', 'stem', 'preview', 'picture_reference', 'native_ending']:
            check(config, data[key].format(revision=data['revision']))
    return {'root': str(root), 'references': len(refs), 'missing': errors}


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('root'); ap.add_argument('--evidence', type=Path)
    a = ap.parse_args(); result = check_project(a.root)
    if a.evidence:
        a.evidence.parent.mkdir(parents=True, exist_ok=True)
        a.evidence.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({**result, 'missing': result['missing'][:10]}, indent=2))
    raise SystemExit(bool(result['missing']))
