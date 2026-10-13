"""Verify complete picture identity, cue timing and audio boundaries."""
from pathlib import Path
import argparse,subprocess,json,concurrent.futures,importlib.util
import numpy as np
R=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('mix',R/'scripts/mix-sfx.py');mixmod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mixmod)
def probe(p,args):return json.loads(subprocess.check_output(['ffprobe','-v','error',*args,'-of','json',str(p)]))
def frames(p):return subprocess.check_output(['ffmpeg','-v','error','-threads','2','-i',str(p),'-map','0:v:0','-an','-f','framemd5','-'])
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--evidence',required=True);a=ap.parse_args();E=Path(a.evidence).resolve();E.mkdir(parents=True,exist_ok=True)
 m=json.loads((R/'sfx-cues.json').read_text());final=R/m['output'];ref=R/m['picture_reference'];info=probe(final,['-show_streams','-show_format','-count_frames']);v=next(s for s in info['streams'] if s['codec_type']=='video')
 assert (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_read_frames']))==(1080,1920,'25/1',2748)
 assert abs(float(v['duration'])-109.92)<1e-6
 args=['-select_streams','v:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash,flags']
 before=probe(ref,args)['packets'];after=probe(final,args)['packets'];assert before==after and len(after)==2748
 with concurrent.futures.ThreadPoolExecutor(2) as pool:
  f1=pool.submit(frames,ref);f2=pool.submit(frames,final);old=f1.result();new=f2.result()
 assert old==new,'Decoded frames/timestamps differ';(E/'v005-reference.framemd5').write_bytes(old);(E/'v006-final.framemd5').write_bytes(new)
 decode=subprocess.run(['ffmpeg','-v','error','-i',str(final),'-f','null','-'],capture_output=True);assert decode.returncode==0 and not decode.stderr
 state=json.loads((R/'sources/ui-cue-states.json').read_text());scenes={s['name']:s for s in state['scenes']};sync=[]
 for c in m['cues']:
  if 'source_frame' in c:
   scene=scenes[c['scene']];f=c['source_frame'];assert abs(c['start_seconds']-(scene['startFrame']+f)/25)<1e-5
   if c['kind']=='press':
    e=next(e for e in scene['events'] if e['id']==c['event']);assert e.get('selector') and e['release']>e['press'];assert abs(f/25-e['press'])<.04
   if c['kind']=='typing':
    rows=scene['states'];assert f>0
    if c['field']=='prompt':assert len(rows[f]['typed'])>len(rows[f-1]['typed'])
    else:
     previous={x['id']:x['value'] for x in rows[f-1]['fields']};current={x['id']:x['value'] for x in rows[f]['fields']}
     assert current!=previous,(c['id'],previous,current)
   sync.append({'id':c['id'],'global_frame':scene['startFrame']+f})
  if c['kind']=='typing' and c['field']=='prompt':
   bound=next(x for x in m['typing_boundaries'] if x['scene']==c['scene']);assert c['start_seconds']+c['duration_seconds']<=bound['global_end']
 report=json.loads((E/'mix-report.json').read_text())
 assert all(c['transient_offset_seconds']<.04 for c in report['cue_audit'] if c['kind'] in ['press','typing','paste','result'])
 wav=mixmod.decode(R/'audio/portrait-v006-mix.wav');stem=mixmod.decode(R/'audio/sfx-stem.wav');base=mixmod.decode(R/m['base_master']);voice=mixmod.decode(R/m['narration_sidechain']);SR=48000;N=m['samples']
 assert all(x.shape==(N,2) for x in [wav,stem,base,voice])
 lo,hi=[round(t*SR) for t in m['protected_silence']];assert not np.any(wav[lo:hi]) and not np.any(stem[lo:hi])
 pause=next(c for c in report['cue_audit'] if c['id']=='music-pause');assert pause['end_sample']<=lo
 assert not np.any(stem[round(m['effects_end_by']*SR):]),'Unexpected effect tail'
 assert not np.any(stem[round(52.24*SR):round(56.96*SR)]),'Reaction must remain free of SFX'
 assert not np.any(stem[round(.70*SR):round(.80*SR)]),'Opening overlaps narration'
 assert np.max(np.abs(wav))<1 and np.max(np.abs(stem))<1,'Clipped PCM'
 for path in ['audio/portrait-v006-mix.wav','audio/sfx-stem.wav']:
  s=probe(R/path,['-show_streams'])['streams'][0]
  assert (int(s['sample_rate']),s['channels'],s['codec_name'],int(s['duration_ts']))==(48000,2,'pcm_s24le',N)
 for c in m['cues']:
  if c.get('alignment')=='energy_crest':
   measured=next(x for x in report['cue_audit'] if x['id']==c['id'])
   assert abs(measured['energy_crest_seconds']-c['target_seconds'])<.04
 for name in scenes:
  entry_frames=[c['source_frame'] for c in m['cues'] if c['kind']=='typing' and c.get('field')=='prompt' and c['scene']==name]
  assert all(b-a>=4 for a,b in zip(entry_frames,entry_frames[1:])),(name,entry_frames)
 for asset in json.loads((R/'assets/sfx/provenance.json').read_text()):assert mixmod.sha(R/asset['path'])==asset['sha256']
 mono=np.mean(stem,axis=1);stereo_rms=np.sqrt(np.mean(stem*stem));mono_rms=np.sqrt(np.mean(mono*mono))
 mono_loss=float(20*np.log10(mono_rms/stereo_rms));assert mono_loss>-3,'Excessive mono cancellation'
 final_anchors=[]
 for cue in m['cues']:
  if cue.get('alignment')=='energy_crest' or cue['id']=='fullscreen-air':
   st=round(cue['start_seconds']*SR);n=round(cue['duration_seconds']*SR);x=stem[st:st+n]
   energy=np.mean(x[:n//480*480].reshape(-1,480,2)**2,axis=(1,2));crest=st/SR+(int(energy.argmax())+.5)*.01
   if cue.get('alignment'):assert abs(crest-cue['target_seconds'])<.04
   if cue['id']=='fullscreen-air':assert crest<96.8
   final_anchors.append(dict(id=cue['id'],final_stem_crest_seconds=crest))
 audio_args=['-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,data_hash']
 assert probe(final,audio_args)['packets']==probe(R/'audio/portrait-v006-preview.m4a',audio_args)['packets'],'Preview AAC differs'
 song_start,song_end=[round(t*SR) for t in m['protected_song']]
 song_delta=wav[song_start:song_end]-base[song_start:song_end]-stem[song_start:song_end]
 block=4800;nr=N//block
 rms=lambda x:np.sqrt(np.mean(x[:nr*block].reshape(nr,block,2)**2,axis=(1,2)))
 vr=rms(voice);sr=rms(stem);mask=(vr>10**(-35/20))&(sr>1e-8)
 ratios=20*np.log10(sr[mask]/vr[mask]);worst=float(ratios.max());assert worst<-12,('SFX could mask narration',worst)
 aac=mixmod.decode(final);gap=aac[lo:hi];active=np.flatnonzero(np.max(np.abs(gap),axis=1)>1e-7)
 current=json.loads((R/'assembly.json').read_text());prior=json.loads((R/'sources/assembly-v003.json').read_text());assert current['transitions']==prior['transitions']
 for s,p in zip(current['slots'],prior['slots']):
  for k in ['id','startFrame','durationFrames','sourceInFrame']:assert s[k]==p[k]
 result=dict(videoPacketsIdentical=len(after),decodedFramesIdentical=2748,videoTimestampsIdentical=True,dimensions=[1080,1920],fps=25,duration=109.92,samples=N,pcmSilenceSamples=hi-lo,pauseTapEnds=pause['end_sample']/SR,maxTransientOffsetSeconds=max(c['transient_offset_seconds'] for c in report['cue_audit'] if c['kind'] in ['press','typing','paste','result']),worstSfxToNarrationRmsDb100ms=worst,songMaximumDifferenceAfterSubtractingSfx=float(np.abs(song_delta).max()),aacGapResidualPeakDbFS=float(20*np.log10(max(np.abs(gap).max(),1e-15))),aacGapResidueLastSample=int(active[-1]) if len(active) else None,aacSamples=len(aac),pictureTimingUnchanged=True,decode='passed',sync=sync,monoFoldDownRmsChangeDb=mono_loss,stereoCorrelation=float(np.corrcoef(stem.T)[0,1]),effectsLastSampleSeconds=(np.flatnonzero(np.max(np.abs(stem),axis=1)>0)[-1]+1)/SR,listening='Not performed by agent; headphone and speaker review pending.')
 result['finalCueAnchors']=final_anchors;result['previewAacPacketsIdentical']=True
 (E/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='sync'}))
if __name__=='__main__':main()
