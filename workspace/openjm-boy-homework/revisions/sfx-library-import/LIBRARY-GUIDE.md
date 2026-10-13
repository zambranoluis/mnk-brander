# V006 sound-effects library guide

Import complete, 2026-10-13. This private commercial library contains 26 unchanged files (1,931,282 bytes): six MP3 originals, 12 prepared WAVs, five OGG UI sounds, provenance, measurements and the original CC0 license. Another 23 unchanged historical reference files retain the preparation, cues, scripts, dependencies and original workspace provenance. [Import inventory](import-inventory.json) records all 49 source paths, destinations and SHA-256 hashes.

The selected [landscape](../../output/openjm-assembly-v003-audio-v002.mp4) and [portrait V004](../../output/openjm-assembly-v003-audio-v002-portrait-v004.mp4) videos remain the editing bases. No effects were applied. Historical placements below belong to **portrait V006**, even where the two formats share timing. Applying them to either selected base requires a subsequent editing task, synchronization review and a new output filename.

## Creation history and missing prompts

**Original SFX generation prompts were not located in the inspected M: commercial.** The [unchanged package provenance](../../assets/sfx-v006/provenance.json), [original workspace provenance](../../sources/sfx-v006/workspace-originals-provenance.json), historical V006 guides, preparation scripts/manifests and SFX passages in the original commercial record identify user-supplied ElevenLabs recordings. Provider settings were not supplied. No model, seed, voice setting or original prompt is inferred from a filename. Earlier narration/music prompt history belongs to different assets.

The processing recipes below are recoverable post-processing instructions, **not original generation prompts**. No newly written prompt text or new sound generation is included. All six originals came from Desktop and match both M: original locations. The remaining library material came from the M: portrait V006 project. Exact filenames, including `06-bird-flyb.mp3`, are preserved.

The five UI sounds retain Kenney Interface Sounds 1.0 attribution and the [original CC0 license](../../assets/sfx-v006/cc0/License.txt). This describes the retained source documents; no current provider terms or public redistribution rights for the supplied ElevenLabs assets are inferred. The historical provenance treats those originals as private production sources.

## Original and UI asset catalog

| Supplied original | Prepared derivatives |
| --- | --- |
| [01-laptop-opening.mp3](../../assets/sfx-v006/originals/01-laptop-opening.mp3) | `laptop.wav` |
| [02-brand-bloom.mp3](../../assets/sfx-v006/originals/02-brand-bloom.mp3) | `bloom.wav` |
| [03-digital-expansion.mp3](../../assets/sfx-v006/originals/03-digital-expansion.mp3) | `expansion.wav`, `fullscreen.wav` |
| [04-bird-emergence.mp3](../../assets/sfx-v006/originals/04-bird-emergence.mp3) | `emergence.wav` |
| [05-feather-flutter.mp3](../../assets/sfx-v006/originals/05-feather-flutter.mp3) | `flutter.wav` |
| [06-bird-flyb.mp3](../../assets/sfx-v006/originals/06-bird-flyb.mp3) | `flyby.wav` |

| CC0 original | Historical use |
| --- | --- |
| [click_001.ogg](../../assets/sfx-v006/cc0/click_001.ogg) | `tap-a.wav` |
| [click_002.ogg](../../assets/sfx-v006/cc0/click_002.ogg) | `tap-b.wav` |
| [click_003.ogg](../../assets/sfx-v006/cc0/click_003.ogg) | `tap-c.wav` |
| [select_001.ogg](../../assets/sfx-v006/cc0/select_001.ogg) | `selection.wav` |
| [confirmation_001.ogg](../../assets/sfx-v006/cc0/confirmation_001.ogg) | Retained in original selection; no preparation recipe or cue uses it. |

## Prepared effects and processing

Authoritative settings: [sfx-preparation.json](../../sources/sfx-v006/sfx-preparation.json). Exact historical implementation: [prepare-sfx.py](../../sources/sfx-v006/scripts/prepare-sfx.py). Retained [measurements](../../assets/sfx-v006/prepared/measurements.json) include decoded source and prepared durations, sample peaks, onset, 10 ms energy crest and spectral-energy proportions; they were not regenerated during import.

The script decodes to 48 kHz stereo, filters the full original, then trims the indicated source interval. It applies linear boundary fades and normalizes the derivative peak to −3 dBFS before writing 24-bit PCM WAV. Seconds are used for trims, fades and duration. The table's durations come from historical prepared measurements; fresh probe results for all 23 files are in the import evidence.

