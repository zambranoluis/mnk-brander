"""One-time, no-overwrite recovery. Reads M: and writes only the selected local roots."""
from pathlib import Path
import csv
import hashlib
import json
import shutil
import subprocess
from collections import Counter

ROOT = Path(__file__).resolve().parents[3]
RUN = Path(__file__).resolve().parent
SOURCE = Path('M:/workspace/brander/openjm-boy-homework')
DEST = ROOT / 'workspace/openjm-boy-homework'
TASK = DEST / 'revisions/pre-sfx-baseline'
PROJECTS = ['assembly-v003', 'audio-v002', 'portrait-v004']
SKIP = {'node_modules', 'local', '.hyperframes', '.thumbnails', '.waveform-cache', '__pycache__', '.git'}
TEXT = {'.md', '.json', '.html', '.css', '.js', '.mjs', '.cjs', '.py', '.ts', '.tsx', '.txt', '.in', '.map'}
POLICY = {'AGENTS.md', 'CLAUDE.md', 'SKILL.md'}
VIDEOS = [SOURCE / 'output/audio-v002/openjm-assembly-v003-audio-v002.mp4',
          SOURCE / 'output/portrait-v004/openjm-assembly-v003-audio-v002-portrait-v004.mp4']

def sha(p):
    with p.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()

def save(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

def inventory(root, exclude=()):
    import os
    result = {}
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in {'.git', '.codex'} and not any((Path(base)/d).resolve().is_relative_to(x) for x in exclude)]
        for name in files:
            p = Path(base)/name
            s = p.stat()
            result[p.relative_to(root).as_posix()] = {'bytes': s.st_size, 'mtime_ns': s.st_mtime_ns}
    return result

def purpose(rel):
    s = rel.as_posix().lower()
    if rel.suffix.lower() in {'.ttf', '.woff', '.woff2', '.otf'}: return 'UI typography; required for faithful source rendering'
    if rel.suffix.lower() == '.glb': return 'Original native-ending hummingbird model'
    if rel.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp', '.svg'}: return 'UI artwork, icon, brand artwork or image reference; required where referenced'
    if rel.suffix.lower() in {'.mp3', '.wav', '.m4a', '.flac'}: return 'Audio source, mix or prepared derivative; required for audio rebuild or preview'
    if 'sources/' in s: return 'Retained source footage or soundtrack master; input to picture/audio assembly'
    if 'assets/' in s: return 'Prepared scene playback media; may be regenerated only after source dependencies are supplied'
    if 'renders/' in s: return 'Rendered picture intermediate; input to audio mux or reproducible downstream assembly'
    if 'references/' in s: return 'Historical visual/presentation reference'
    return 'Historical generated media; not an active recovery base'

def main():
    assert not DEST.exists(), 'Recovery refuses an existing commercial destination'
    for p in VIDEOS: assert p.is_file(), p
    before = inventory(ROOT, (RUN, DEST))
    # Hash existing local files, including productions and unrelated user edits.
    for rel, row in before.items(): row['sha256'] = sha(ROOT/rel)
    save(RUN/'local-before.json', before)
    save(RUN/'git-before.json', subprocess.check_output(['git','status','--porcelain=v1','-uall'], cwd=ROOT, text=True).splitlines())
    selected, omitted, ignored = [], [], []
    observed = {}
    for project in PROJECTS:
        base = SOURCE/'output'/project
        for p in sorted(base.rglob('*')):
            if not p.is_file(): continue
            rel = p.relative_to(base)
            stat = p.stat()
            observed[p.as_posix()] = {'bytes': stat.st_size, 'mtime_ns': stat.st_mtime_ns}
            target = DEST/'sources'/project/rel
            if set(rel.parts) & SKIP:
                ignored.append({'original':p.as_posix(), 'reason':'installed dependency/cache/disposable working data'})
            elif p.name in POLICY:
                ignored.append({'original':p.as_posix(), 'reason':'old agent instructions excluded; current workspace policy governs'})
            elif p.suffix.lower() in TEXT:
                p.read_text(encoding='utf-8-sig') # Reject binary or non-text masquerading as source.
                selected.append((p,target,'unchanged-source'))
            elif p in VIDEOS:
                continue
            else:
                omitted.append({'original':p.as_posix(), 'expected_project_path':target.relative_to(DEST).as_posix(),
                                'purpose':purpose(rel), 'classification':'omitted-media-asset',
                                'bytes':stat.st_size,'sha256':sha(p)})
    # Audio provenance lives outside the selected output project. Retain it at its
    # original commercial-relative path so the unchanged mix settings still resolve.
    for p in sorted((SOURCE/'assets/audio-v002').rglob('*')):
        if not p.is_file(): continue
        target = DEST/p.relative_to(SOURCE)
        s = p.stat(); observed[p.as_posix()] = {'bytes':s.st_size,'mtime_ns':s.st_mtime_ns}
        if p.suffix.lower() in TEXT:
            selected.append((p,target,'unchanged-audio-provenance'))
        else:
            omitted.append({'original':p.as_posix(),'expected_project_path':target.relative_to(DEST).as_posix(),
                            'purpose':purpose(p.relative_to(SOURCE)),'classification':'omitted-audio-original-or-derivative',
                            'bytes':s.st_size,'sha256':sha(p)})
    record = SOURCE/'openjm-boy-homework-commercial.md'
    selected.append((record,DEST/'archives/pre-recovery/openjm-boy-homework-commercial.md','historical-record'))
    selected.extend((p,DEST/'output'/p.name,'base-video') for p in VIDEOS)
    for p,_,_ in selected:
        s=p.stat(); observed[p.as_posix()]={'bytes':s.st_size,'mtime_ns':s.st_mtime_ns}
    save(RUN/'source-before.json', observed)
    rows=[]
    for src,dst,role in selected:
        assert dst.resolve().is_relative_to(DEST.resolve())
        assert not dst.exists(), dst
        digest=sha(src)
        dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(src,dst)
        assert sha(dst)==digest and sha(src)==digest, src
        rows.append({'original':src.as_posix(),'destination':dst.relative_to(DEST).as_posix(),
                     'role':role,'bytes':dst.stat().st_size,'sha256':digest})
    save(TASK/'recovery-files.json', rows)
    with (TASK/'omitted-dependencies.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=list(omitted[0]));w.writeheader();w.writerows(omitted)
    save(RUN/'excluded-files.json', ignored)
    save(RUN/'copy-results.json', {'verified_copies':len(rows),'roles':dict(Counter(x['role'] for x in rows)),
         'copied_bytes':sum(x['bytes'] for x in rows),'omitted_assets':len(omitted),'excluded_cache_policy_files':len(ignored),
         'sha256_all_copies_match':True})
    print((RUN/'copy-results.json').read_text())

if __name__ == '__main__': main()
