"""Sample-accurate supplied-audio mix; run with the commercial's NumPy Python.

Commands: prepare, mix, verify. FFmpeg/FFprobe must be on PATH.
No picture rendering, source rewriting, provider access or speed changes.
"""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import numpy as np

OUT = Path(__file__).resolve().parent
COMMERCIAL = OUT.parent.parent
ROOT = COMMERCIAL.parent.parent
ASSETS = COMMERCIAL / 'assets/audio-v002'
ORIGINALS = ASSETS / 'originals'
DERIVED = ASSETS / 'derived'
LOCAL = COMMERCIAL / 'local/audio-v002-mix'
EVIDENCE = ROOT / 'tests/runs/openjm-audio-v002-mix-20261011'
DESKTOP = Path.home() / 'Desktop/commercial/audio'
PICTURE = OUT.parent / 'assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4'
WAV = OUT / 'openjm-audio-v002-mix.wav'
MP4 = OUT / 'openjm-assembly-v003-audio-v002.mp4'
SR = 48000
COUNT = 5276160
STARTS = [0.8, 11, 33.2, 43.2, 53.2, 59, 82, 96.8, 105.2]

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

def sha(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()

def run(args, data=None):
    p = subprocess.run([str(a) for a in args], input=data, capture_output=True)
    if p.returncode:
        raise RuntimeError(p.stderr.decode(errors='replace'))
    return p

def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]).stdout)

def decode(path, channels=2, filters=None):
    cmd = ['ffmpeg', '-v', 'error', '-xerror', '-i', path, '-vn']
    if filters:
        cmd += ['-af', filters]
    cmd += ['-ar', str(SR), '-ac', str(channels), '-f', 'f32le', '-']
    return np.frombuffer(run(cmd).stdout, dtype='<f4').reshape(-1, channels).copy()

def save_audio(path, data, pcm='pcm_f32le'):
    run(['ffmpeg', '-v', 'error', '-n', '-f', 'f32le', '-ar', SR, '-ac', 2,
         '-i', '-', '-c:a', pcm, path], data.astype('<f4').tobytes())

def meter(path, label):
    p = run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-vn', '-af',
             'loudnorm=I=-16:TP=-1.5:LRA=20:print_format=json', '-f', 'null', '-'])
    log = p.stderr.decode(errors='replace')
    (EVIDENCE / (label + '-loudness.log')).write_text(log, encoding='utf-8')
    return json.loads(re.findall(r'\{\s*"input_i".*?\}', log, re.S)[-1])

def prepare():
    for p in [ORIGINALS, DERIVED, LOCAL, EVIDENCE]:
        p.mkdir(parents=True, exist_ok=True)
    expected = {f'N{i:02}.mp3' for i in range(1,10)} | {'instrumental.mp3', 'homework-generated-short-song.mp3'}
    assert {p.name for p in DESKTOP.glob('*.mp3')} == expected
    preserved = list((OUT.parent / 'audio-v001').glob('*')) + list(OUT.glob('*.md')) + [OUT / 'timing.json', PICTURE, OUT.parent / 'openjm-assembly-v003-editable.zip']
    baseline = {str(p.relative_to(ROOT)): sha(p) for p in preserved if p.is_file()}
    assert baseline[str(PICTURE.relative_to(ROOT))] == '0f1475223c65865d7edbdd0bd9e4ca9d22434cc3807831aac30c25f920b3a4b3'
    write_json(EVIDENCE / 'preservation-before.json', baseline)
    snapshot = ASSETS / 'prompt-package-before-mix'
    snapshot.mkdir(exist_ok=True)
    for p in [*OUT.glob('*.md'), OUT / 'timing.json']:
        assert not (snapshot / p.name).exists()
        shutil.copy2(p, snapshot / p.name)
    transcripts = Path(os.environ['TEMP']) / 'openjm-audio-inspection-20261011'
    for p in transcripts.glob('*.json'):
        dest = EVIDENCE / 'prior-local-transcripts' / p.name
        dest.parent.mkdir(exist_ok=True)
        shutil.copy2(p, dest)
    inventory = []
    for name in sorted(expected):
        src, dst = DESKTOP / name, ORIGINALS / name
        assert not dst.exists()
        shutil.copy2(src, dst)
        assert sha(src) == sha(dst)
        channels = 1 if name.startswith('N') else 2
        raw = decode(dst, channels)
        stereo = np.repeat(raw, 2, axis=1) if channels == 1 else raw
        derived = DERIVED / (dst.stem + '-48k.wav')
        save_audio(derived, stereo)
        loud = meter(derived, dst.stem)
        # Activity is diagnostic only: do not cut interior pauses or infer words.
        active = np.flatnonzero(np.max(np.abs(stereo), axis=1) > 10 ** (-50 / 20))
        item = dict(filename=name, sha256=sha(src), bytes=src.stat().st_size,
                    decoded_samples=len(stereo), duration_seconds=len(stereo)/SR,
                    activity_first_seconds=int(active[0])/SR,
                    activity_last_seconds=(int(active[-1])+1)/SR,
                    loudness=loud, metadata=probe(dst))
        inventory.append(item)
        print(name, 'seconds', item['duration_seconds'], 'last activity', item['activity_last_seconds'], 'LUFS', loud['input_i'], flush=True)
    write_json(EVIDENCE / 'input-inventory.json', inventory)
    write_json(ASSETS / 'input-manifest.json', {
        'origin': str(DESKTOP), 'originals': inventory,
        'voice_id_model_settings': 'Not supplied; cannot infer reliably from MP3 metadata.',
        'prior_transcripts': str((EVIDENCE / 'prior-local-transcripts').relative_to(ROOT)),
        'transcription_limit': 'Automated wording evidence only; no pronunciation, voice consistency or subjective approval.'})