| Prepared file | Source | Trim start–end (s) | FFmpeg filters | Fade in / out (s) | Duration (s) |
| --- | --- | --- | --- | --- | --- |
| [laptop.wav](../../assets/sfx-v006/prepared/laptop.wav) | 01-laptop-opening.mp3 | 0.24–1.3 | `highpass=f=90,lowpass=f=6500,acompressor=threshold=0.04:ratio=5:attack=0.1:release=35:makeup=1` | 0.012 / 0.1 | 1.06 |
| [bloom.wav](../../assets/sfx-v006/prepared/bloom.wav) | 02-brand-bloom.mp3 | 0–0.7 | `highpass=f=150,highshelf=f=4500:g=-6,lowpass=f=8000` | 0.012 / 0.16 | 0.7 |
| [expansion.wav](../../assets/sfx-v006/prepared/expansion.wav) | 03-digital-expansion.mp3 | 0.06–0.68 | `highpass=f=150,highshelf=f=4500:g=-6,lowpass=f=8000` | 0.012 / 0.09 | 0.62 |
| [fullscreen.wav](../../assets/sfx-v006/prepared/fullscreen.wav) | 03-digital-expansion.mp3 | 0.12–0.4 | `highpass=f=150,highshelf=f=4500:g=-6,lowpass=f=8000` | 0.008 / 0.035 | 0.28 |
| [emergence.wav](../../assets/sfx-v006/prepared/emergence.wav) | 04-bird-emergence.mp3 | 0–0.57 | `highpass=f=150,lowpass=f=8000` | 0.012 / 0.07 | 0.57 |
| [flutter.wav](../../assets/sfx-v006/prepared/flutter.wav) | 05-feather-flutter.mp3 | 0–0.72 | `highpass=f=150,lowpass=f=8000` | 0.008 / 0.06 | 0.72 |
| [flyby.wav](../../assets/sfx-v006/prepared/flyby.wav) | 06-bird-flyb.mp3 | 0–1.16 | `highpass=f=150,lowpass=f=8000` | 0.025 / 0.15 | 1.16 |
| [tap-a.wav](../../assets/sfx-v006/prepared/tap-a.wav) | click_001.ogg | 0–0.075 | `highpass=f=150,lowpass=f=4200` | 0.001 / 0.015 | 0.075 |
| [tap-b.wav](../../assets/sfx-v006/prepared/tap-b.wav) | click_002.ogg | 0–0.011625 | `highpass=f=150,lowpass=f=3800` | 0.0005 / 0.003 | 0.011625 |
| [tap-c.wav](../../assets/sfx-v006/prepared/tap-c.wav) | click_003.ogg | 0–0.009 | `highpass=f=150,lowpass=f=4600` | 0.0005 / 0.002 | 0.007125 |
| [selection.wav](../../assets/sfx-v006/prepared/selection.wav) | select_001.ogg | 0–0.08 | `highpass=f=180,lowpass=f=4200` | 0.001 / 0.012 | 0.04039583333333333 |
| [warm-texture.wav](../../assets/sfx-v006/prepared/warm-texture.wav) | PCG64 seeded noise | 0–0.70 | `highpass=f=180,lowpass=f=650` | sin² envelope | 0.7 |

The tap-c and selection originals decode shorter than their requested trim endpoints. Preparation slices the available samples without padding, so their actual prepared durations are 0.007125 s and approximately 0.040396 s. Cue generation uses those measured durations, not the longer requested trims.

Laptop also attenuates the strongest filtered 10 ms energy region by 12 dB, with a 12 ms approach and 35 ms recovery, before the boundary fades and final peak normalization. Its compressor uses threshold 0.04, ratio 5, attack 0.1 ms, release 35 ms and makeup 1, as encoded in the filter above. These are historical candidate treatments.

Warm texture is locally generated, non-tonal noise, not an ElevenLabs download: 33,600 samples at 48 kHz; NumPy `Generator(PCG64(6006))` standard-normal mono noise duplicated to stereo; FFmpeg 180 Hz high-pass / 650 Hz low-pass in float64; `sin(linspace(0, pi, n))**2` envelope; −3 dBFS peak normalization; 24-bit stereo WAV. Its code is preserved unchanged and was not run. It supplements the bloom's brightness at the opening and ending.

