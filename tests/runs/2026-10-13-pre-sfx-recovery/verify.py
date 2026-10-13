"""Read-only recovery checks; evidence writes stay in this run directory."""
from pathlib import Path
import concurrent.futures
import csv
import hashlib
import html
import json
import re
import subprocess
import sys
from collections import Counter
from urllib.parse import unquote, urlsplit

sys.dont_write_bytecode = True
RUN = Path(__file__).resolve().parent
ROOT = RUN.parents[2]
DEST = ROOT/'workspace/openjm-boy-homework'
TASK = DEST/'revisions/pre-sfx-baseline'
SOURCE = Path('M:/workspace/brander/openjm-boy-homework')

def sha(p):
    with p.open('rb') as f: return hashlib.file_digest(f,'sha256').hexdigest()

def save(name,data):
    (RUN/name).write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

def run(args):
    p=subprocess.run([str(x) for x in args],capture_output=True,text=True,encoding='utf-8')
    assert p.returncode==0, {'command':list(map(str,args)),'code':p.returncode,'stderr':p.stderr}
    return p

def packets(p,stream):
    return json.loads(run(['ffprobe','-v','error','-select_streams',stream,'-show_packets',
        '-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash,side_data_list',
        '-of','json',p]).stdout)['packets']

def video(row):
    p=DEST/row['destination']; portrait='portrait' in p.name
    info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',p]).stdout)
    v=next(s for s in info['streams'] if s['codec_type']=='video')
    a=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_frames']))==((1080,1920,'25/1',2748) if portrait else (1920,1080,'25/1',2748))
    assert abs(float(v['duration'])-109.92)<1e-6
    assert abs(float(info['format']['duration'])-109.92)<1e-6
    command=['ffmpeg','-hide_banner','-v','error','-xerror','-err_detect','explode','-i',p,
             '-map','0:v:0','-map','0:a:0','-progress','pipe:1','-nostats','-f','null','-']
    d=run(command)
    (RUN/(p.stem+'-decode.log')).write_text(d.stdout+d.stderr,encoding='utf-8')
    frames=int(re.findall(r'^frame=(\d+)',d.stdout,re.M)[-1])
    assert frames==2748 and not d.stderr.strip() and 'progress=end' in d.stdout
    save(p.stem+'-probe.json',info)
    print('Decoded '+p.name+': '+str(frames)+' frames, audio and video, no errors',flush=True)
    return {'file':row['destination'],'sha256':sha(p),'width':v['width'],'height':v['height'],
            'fps':v['avg_frame_rate'],'duration_seconds':float(v['duration']),'container_duration_seconds':float(info['format']['duration']),
            'declared_frames':int(v['nb_frames']),'decoded_frames':frames,'audio_codec':a['codec_name'],
            'audio_sample_rate':a['sample_rate'],'audio_channels':a['channels'],
            'decode_exit':d.returncode,'decode_errors':d.stderr,'decode_command':list(map(str,command))}