def smooth(a, b, n):
    x = np.linspace(0, 1, n, dtype=np.float64)
    return a + (b-a) * (0.5 - 0.5*np.cos(np.pi*x))

def mix():
    inventory = {x['filename']: x for x in json.loads((EVIDENCE / 'input-inventory.json').read_text())}
    voice = np.zeros((COUNT, 2), dtype=np.float64)
    duck = np.zeros(COUNT, dtype=np.float64)
    cues = []
    for i, start in enumerate(STARTS, 1):
        name = f'N{i:02}'
        x = decode(DERIVED / (name + '-48k.wav')).astype(np.float64)
        original_samples = len(x)
        if i == 9:
            x = x[:round(3.6*SR)]
            removed = decode(DERIVED / (name + '-48k.wav'))[len(x):]
            assert np.max(np.abs(removed)) < 10**(-60/20), 'N09 trim contains material signal'
        gain = -17.5 - float(inventory[name+'.mp3']['loudness']['input_i'])
        x *= 10**(gain/20)
        begin = round(start*SR)
        voice[begin:begin+len(x)] += x
        activity_end = start + min(len(x)/SR, inventory[name+'.mp3']['activity_last_seconds'])
        # 150ms anticipatory duck; preserve phrase gaps; recover over 450ms.
        a, b, c, d = [round(t*SR) for t in [start-.15, start, activity_end+.08, activity_end+.53]]
        duck[a:b] = np.maximum(duck[a:b], smooth(0,1,b-a))
        duck[b:c] = 1
        duck[c:d] = np.maximum(duck[c:d], smooth(1,0,d-c))
        cues.append(dict(id=name, file='../../assets/audio-v002/originals/'+name+'.mp3',
                         start=start, start_sample=begin, end=start+len(x)/SR,
                         samples=len(x), original_samples=original_samples,
                         trailing_trim_samples=original_samples-len(x), gain_db=gain,
                         activity_end=activity_end, pace=1))
    bed = decode(DERIVED / 'instrumental-48k.wav').astype(np.float64)
    assert len(bed) >= COUNT
    bed = bed[:COUNT]
    # Mild speech-following spectral space, wet/dry controlled by the same duck.
    carved = decode(DERIVED / 'instrumental-48k.wav', filters='equalizer=f=1600:t=q:w=0.7:g=-3')[:COUNT]
    bed = bed*(1-duck[:,None]) + carved*duck[:,None]
    bed_gain = -24 - float(inventory['instrumental.mp3']['loudness']['input_i'])
    bed *= (10**((bed_gain-7.5*duck)/20))[:,None]
    envelope = np.ones(COUNT)
    envelope[:2*SR] = smooth(0,1,2*SR)
    a,b,c,d = [round(t*SR) for t in [76.56,76.96,80.96,82]]
    envelope[a:b] = smooth(1,0,b-a)
    envelope[b:c] = 0
    envelope[c:d] = smooth(0,1,d-c)
    a = round(108.8*SR)
    envelope[a:] = smooth(1,0,COUNT-a)
    bed *= envelope[:,None]
    song_excerpt = decode(DERIVED / 'homework-generated-short-song-48k.wav')[:3*SR].astype(np.float64)
    # Fade only the final 10ms; source zero and original pace are unchanged.
    song_excerpt[-480:] *= smooth(1,0,480)[:,None]
    excerpt_path = LOCAL / 'song-excerpt-unlevelled.wav'
    save_audio(excerpt_path, song_excerpt)
    song_loudness = meter(excerpt_path, 'song-excerpt')
    song_gain = -17.5 - float(song_loudness['input_i'])
    song_excerpt *= 10**(song_gain/20)
    song = np.zeros_like(voice)
    song[3694080:3838080] = song_excerpt
    for name, data in [('narration', voice), ('instrumental', bed), ('song', song)]:
        save_audio(DERIVED / (name+'-timeline.wav'), data)
    premix = LOCAL / 'premix.wav'
    save_audio(premix, voice+bed+song)
    measurement = meter(premix, 'premix')
    filt = ('loudnorm=I=-16:TP=-1.5:LRA=20:linear=true:print_format=json'
            f":measured_I={measurement['input_i']}:measured_TP={measurement['input_tp']}"
            f":measured_LRA={measurement['input_lra']}:measured_thresh={measurement['input_thresh']}"
            f":offset={measurement['target_offset']},aresample=48000,apad=whole_len={COUNT},atrim=end_sample={COUNT}")
    normalized = LOCAL / 'normalized.wav'
    p = run(['ffmpeg','-hide_banner','-nostats','-n','-i',premix,'-af',filt,'-ar',SR,'-ac',2,'-c:a','pcm_s24le',normalized])
    (EVIDENCE / 'master-normalization.log').write_bytes(p.stderr)
    finalize(normalized)
    write_json(OUT / 'mix-settings.json', dict(sample_rate=SR, samples=COUNT, cues=cues,
         instrumental_base_target_lufs=-24, narration_target_lufs=-17.5, duck_db=7.5,
         duck_attack_seconds=.15, duck_release_seconds=.45,
         carve=dict(frequency=1600,q=.7,gain_db=-3,automation='cue envelope wet/dry'),
         bed_source_timeline='continuous from source zero, including across mute',
         song_source_samples=[0,144000],song_timeline_samples=[3694080,3838080],
         song_declick_samples=480,song_gain_db=song_gain,master_filter=filt,
         narration_processing='centre mono, constant per-take gain; no pace, EQ or interior edits',
         listening_status='Human pronunciation, voice consistency, clarity, balance and transitions pending.'))
    print(json.dumps({'WAV':meter(WAV,'master-wav'),'AAC':meter(MP4,'encoded-aac')},indent=2), flush=True)