## Historical cue placement and mix behavior

The unchanged [117-cue manifest](../../sources/sfx-v006/sfx-cues.json) is authoritative. [historical-cues.csv](historical-cues.csv) lists every cue's time, duration, trim, gain, normalization, fades, pan, kind and available event/frame metadata, plus its imported asset path. These values describe the old portrait candidate, not approved settings for a new mix.

The historical mixer selects the cue segment, pads if needed, normalizes that selected segment to `peak_normalize_dbfs` (0 dBFS in all retained cues), then applies `gain_db`. Thus the prepared −3 dBFS peak is not an additional −3 dB cue attenuation. It applies a second linear fade pair (default `min(0.003, duration*0.08)` in and `min(0.035, duration*0.2)` out), then pan as `left *= min(1,1-pan)` and `right *= min(1,1+pan)`. Positive pan attenuates the left channel; this is not equal-power panning. No time stretching is used.

Only summed added effects receive the 9 dB speech duck, with 50 ms pre-roll attack and 45 ms release. Overlapping windows use the strongest attenuation. The original audio-v002 master remains at 0 dB before a conditional linked peak envelope. The SFX duck uses the following narration start/end windows from [audio-v002 mix settings](../../sources/sfx-v006/sources/audio-v002-mix-settings.json); the separate narration stem is only needed for verification. The inherited settings' 7.5 dB instrumental duck is part of the earlier soundtrack, not the V006 SFX duck.

| Narration cue | Start (s) | End (s) |
| --- | --- | --- |
| N01 | 0.8 | 7.48735417 |
| N02 | 11 | 18.0791875 |
| N03 | 33.2 | 39.31266667 |
| N04 | 43.2 | 48.11102083 |
| N05 | 53.2 | 55.969 |
| N06 | 59 | 63.75429167 |
| N07 | 82 | 86.83266667 |
| N08 | 96.8 | 104.34939583 |
| N09 | 105.2 | 108.8 |

The historical target is 5,276,160 samples / 109.92 seconds, 48 kHz stereo, 25 fps. If measured true peak exceeds −1.5 dBTP, the mixer measures at 192 kHz and applies a linked local envelope targeting −1.55 dBFS before rechecking the WAV and AAC. It encodes AAC at 320 kb/s and stream-copies picture. Earlier reports describe peak reduction up to 0.066 dB and 0.051 dB over the song; those full-mix measurements were not repeated in this import.

Selected timing anchors are below; all gains precede SFX speech ducking, and all cue fades are retained individually in the CSV/JSON.

| Cue | Start (s) | Duration (s) | Prepared trim (s) | Gain (dB) | Pan |
| --- | --- | --- | --- | --- | --- |
| opening-bloom | 0 | 0.7 | 0 | -27 | 0 |
| opening-warmth | 0 | 0.7 | 0 | -36 | 0 |
| laptop-contact | 3.84 | 1.06 | 0 | -29 | 0 |
| enter-ui | 9.44 | 0.5 | 0 | -33 | 0 |
| text-complete | 25.24 | 0.22 | 0.14 | -31 | 0 |
| images-complete | 47.28 | 0.245 | 0.14 | -30 | 0 |
| music-complete | 70.96 | 0.27 | 0.14 | -29 | 0 |
| music-pause | 79.84 | 0.04 | 0 | -32 | 0 |
| video-complete | 93.96 | 0.295 | 0.14 | -28 | 0 |
| fullscreen-air | 96.68 | 0.28 | 0 | -33 | 0 |
| bird-emergence | 99.28 | 0.57 | 0 | -28 | 0 |
| bird-turn-right | 100.28 | 0.22 | 0.03 | -31 | 0.16 |
| bird-window-turn | 101.28 | 0.23 | 0.22 | -32 | -0.12 |
| bird-return | 102.96 | 0.22 | 0.42 | -34 | 0.08 |
| bird-close-flyby | 103.615 | 1.16 | 0 | -23 | 0.1 |
| native-flight | 105.28 | 0.2 | 0.02 | -33 | -0.1 |
| native-wing | 105.68 | 0.18 | 0.23 | -35 | 0.03 |
| native-arrival | 106.32 | 0.06 | 0 | -35 | 0 |
| ending-bloom | 108.84 | 0.7 | 0 | -28 | 0 |
| ending-warmth | 108.84 | 0.7 | 0 | -37 | 0 |

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