def references(rows,omitted):
    known={(DEST/r['expected_project_path']).resolve():r for r in omitted}
    by_original={Path(r['original']).resolve():r for r in omitted}
    current_outputs={Path(r['original']).resolve():r for r in rows if r['role']=='base-video'}
    result=[]; history=[]
    def classify(p,src,target,runtime=False,project=None):
        target=html.unescape(target).strip().strip('\"\'')
        if not target or target.startswith(('#','data:','blob:','javascript:')): return None
        parsed=urlsplit(target)
        if parsed.scheme or parsed.netloc:
            status='historical-preview-url' if 'localhost' in target or '127.0.0.1' in target else 'external-reference-not-fetched'
            return {'file':p.relative_to(DEST).as_posix(),'reference':target,'classification':status}
        local=unquote(parsed.path)
        if not local: return None
        dest=(p.parent/local).resolve(); original=(src.parent/local).resolve()
        if runtime and local.startswith('/') and project:
            dest=(project/local.lstrip('/')).resolve()
        status='locally-present' if dest.exists() else 'unresolved-historical-or-dynamic-reference'
        if not dest.exists() and (dest in known or original in by_original): status='known-omitted-asset'
        if not dest.exists() and original in current_outputs: status='base-video-relocated-to-shallow-output'
        if not dest.exists() and status=='unresolved-historical-or-dynamic-reference':
            if local.lower().endswith('.zip'): status='excluded-historical-package'
            elif 'tests/' in local.replace('\\','/'): status='unavailable-historical-evidence'
            elif 'node_modules' in local: status='excluded-installed-dependency'
        return {'file':p.relative_to(DEST).as_posix(),'reference':target,'classification':status,
                'resolved_destination':dest.as_posix(),'original_resolved_reference':original.as_posix()}
    for row in rows:
        p=DEST/row['destination']; src=Path(row['original'])
        if p.suffix=='.md':
            body=p.read_text(encoding='utf-8-sig')
            for target in re.findall(r'\]\(([^)]+)\)',body):
                item=classify(p,src,target)
                if item: history.append(item)
        if p.suffix in {'.html','.css'}:
            body=p.read_text(encoding='utf-8-sig')
            targets=re.findall(r'(?:src|href|poster)\s*=\s*[\"\']([^\"\']+)',body,re.I)
            targets+=re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',body,re.I)
            project=DEST/'sources'/p.relative_to(DEST).parts[1] if p.relative_to(DEST).parts[0]=='sources' else None
            for target in sorted(set(targets)):
                item=classify(p,src,target,True,project)
                if item: result.append(item)
        if p.name=='assembly.json':
            manifest=json.loads(p.read_text())
            for slot in manifest['slots']:
                for key in ('source','media'):
                    item=classify(p,src,slot[key])
                    if item: result.append(item)
            if 'audio' in manifest:
                result.append(classify(p,src,manifest['audio']['source']))
    save('source-reference-audit.json',{'scope':'Static HTML src/href/poster, CSS url(), assembly source/media/audio paths only; JS computed references and runtime execution are not certified.',
        'counts':dict(Counter(x['classification'] for x in result)),'references':result})
    save('historical-links.json',{'scope':'Unmodified recovered Markdown only; old missing links are retained as history and do not imply current availability.',
        'counts':dict(Counter(x['classification'] for x in history)),'references':history})
    return {'runtime_literal_counts':dict(Counter(x['classification'] for x in result)),
            'historical_link_counts':dict(Counter(x['classification'] for x in history))}

def preservation(rows,omitted):
    before=json.loads((RUN/'local-before.json').read_text())
    changed=[]
    for rel,r in before.items():
        p=ROOT/rel
        if not p.is_file() or sha(p)!=r['sha256']: changed.append(rel)
    # Identify unexpected new files outside this task's two authorized roots.
    import os
    now=set()
    for base,dirs,files in os.walk(ROOT):
        dirs[:]=[d for d in dirs if d not in {'.git','.codex'} and not any((Path(base)/d).resolve().is_relative_to(x) for x in (RUN,DEST))]
        for name in files: now.add((Path(base)/name).relative_to(ROOT).as_posix())
    unexpected=sorted(now-set(before))
    source_before=json.loads((RUN/'source-before.json').read_text()); source_changes=[]
    for name,r in source_before.items():
        p=Path(name)
        if not p.is_file() or p.stat().st_size!=r['bytes'] or p.stat().st_mtime_ns!=r['mtime_ns']: source_changes.append(name)
    for row in rows:
        assert sha(Path(row['original']))==row['sha256'] and sha(DEST/row['destination'])==row['sha256'],row
    for row in omitted:
        assert sha(Path(row['original']))==row['sha256'],row['original']
        assert not (DEST/row['expected_project_path']).exists(),row['expected_project_path']
    source_now=set()
    for project in ('assembly-v003','audio-v002','portrait-v004'):
        source_now.update(p.as_posix() for p in (SOURCE/'output'/project).rglob('*') if p.is_file())
    source_now.update(p.as_posix() for p in (SOURCE/'assets/audio-v002').rglob('*') if p.is_file())
    source_now.add((SOURCE/'openjm-boy-homework-commercial.md').as_posix())
    source_added=sorted(source_now-set(source_before))
    assert not changed and not unexpected and not source_changes and not source_added, (changed,unexpected,source_changes,source_added)
    media={p.relative_to(DEST).as_posix() for p in DEST.rglob('*') if p.is_file() and p.suffix.lower() in {'.mp4','.mp3','.m4a','.wav','.flac','.png','.jpg','.jpeg','.svg','.webp','.glb','.ttf','.woff','.woff2','.zip'}}
    assert media=={r['destination'] for r in rows if r['role']=='base-video'},media
    assert not [p for p in DEST.rglob('*') if p.name in {'AGENTS.md','CLAUDE.md','node_modules','__pycache__','.hyperframes','.waveform-cache','versions'}]
    git=run(['git','status','--porcelain=v1','-uall']).stdout.splitlines()
    save('git-after.json',git)
    return {'existing_local_files_hashed':len(before),'productions_files_hashed':sum(x.startswith('productions/') for x in before),
            'changed_existing_files':changed,'unexpected_new_files_outside_recovery':unexpected,
            'source_files_metadata_checked':len(source_before),'source_metadata_changes':source_changes,'source_added_files':source_added,
            'source_files_sha256_checked':len(rows)+len(omitted),'all_copy_hashes_match':True,
            'omitted_assets_remain_absent':True,'only_two_media_files_recovered':True,'old_agent_instructions_absent':True,
            'scope':'All preexisting local repo files except .git/.codex and this run; M: selected three project trees, audio-v002 asset tree and old record. M: operations were read-only; no claim about unrelated M: content.'}