def finalize(normalized):
    data = decode(normalized)
    # Resampling after oversampled true-peak limiting can leave sub-LSB ringing.
    # Enforce the authored silent gap in PCM after all filtering/quantization.
    data[3838080:3886080] = 0
    data[-1] = 0
    save_audio(WAV, data, 'pcm_s24le')
    run(['ffmpeg','-v','error','-n','-i',PICTURE,'-i',WAV,'-map','0:v:0','-map','1:a:0',
         '-c:v','copy','-c:a','aac','-b:a','320k','-ar',SR,'-movflags','+faststart',MP4])

def verify():
    # Independent encoded packet and decoded frame comparisons.
    def packets(path):
        p = run(['ffprobe','-v','error','-select_streams','v:0','-show_packets','-show_data_hash','sha256',
                 '-show_entries','packet=pts,dts,duration,size,flags,data_hash','-of','json',path])
        return json.loads(p.stdout)['packets']
    def frames(path, label):
        p = run(['ffmpeg','-v','error','-xerror','-i',path,'-map','0:v:0','-an','-f','framemd5','-'])
        (EVIDENCE / (label+'-frames.md5')).write_bytes(p.stdout)
        return [line for line in p.stdout.decode().splitlines() if not line.startswith('#')]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        a,b = list(pool.map(packets,[PICTURE,MP4]))
        assert a==b and len(a)==2748
        write_json(EVIDENCE / 'video-packets-source.json',a)
        write_json(EVIDENCE / 'video-packets-export.json',b)
        fs=pool.submit(frames,PICTURE,'source')
        fe=pool.submit(frames,MP4,'export')
        source_frames,export_frames=fs.result(),fe.result()
    assert source_frames==export_frames and len(source_frames)==2748
    p=run(['ffmpeg','-v','error','-xerror','-i',MP4,'-f','null','-'])
    (EVIDENCE/'full-decode.log').write_bytes(p.stderr or b'Full audio/video decode passed.\n')
    wav,aac=decode(WAV),decode(MP4)
    assert len(wav)==COUNT and np.all(wav[-1]==0)
    song=decode(DERIVED/'song-timeline.wav')
    bed=decode(DERIVED/'instrumental-timeline.wav')
    voice=decode(DERIVED/'narration-timeline.wav')
    assert np.all(song[:3694080]==0) and np.all(song[3838080:]==0)
    assert np.any(song[3694080:3838080]) and np.all(song[3838079]==0)
    assert np.all(bed[3694080:3886080]==0)
    assert np.all(voice[3694080:3886080]==0)
    assert np.all(wav[3838080:3886080]==0)
    assert np.array_equal(voice[:,0],voice[:,1])
    settings=json.loads((OUT/'mix-settings.json').read_text())
    original_excerpt=decode(DERIVED/'homework-generated-short-song-48k.wav')[:144000].astype(np.float64)
    original_excerpt[-480:]*=smooth(1,0,480)[:,None]
    original_excerpt*=10**(settings['song_gain_db']/20)
    song_error=float(np.max(np.abs(song[3694080:3838080]-original_excerpt)))
    assert song_error<1e-6
    # All placed narration samples equal the original resampling times one gain.
    narration_errors={}
    for cue in settings['cues']:
        raw=decode(DERIVED/(cue['id']+'-48k.wav'))[:cue['samples']]
        at=cue['start_sample']
        error=float(np.max(np.abs(voice[at:at+len(raw)]-raw*10**(cue['gain_db']/20))))
        assert error<1e-6
        narration_errors[cue['id']]=error
    preserved=json.loads((EVIDENCE/'preservation-before.json').read_text())
    preservation={}
    mutable={str((OUT/n).relative_to(ROOT)) for n in ['README.md','mix-and-verification.md','timing.json']}
    for name,value in preserved.items():
        checked=(ASSETS/'prompt-package-before-mix'/Path(name).name) if name in mutable else ROOT/name
        preservation[name]={'sha256':sha(checked),'matches':sha(checked)==value,'checked':str(checked.relative_to(ROOT))}
        assert preservation[name]['matches']
    for item in json.loads((EVIDENCE/'input-inventory.json').read_text()):
        assert sha(DESKTOP/item['filename'])==item['sha256']==sha(ORIGINALS/item['filename'])
    loud={name:meter(path,name+'-verified') for name,path in [('wav',WAV),('aac',MP4)]}
    for value in loud.values():
        assert abs(float(value['input_i'])+16)<=1 and float(value['input_tp'])<=-1
    meta=probe(MP4)
    v=next(s for s in meta['streams'] if s['codec_type']=='video')
    au=next(s for s in meta['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['avg_frame_rate'],v['nb_frames'],v['duration'])==(1920,1080,'25/1','2748','109.920000')
    assert au['start_time']=='0.000000' and au['duration']=='109.920000'
    # Quantify lossy codec boundary smear, rather than pretending AAC is sample exact.
    boundary={}
    for label,sec in [('song-start',76.96),('pause',79.96),('bed-return',80.96)]:
        n=round(sec*SR)
        boundary[label]={}
        for side,l,r in [('before',n-480,n),('after',n,n+480)]:
            peak=float(np.max(np.abs(aac[l:r])))
            boundary[label][side+'_10ms_peak_dbfs']=20*np.log10(max(peak,1e-15))
    report=dict(status='technical-pass-listening-pending',duration_seconds=109.92,
        wav_samples=len(wav),sample_rate=SR,channels=2,wav_last_sample_zero=True,
        aac_decoded_samples=len(aac),aac_container_samples=round(float(au['duration'])*SR),
        aac_padding_samples=len(aac)-COUNT,video_packets_identical=len(a),
        video_frames_identical=len(source_frames),video_timestamps_identical=True,
        original_hashes_rechecked=True,full_decode='pass',loudness=loud,
        song_exact_source_and_placement=True,song_sample_error=song_error,bed_muted_76_96_to_80_96=True,
        wav_pause_digital_silence=True,voice_centred=True,narration_sample_errors=narration_errors,
        aac_boundary_measurements=boundary,
        human_listening='Not performed: speech clarity, consistent voice, Open Jay Em pronunciation, balance and transitions require headphone/speaker review.',
        files={p.name:dict(sha256=sha(p),bytes=p.stat().st_size) for p in [WAV,MP4]})
    write_json(EVIDENCE/'preservation-after.json',preservation)
    write_json(EVIDENCE/'export-metadata.json',meta)
    write_json(EVIDENCE/'verification.json',report)
    print(json.dumps(report,indent=2),flush=True)

if __name__=='__main__':
    {'prepare':prepare,'mix':mix,'verify':verify}[sys.argv[1]]()
