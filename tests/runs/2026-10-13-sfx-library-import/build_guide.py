"""Build a current reading guide from retained manifests; no media generation."""
from import_verify import A, C, E, M, S, T, V, read, save, sha
from collections import Counter
import csv
import re
from pathlib import Path

def write_new(path, body):
    with path.open('x', encoding='utf-8', newline='\n') as f:
        f.write(body)

def table(headers, rows):
    return '\n'.join(['| '+' | '.join(headers)+' |', '| '+' | '.join(['---']*len(headers))+' |']+
                     ['| '+' | '.join(str(c) for c in row)+' |' for row in rows])

manifest = read(S/'sfx-cues.json')
cues = manifest['cues']
recipes = read(S/'sfx-preparation.json')['derivatives']
measurements = {r['id']:r for r in read(A/'prepared/measurements.json')}
mapping = read(T/'path-mapping.json')['paths']
fields = list(dict.fromkeys(k for c in cues for k in c)) + ['imported_asset']
with (T/'historical-cues.csv').open('x',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields)
    writer.writeheader()
    writer.writerows(dict(c,imported_asset=mapping[c['asset']]) for c in cues)

omitted = {
 'sources/audio-v002-master.wav':'Required lossless baseline for mix-sfx.py; a decoded selected MP4 is not a bit-identical substitute.',
 'sources/narration-sidechain.wav':'Required only by verify_sfx.py for narration masking measurements; mixer ducks from timing JSON.',
 'sources/portrait-v005-picture-reference.mp4':'Required video for historical mux and identity checks; its old soundtrack serves A/B comparison only.',
 'openjm-assembly-v003-audio-v002-portrait-v006.mp4':'Historical complete output; required for comparison and verification.',
 'audio/portrait-v006-mix.wav':'Historical complete mixed output; required by verification.',
 'audio/sfx-stem.wav':'Historical full-length SFX stem; required by verification.',
 'audio/portrait-v006-preview.m4a':'Historical encoded preview; required by verification.'
}
save(T/'omitted-full-mix-dependencies.json',[
    dict(historical_path=name,source=(V/name).as_posix(),bytes=(V/name).stat().st_size,
         sha256=sha(V/name),classification='intentionally omitted',role=role)
    for name,role in omitted.items()])

historical_links=[]
inventory = read(T/'import-inventory.json')
historical_map = {str(Path(r['source']).resolve()).lower():r['destination'] for r in inventory}
for doc in ['README.md','VERIFICATION.md','commercial-record.md']:
    for label,target in re.findall(r'\[([^\]]+)\]\(([^)]+)\)',(S/doc).read_text(encoding='utf-8')):
        original=(V/target).resolve()
        local=(S/target).resolve()
        if target.startswith('assets/sfx/'):
            dest=mapping[target];classification='available through library path mapping'
        elif str(original).lower() in historical_map:
            dest=historical_map[str(original).lower()];classification='retained historical reference'
        else:
            dest=None
            classification='omitted full-mix input or output' if target in omitted else 'omitted picture or project documentation'
        historical_links.append(dict(document='sources/sfx-v006/'+doc,label=label,target=target,
            classification=classification,mapped_destination=dest,
            literal_imported_link_exists=local.exists(),original_exists=original.exists()))
save(E/'historical-links.json',historical_links)

original_rows=[]
for r in recipes:
    if '/originals/' not in r['source'] or r['id']=='fullscreen':
        continue
    name=Path(r['source']).name
    derivatives=', '.join('`'+x['id']+'.wav`' for x in recipes if x['source']==r['source'])
    original_rows.append([f'[{name}](../../assets/sfx-v006/originals/{name})', derivatives])
cc0_rows=[]
for name in ['click_001.ogg','click_002.ogg','click_003.ogg','select_001.ogg','confirmation_001.ogg']:
    uses=', '.join('`'+r['id']+'.wav`' for r in recipes if r['source'].endswith('/'+name)) or 'Retained in original selection; no preparation recipe or cue uses it.'
    cc0_rows.append([f'[{name}](../../assets/sfx-v006/cc0/{name})',uses])
