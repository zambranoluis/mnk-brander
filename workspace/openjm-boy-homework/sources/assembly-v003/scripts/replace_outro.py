"""Swap only a validated local media reference and remove the placeholder label.

Use in a new revision. The review JSON records actual visual inspection;
technical metadata alone cannot establish the laptop content or its time offset.
"""
from pathlib import Path
import argparse, json
from validate_outro import validate
from build import build

ROOT=Path(__file__).resolve().parents[1]
def replace(media,review):
 p=(ROOT/media).resolve()
 if not p.is_relative_to(ROOT):raise ValueError('Copy replacement into this project first')
 r=validate(p)
 if not r['technicalPass']:raise ValueError(json.dumps(r['checks']))
 reviewed=json.loads(Path(review).read_text(encoding='utf-8'))
 if reviewed.get('sha256')!=r['sha256']:raise ValueError('Visual review hash must identify this exact candidate')
 for field in ['framingAndTimingMatch','presentationStartsAtFrame75','overlapFrames75Through90Synchronized','continuousPresentationPlayback','occlusionAndEdgesReviewed','noBakedLabel']:
  if reviewed.get(field) is not True:raise ValueError('Missing completed visual check: '+field)
 if not reviewed.get('reviewer') or not reviewed.get('evidence'):raise ValueError('Record actual reviewer and visual evidence')
 m=json.loads((ROOT/'assembly.json').read_text(encoding='utf-8'))
 slot=next(s for s in m['slots'] if s['id']=='outro-composite')
 assert slot['durationFrames']==151
 slot['media']=p.relative_to(ROOT).as_posix()
 m['outroContract']['status']='replaced'
 m['status']='composite-integrated-awaiting-assembly-recheck'
 (ROOT/'assembly.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
 (ROOT/'replacement-review.json').write_text(json.dumps({'technical':r,'visual':reviewed},indent=2)+'\n',encoding='utf-8')
 build()
 print('Reference swapped; label removed. Recheck and rerender this revision.')

if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--media',required=True);a.add_argument('--review',required=True);args=a.parse_args();replace(args.media,args.review)
