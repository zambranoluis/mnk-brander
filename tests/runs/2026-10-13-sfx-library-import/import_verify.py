"""Task-scoped unchanged import and read-only verification; never runs historical scripts."""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
E = Path(__file__).resolve().parent
C = ROOT / 'workspace/openjm-boy-homework'
M = Path('M:/workspace/brander/openjm-boy-homework')
V = M / 'output/portrait-v006'
D = Path('C:/Users/MrMonka/Desktop/commercial/audio/sound-effects')
T = C / 'revisions/sfx-library-import'
S = C / 'sources/sfx-v006'
A = C / 'assets/sfx-v006'

def sha(p):
    with p.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()

def read(p):
    return json.loads(p.read_text(encoding='utf-8'))

def save(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

def entries():
    result = []
    for p in sorted((V/'assets/sfx').rglob('*')):
        if p.is_file():
            rel = p.relative_to(V/'assets/sfx')
            source = D/p.name if rel.parts[0] == 'originals' else p
            result.append((source, A/rel, 'library', p))
    names = ['README.md', 'VERIFICATION.md', 'commercial-record.md',
             'sfx-preparation.json', 'sfx-cues.json', 'package.json',
             'package-lock.json', 'requirements.txt', 'hyperframes.json', 'assembly.json',
             'sources/ui-cue-states.json', 'sources/audio-v002-mix-settings.json',
             'sources/assembly-v003.json', 'ui/music/timing.json', 'ui/video/timing.json']
    names += ['scripts/'+n for n in ['prepare-sfx.py', 'extract-cue-events.cjs',
              'make-sfx-cues.py', 'mix-sfx.py', 'compare-audio.py', 'verify_sfx.py', 'verify.py']]
    result += [(V/n, S/n, 'historical-reference', None) for n in names]
    result.append((M/'assets/sfx-v006/provenance.json', S/'workspace-originals-provenance.json',
                   'historical-originals-provenance', None))
    return result

def do_import():
    rows = []
    for source, dest, role, counterpart in entries():
        digest = sha(source)
        if counterpart is not None:
            assert sha(counterpart) == digest, str(counterpart)
        if dest.exists():
            assert dest.is_file() and sha(dest) == digest, 'Conflicting destination: '+str(dest)
        row = dict(source=source.as_posix(), destination=dest.relative_to(C).as_posix(),
                   role=role, bytes=source.stat().st_size, sha256=digest)
        if role == 'library' and source.parent == D:
            counterparts = [counterpart, M/'assets/sfx-v006/originals'/source.name]
            assert all(sha(p) == digest for p in counterparts)
            row['matching_M_originals'] = [p.as_posix() for p in counterparts]
        rows.append(row)
    assert len([r for r in rows if r['role']=='library']) == 26
    # Capture the pre-existing commercial, productions, and earlier recovery evidence.
    roots = [C, ROOT/'productions', ROOT/'tests/runs/2026-10-13-pre-sfx-recovery']
    before = {p.relative_to(ROOT).as_posix(): sha(p) for base in roots
              for p in sorted(base.rglob('*')) if p.is_file()}
    save(E/'preservation-before.json', before)
    for row in rows:
        source, dest = Path(row['source']), C/row['destination']
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            with source.open('rb') as src, dest.open('xb') as out:
                shutil.copyfileobj(src, out)
        assert sha(dest) == row['sha256'] == sha(source)
    save(T/'import-inventory.json', rows)
    mapping = {'scope':'Paths relative to the historical portrait-v006 project root; destinations relative to the commercial root.',
               'paths':{'assets/sfx/'+p.relative_to(A).as_posix():p.relative_to(C).as_posix()
                        for p in sorted(A.rglob('*')) if p.is_file()}}
    save(T/'path-mapping.json', mapping)
    print(json.dumps(dict(copied_files=len(rows), library_files=26,
                         library_bytes=sum(r['bytes'] for r in rows if r['role']=='library'),
                         preserved_before=len(before))))

def probe_audio(p):
    probe_cmd = ['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]
    probe = subprocess.run(probe_cmd, capture_output=True, text=True)
    assert probe.returncode == 0 and not probe.stderr, (p,probe.stderr)
    info = json.loads(probe.stdout)
    stream = next(s for s in info['streams'] if s['codec_type']=='audio')
    cmd = ['ffmpeg','-nostdin','-hide_banner','-v','error','-xerror','-err_detect','explode',
           '-i',str(p),'-map','0:a:0','-f','null','-']
    decode = subprocess.run(cmd, capture_output=True, text=True)
    return dict(file=p.relative_to(C).as_posix(),sha256=sha(p),
                duration_seconds=float(stream.get('duration',info['format']['duration'])),
                sample_rate=int(stream['sample_rate']),channels=stream['channels'],
                codec=stream['codec_name'],probe_exit=probe.returncode,probe_errors=probe.stderr,
                decode_exit=decode.returncode,decode_errors=decode.stderr,decode_command=cmd)

def verify():
    rows = read(T/'import-inventory.json')
    for r in rows:
        assert sha(C/r['destination']) == r['sha256'] == sha(Path(r['source'])),r
        for other in r.get('matching_M_originals',[]):
            assert sha(Path(other)) == r['sha256']
    paths = sorted(p for p in A.rglob('*') if p.suffix in {'.mp3','.wav','.ogg'})
    assert len(paths)==23
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        audio = list(pool.map(probe_audio,paths))
    save(E/'audio-probes-and-decodes.json',audio)
    assert all(r['decode_exit']==0 and not r['decode_errors'] for r in audio)
    mapping = read(T/'path-mapping.json')['paths']
    cues = read(S/'sfx-cues.json')
    assert len(cues['cues'])==117
    resolved = []
    for cue in cues['cues']:
        dest = C/mapping[cue['asset']]
        assert dest.is_file(),cue
        resolved.append(dict(id=cue['id'],historical_asset=cue['asset'],destination=mapping[cue['asset']]))
    recipes = read(S/'sfx-preparation.json')['derivatives']
    for recipe in recipes:
        assert (C/mapping[recipe['source']]).is_file()
        assert (C/mapping[recipe['output']]).is_file()
    for item in read(A/'provenance.json'):
        assert sha(C/mapping[item['path']])==item['sha256']
    save(E/'cue-resolution.json',resolved)
    before = read(E/'preservation-before.json')
    allowed = {'workspace/openjm-boy-homework/README.md',
               'workspace/openjm-boy-homework/openjm-boy-homework-commercial.md'}
    changed = [name for name,digest in before.items() if not (ROOT/name).is_file() or sha(ROOT/name)!=digest]
    assert set(changed)<=allowed,changed
    recovery = read(C/'revisions/pre-sfx-baseline/recovery-files.json')
    assert all(sha(C/r['destination'])==r['sha256'] for r in recovery)
    videos = [dict(file=r['destination'],sha256=sha(C/r['destination']))
              for r in recovery if r['destination'].startswith('output/') and r['destination'].endswith('.mp4')]
    assert len(videos)==2
    result = dict(status='passed', copied_files_sha256_verified=len(rows),
                  desktop_originals_matching_both_M_copies=6, library_files=26,
                  library_bytes=sum(r['bytes'] for r in rows if r['role']=='library'),
                  audio_files_probed_and_fully_decoded=len(audio),decode_errors=0,
                  cues_resolved=len(resolved),prepared_recipes_resolved=len(recipes),
                  generated_texture='Retained warm-texture.wav; historical seeded-noise recipe inspected, not executed.',
                  provenance_hashes_verified=11,recovery_copies_preserved=len(recovery),
                  pre_existing_files_checked=len(before),authorized_current_documents_changed=changed,
                  selected_base_hashes=videos,
                  historical_scripts_executed=False,dependencies_installed=False,
                  human_listening='Pending; no audibility or quality approval from this import.',
                  preservation_scope='All pre-existing commercial files, productions and pre-sfx recovery evidence; copied M sources and both M original locations plus Desktop originals. No claim about other M files.',
                  tools={name:subprocess.check_output([name,'-version'],text=True).splitlines()[0]
                         for name in ['ffmpeg','ffprobe']})
    save(E/'verification.json',result)
    print(json.dumps(result,indent=2))

if __name__ == '__main__':
    {'import':do_import,'verify':verify}[sys.argv[1]]()