prepared_rows=[]
for r in recipes:
    prepared_rows.append([f"[{r['id']}.wav](../../assets/sfx-v006/prepared/{r['id']}.wav)",
                          Path(r['source']).name,f"{r['trim'][0]}–{r['trim'][1]}",
                          f"`{r['filters']}`",f"{r['fade_in']} / {r['fade_out']}",
                          measurements[r['id']]['prepared']['duration']])
prepared_rows.append(['[warm-texture.wav](../../assets/sfx-v006/prepared/warm-texture.wav)',
                      'PCG64 seeded noise','0–0.70','`highpass=f=180,lowpass=f=650`','sin² envelope',0.70])
anchor_rows=[]
for c in cues:
    if c['kind'] in ['opening','physical','expansion','flight','settle','ending'] or c['id'].endswith('-complete') or c['id']=='music-pause':
        anchor_rows.append([c['id'],c['start_seconds'],c['duration_seconds'],c['trim_start_seconds'],c['gain_db'],c['pan']])
speech_rows=[[c['id'],c['start'],round(c['end'],8)] for c in read(S/'sources/audio-v002-mix-settings.json')['cues']]

body='''# V006 sound-effects library guide

Import complete, 2026-10-13. This private commercial library contains 26 unchanged files (1,931,282 bytes): six MP3 originals, 12 prepared WAVs, five OGG UI sounds, provenance, measurements and the original CC0 license. Another 23 unchanged historical reference files retain the preparation, cues, scripts, dependencies and original workspace provenance. [Import inventory](import-inventory.json) records all 49 source paths, destinations and SHA-256 hashes.

The selected [landscape](../../output/openjm-assembly-v003-audio-v002.mp4) and [portrait V004](../../output/openjm-assembly-v003-audio-v002-portrait-v004.mp4) videos remain the editing bases. No effects were applied. Historical placements below belong to **portrait V006**, even where the two formats share timing. Applying them to either selected base requires a subsequent editing task, synchronization review and a new output filename.

## Creation history and missing prompts

**Original SFX generation prompts were not located in the inspected M: commercial.** The [unchanged package provenance](../../assets/sfx-v006/provenance.json), [original workspace provenance](../../sources/sfx-v006/workspace-originals-provenance.json), historical V006 guides, preparation scripts/manifests and SFX passages in the original commercial record identify user-supplied ElevenLabs recordings. Provider settings were not supplied. No model, seed, voice setting or original prompt is inferred from a filename. Earlier narration/music prompt history belongs to different assets.

The processing recipes below are recoverable post-processing instructions, **not original generation prompts**. No newly written prompt text or new sound generation is included. All six originals came from Desktop and match both M: original locations. The remaining library material came from the M: portrait V006 project. Exact filenames, including `06-bird-flyb.mp3`, are preserved.

The five UI sounds retain Kenney Interface Sounds 1.0 attribution and the [original CC0 license](../../assets/sfx-v006/cc0/License.txt). This describes the retained source documents; no current provider terms or public redistribution rights for the supplied ElevenLabs assets are inferred. The historical provenance treats those originals as private production sources.

## Original and UI asset catalog

'''+table(['Supplied original','Prepared derivatives'],original_rows)+'\n\n'+table(['CC0 original','Historical use'],cc0_rows)+'''

## Prepared effects and processing

Authoritative settings: [sfx-preparation.json](../../sources/sfx-v006/sfx-preparation.json). Exact historical implementation: [prepare-sfx.py](../../sources/sfx-v006/scripts/prepare-sfx.py). Retained [measurements](../../assets/sfx-v006/prepared/measurements.json) include decoded source and prepared durations, sample peaks, onset, 10 ms energy crest and spectral-energy proportions; they were not regenerated during import.

The script decodes to 48 kHz stereo, filters the full original, then trims the indicated source interval. It applies linear boundary fades and normalizes the derivative peak to −3 dBFS before writing 24-bit PCM WAV. Seconds are used for trims, fades and duration. The table's durations come from historical prepared measurements; fresh probe results for all 23 files are in the import evidence.

'''+table(['Prepared file','Source','Trim start–end (s)','FFmpeg filters','Fade in / out (s)','Duration (s)'],prepared_rows)+'''

The tap-c and selection originals decode shorter than their requested trim endpoints. Preparation slices the available samples without padding, so their actual prepared durations are 0.007125 s and approximately 0.040396 s. Cue generation uses those measured durations, not the longer requested trims.

Laptop also attenuates the strongest filtered 10 ms energy region by 12 dB, with a 12 ms approach and 35 ms recovery, before the boundary fades and final peak normalization. Its compressor uses threshold 0.04, ratio 5, attack 0.1 ms, release 35 ms and makeup 1, as encoded in the filter above. These are historical candidate treatments.

Warm texture is locally generated, non-tonal noise, not an ElevenLabs download: 33,600 samples at 48 kHz; NumPy `Generator(PCG64(6006))` standard-normal mono noise duplicated to stereo; FFmpeg 180 Hz high-pass / 650 Hz low-pass in float64; `sin(linspace(0, pi, n))**2` envelope; −3 dBFS peak normalization; 24-bit stereo WAV. Its code is preserved unchanged and was not run. It supplements the bloom's brightness at the opening and ending.

## Historical cue placement and mix behavior

The unchanged [117-cue manifest](../../sources/sfx-v006/sfx-cues.json) is authoritative. [historical-cues.csv](historical-cues.csv) lists every cue's time, duration, trim, gain, normalization, fades, pan, kind and available event/frame metadata, plus its imported asset path. These values describe the old portrait candidate, not approved settings for a new mix.

The historical mixer selects the cue segment, pads if needed, normalizes that selected segment to `peak_normalize_dbfs` (0 dBFS in all retained cues), then applies `gain_db`. Thus the prepared −3 dBFS peak is not an additional −3 dB cue attenuation. It applies a second linear fade pair (default `min(0.003, duration*0.08)` in and `min(0.035, duration*0.2)` out), then pan as `left *= min(1,1-pan)` and `right *= min(1,1+pan)`. Positive pan attenuates the left channel; this is not equal-power panning. No time stretching is used.

Only summed added effects receive the 9 dB speech duck, with 50 ms pre-roll attack and 45 ms release. Overlapping windows use the strongest attenuation. The original audio-v002 master remains at 0 dB before a conditional linked peak envelope. The SFX duck uses the following narration start/end windows from [audio-v002 mix settings](../../sources/sfx-v006/sources/audio-v002-mix-settings.json); the separate narration stem is only needed for verification. The inherited settings' 7.5 dB instrumental duck is part of the earlier soundtrack, not the V006 SFX duck.

'''+table(['Narration cue','Start (s)','End (s)'],speech_rows)+'''

The historical target is 5,276,160 samples / 109.92 seconds, 48 kHz stereo, 25 fps. If measured true peak exceeds −1.5 dBTP, the mixer measures at 192 kHz and applies a linked local envelope targeting −1.55 dBFS before rechecking the WAV and AAC. It encodes AAC at 320 kb/s and stream-copies picture. Earlier reports describe peak reduction up to 0.066 dB and 0.051 dB over the song; those full-mix measurements were not repeated in this import.

Selected timing anchors are below; all gains precede SFX speech ducking, and all cue fades are retained individually in the CSV/JSON.

'''+table(['Cue','Start (s)','Duration (s)','Prepared trim (s)','Gain (dB)','Pan'],anchor_rows)+'''

UI cues derive from [frozen actual frame states](../../sources/sfx-v006/sources/ui-cue-states.json). Global cue time uses scene start frame plus source frame, divided by 25. Prompt taps alternate tap-a/b/c with 4/5/6-frame spacing, gains −35/−33.5/−34.5 dB and pan −0.04/0/+0.04. Selection uses −32 dB, submission −27 dB, duration entry −34 dB and lyrics paste −31 dB. Result blooms use prepared trim 0.14 s with durations 0.22/0.245/0.27/0.295 s and gains −31/−30/−29/−28 dB; separate result-confirmation taps use −32/−31/−30/−29 dB. `confirmation_001.ogg` is retained but these confirmation cues use tap-a.

Opening effects end at 0.70 s before narration at 0.80 s. The single laptop contact is not repeated across the picture cut. Reading holds and the 52.24–56.96 s reaction remain free of added effects. The song's source/timing is protected at 76.96–79.96 s; its play/pause action taps still exist, so this is not an entirely SFX-free interval. The pause tap ends at 79.88 s. Protected silence is 79.96–80.96 s: historical exact-zero claims apply to the PCM master/stem, not AAC transform residue.

Fullscreen starts at 96.68 s and its historically reported mixed crest is 96.745 s, before speech at 96.80 s. Flutter bursts are separate gestures with restrained pan, not a loop. Flyby uses prepared energy crest 0.785 s to place its start at 103.615 s and crest at 104.40 s. Closing bloom/warmth start at 108.84 s after speech. Scheduled tails end by 109.54 s; manifest limit is 109.76 s. Verify perceptual onset/crest again after any processing, gain, fade or timing change.

Subjective listening approval remains pending. Prior session notes report that V006 effects were too quiet; this import did not repeat that listening assessment. The additional 9 dB duck and repeated short fades are relevant review points. The historical numbers are retained without claiming audible success. A later edit needs full-speed headphone and speaker review for audibility, transient naturalness, speech clarity, balance and protected intervals.

## Path mapping and historical reproduction limits

All historical `assets/sfx/<relative-path>` references map to commercial `assets/sfx-v006/<relative-path>`; [path-mapping.json](path-mapping.json) enumerates every one of the 26 paths. That also maps provenance/license and measurements references. All 117 cue references and all 11 source-based preparation recipes resolve through this map; warm texture is the twelfth derivative and has no source recording.

Historical project files retain their internal layout under `sources/sfx-v006/`. Their scripts calculate the project root as the script's parent directory's parent and expect `assets/sfx/` beneath it. No compatibility symlink or rewritten script was created. `workspace-originals-provenance.json` originally lived beside `originals/` in the M: workspace asset folder; its bare `originals/*` paths map to the imported library originals, not beside the preserved document.

The [historical README](../../sources/sfx-v006/README.md), [verification notes](../../sources/sfx-v006/VERIFICATION.md) and [historical commercial record](../../sources/sfx-v006/commercial-record.md) remain byte-identical. Their self-contained-package claims, commands, output links and old next actions refer to the original V006 environment. Use this current guide to interpret them. [Historical link classification](../../../../tests/runs/2026-10-13-sfx-library-import/historical-links.json) distinguishes retained references, mapped library assets and deliberately omitted picture/full-mix links.

| Historical operation | Retained reference and missing prerequisites |
| --- | --- |
| Preparation | [prepare-sfx.py](../../sources/sfx-v006/scripts/prepare-sfx.py) imports mixer helpers; needs historical asset layout, FFmpeg and NumPy. It writes derivatives, measurements and provenance. Do not run it in the retained source tree. |
| Cue defaults | [make-sfx-cues.py](../../sources/sfx-v006/scripts/make-sfx-cues.py) consumes retained states, prepared measurements and retained Music/Video timing JSON; overwrites the cue manifest and any manual tuning. |
| Cue extraction | [extract-cue-events.cjs](../../sources/sfx-v006/scripts/extract-cue-events.cjs) needs complete V006 Text/Images/Music/Video UI HTML, runtime, assets and interaction schedules, Playwright and Chromium; these complete UI projects were not imported here. Frozen extracted states remain available. |
| Full mixing | [mix-sfx.py](../../sources/sfx-v006/scripts/mix-sfx.py) first invokes preparation and overwrites outputs. The exact lossless master and V005 picture reference are omitted. Selected pre-SFX MP4s are not drop-in bit-identical full-mix dependencies. |
| Comparison | [compare-audio.py](../../sources/sfx-v006/scripts/compare-audio.py) creates six RMS-matched raw/prepared pairs, then requires omitted V005/V006 full soundtracks. It is not a standalone imported-library audition command. |
| Historical verification | [verify_sfx.py](../../sources/sfx-v006/scripts/verify_sfx.py) and [verify.py](../../sources/sfx-v006/scripts/verify.py) need full outputs, lossless master, narration sidechain, V005 reference and a generated mix-report in the supplied evidence directory. They were not executed. |
| Old package/preview commands | Pinned [package.json](../../sources/sfx-v006/package.json), [lockfile](../../sources/sfx-v006/package-lock.json), [requirements.txt](../../sources/sfx-v006/requirements.txt) and [HyperFrames config](../../sources/sfx-v006/hyperframes.json) are historical dependency records. Build/render/package/browser scripts outside the selected seven, preview HTML, footage and the complete project are not included. npm commands are not current runnable instructions. |

[Omitted full-mix dependencies](omitted-full-mix-dependencies.json) records exact original paths, sizes, hashes and roles for seven required historical media inputs/outputs. Complete mixes, narration stems, V005/V006 videos, ZIPs, caches and installed environments were excluded. Python 3.13 / FFmpeg 8.1.1 are the historical documented toolchain, with NumPy/Pillow pins retained; no dependencies were installed and no historical script was executed. Recovering a full mix is outside this task.

## Verification and next action

[Import verification](../../../../tests/runs/2026-10-13-sfx-library-import/verification.json) records all copy hashes, six Desktop originals matching both M: counterparts, full probes/decodes of 23 audio files, cue/recipe resolution, unchanged recovery copies and both selected video hashes. [Audio details](../../../../tests/runs/2026-10-13-sfx-library-import/audio-probes-and-decodes.json) record duration, sample rate, channels and decoder errors for each file. [Navigation checks](../../../../tests/runs/2026-10-13-sfx-library-import/navigation.json) cover current documentation separately from historical links.

The completed [pre-sfx-baseline recovery](../pre-sfx-baseline/README.md), its 473-copy inventory, 662 omitted dependencies and earlier evidence remain unchanged as a dated recovery snapshot. They do not describe the expanded current library. No reproduction, preview, rendering, mixing, new generation or subjective listening occurred during import. Productions and external source files were not edited. Files have not been staged, committed or published; local presence does not establish sharing availability.

Next action is a separately requested edit selecting landscape, portrait or both, followed by synchronization and listening review. The import itself requires no further approval or action. [Commercial README](../../README.md) and [current record](../../openjm-boy-homework-commercial.md) own current workspace navigation and decisions.
'''
write_new(T/'LIBRARY-GUIDE.md',body)
write_new(T/'README.md','''# sfx-library-import

Active named task; import complete, 2026-10-13. [Current library guide](LIBRARY-GUIDE.md) covers originals, prepared effects, processing, historical portrait V006 usage, path mapping and reproduction limits. [Current commercial record](../../openjm-boy-homework-commercial.md) owns decisions; [commercial README](../../README.md) links the two unchanged pre-SFX editing bases.

Imported 26 library files and 23 historical reference files, all unchanged. [Inventory and SHA-256 hashes](import-inventory.json), [path mapping](path-mapping.json), [all 117 historical cues](historical-cues.csv) and [omitted full-mix dependencies](omitted-full-mix-dependencies.json) support later editing. Original ElevenLabs generation prompts/settings remain missing; processing recipes are not generation prompts.

[Verification](../../../../tests/runs/2026-10-13-sfx-library-import/verification.json) covers copy identity, 23 audio probes/full decodes, cue and recipe resolution, source/base preservation and navigation. No SFX was applied; no historical preparation/mixing script was run. Subjective listening approval remains pending. Next action requires a subsequent editing request and synchronization review for the chosen base(s).

[pre-sfx-baseline](../pre-sfx-baseline/README.md) remains the completed recovery task. Its records and evidence are unchanged historical snapshots; any old active-task wording there is superseded by this task and the current commercial record. Productions remain under user management.
''')
print('Wrote guide, 117-cue CSV, omitted-media inventory and historical-link classification.')