def main():
    save('verification.json',{'status':'in-progress'})
    rows=json.loads((TASK/'recovery-files.json').read_text())
    with (TASK/'omitted-dependencies.csv').open(encoding='utf-8',newline='') as f: omitted=list(csv.DictReader(f))
    videos=[r for r in rows if r['role']=='base-video']
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results=list(pool.map(video,videos))
    landscape=DEST/videos[0]['destination']; portrait=DEST/videos[1]['destination']
    a=packets(landscape,'a:0');b=packets(portrait,'a:0');assert a==b
    v=packets(portrait,'v:0'); assert len(v)==2748
    later={}
    for rev in ('v005','v006'):
        p=SOURCE/f'output/portrait-{rev}/openjm-assembly-v003-audio-v002-portrait-{rev}.mp4'
        q=packets(p,'v:0'); assert q==v
        later[rev]={'file':p.as_posix(),'picture_packets_equal_to_v004':True,'packet_count':len(q)}
    refs=references(rows,omitted)
    # Reuse the existing checker without importing it or writing bytecode.
    namespace={'__file__':str(ROOT/'scripts/check_docs.py'),'__name__':'recovery_doc_check'}
    exec(compile((ROOT/'scripts/check_docs.py').read_text(encoding='utf-8'),'check_docs.py','exec'),namespace)
    authored=[DEST/'README.md',DEST/'openjm-boy-homework-commercial.md',TASK/'README.md',TASK/'DEPENDENCIES.md']
    errors,links=namespace['check_documents'](ROOT,[p.relative_to(ROOT).as_posix() for p in authored])
    assert not errors,errors
    preserve=preservation(rows,omitted)
    result={'status':'passed','date':'2026-10-13','copies_sha256_verified':len(rows),'omitted_assets':len(omitted),
            'videos':results,'audio_packets':{'identical_payloads_timestamps_durations_and_side_data':True,'count':len(a)},
            'later_portrait_picture_comparison':later,'current_navigation':{'documents':len(authored),'local_links':links,'errors':errors},
            'reference_classification':refs,'preservation':preserve,
            'limits':['No render/remix/source build/dependency installation was run.','No current preview, normal-speed human viewing or listening approval is claimed.',
                      'Static reference extraction is scoped; arbitrary JavaScript paths were not executed.','Historical reproduction and verification claims are not current readiness checks.']}
    save('verification.json',result)
    print(json.dumps({k:result[k] for k in ('status','copies_sha256_verified','omitted_assets','audio_packets','current_navigation','reference_classification','preservation')},indent=2))

if __name__=='__main__': main()
