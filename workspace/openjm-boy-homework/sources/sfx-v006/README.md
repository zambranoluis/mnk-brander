# OpenJM portrait V006 — supplied cinematic sound

[Watch V006](openjm-assembly-v003-audio-v002-portrait-v006.mp4) · [Mixed WAV](audio/portrait-v006-mix.wav) · [SFX stem](audio/sfx-stem.wav)

Independent 1080 × 1920, 25 fps, 2,748-frame / 109.92-second candidate. V005 picture is stream-copied without re-encoding. The new soundtrack starts from the original lossless audio-v002 master, preserving narration, music, song source and timing. Human listening approval remains pending.

## Edit and rebuild

Install Python 3.11+ with `requirements.txt`, and FFmpeg/FFprobe on PATH. The verified toolchain uses Python 3.13 and FFmpeg 8.1.1. All media dependencies are package-local; no provider/account access is required.

```powershell
python -m venv local/venv
./local/venv/Scripts/python -m pip install -r requirements.txt
./local/venv/Scripts/python scripts/mix-sfx.py --evidence local/rebuild-check
./local/venv/Scripts/python scripts/verify.py --evidence local/rebuild-check
```

The mixer regenerates prepared effects from unchanged originals, writes the 24-bit 48 kHz stereo stem and mixed WAV (5,276,160 samples), stream-copies the retained V005 picture, encodes AAC at 320 kb/s, then copies that exact AAC stream into the preview M4A. Use a new revision before altering a reviewed candidate.

- [sfx-preparation.json](sfx-preparation.json): trims, filters, boundary fades and laptop transient reduction. Prepared WAVs normalize to −3 dBFS; cue gains below determine their final levels.
- [sfx-cues.json](sfx-cues.json): 117 fixed cues with independent gain, duration, trim, fades, modest pan and frame/event provenance. Each cue normalizes its selected segment to 0 dBFS before applying its negative gain. There is no playback-rate change.
- [Prepared measurements](assets/sfx/prepared/measurements.json): raw/processed spectral energy, onset, sample peak and 10 ms energy crest. Remeasure after processing; a file's start is not its perceptual synchronization point.
- [Originals and provenance](assets/sfx/provenance.json): all six supplied ElevenLabs files retain their exact filenames and bytes, including `06-bird-flyb.mp3`. Provider model/settings were not supplied. UI taps come from Kenney Interface Sounds 1.0, CC0, with the included original license.
- A quiet, original low-mid noise texture uses a fixed PCG64 seed of 6006. Its complete generation code is in `scripts/prepare-sfx.py`; no external generation was requested.

To regenerate cue defaults after changing preparation (overwrites manual cue tuning):

```powershell
./local/venv/Scripts/python scripts/prepare-sfx.py
./local/venv/Scripts/python scripts/make-sfx-cues.py
```

Only new SFX are speech-ducked: 9 dB, 50 ms attack, 45 ms release across retained narration windows. The original master remains at 0 dB gain. A linked, local peak envelope applies only where required (maximum 0.066 dB reduction). This is not a new narration or music master.

## Sound direction

Opening bloom and warmth end at 0.70 s. A single softened laptop contact starts at 3.84 s, following inspected initial lid movement; it is not repeated across the cut. The UI entry receives a short accent at 9.44 s. Three muted tap variations follow actual character-entry frames at approximately 4–6-frame spacing. Selection, paste and submission remain distinct; results at 25.24, 47.28, 70.96 and 93.96 s use four increasingly emphasized bloom/tactile combinations. Reading holds and 52.24–56.96 s reaction are free of added effects.

The original song stays at 76.96–79.96 s; the pause tap ends at 79.88 s. Both PCM outputs contain exact silence at 79.96–80.96 s. The fullscreen effect uses expansion source 0.12–0.40 s; its final mixed crest is at 96.745 s, before speech at 96.80 s. Bird emergence starts at 99.28 s. Separated flutter bursts follow visible turns and wing gestures with restrained pan. The processed flyby crest, which moved to source-local 0.785 s after filtering, aligns at 104.40 s. Lighter native flutters and arrival follow; closing bloom begins at 108.84 s, after speech ends. All added sound ends by 109.54 s.

## Preview and comparison

Node.js 22+ is needed only for editing/preview and browser checks:

```powershell
npm ci
npx playwright install chromium
npm run build
npm run preview
npm run check
node scripts/playback.cjs local/rebuild-check
```

HyperFrames stays pinned to 0.8.150; the current-version probe passed. `npm run build` generates the assembled preview with V006's exact AAC. `npm run render` runs the same audio/mux script. With an isolated Python environment, invoke the explicit interpreter commands above or activate it first.

```powershell
./local/venv/Scripts/python scripts/compare-audio.py --evidence local/listening-comparison
```

Open `local/listening-comparison/listen.html` for six RMS-matched raw/prepared pairs and full V005/V006 soundtracks matched to the quieter integrated loudness. The retained reference includes V005 audio for comparison only; none is mixed into V006. Review the entire MP4 at normal speed on headphones and speakers, particularly the laptop transient, bloom brightness, bird rumble, flyby, speech masking, pause and ending. Record actual listening and device separately from automated playback. No subjective improvement is claimed from measurements alone.

## Private editable package

```powershell
./local/venv/Scripts/python scripts/package.py --output ../openjm-portrait-v006-editable.zip --evidence local/package-check
```

The ZIP includes final outputs, untouched originals, prepared effects, manifests, scripts, immutable V005 reference and inherited picture/UI sources. It excludes caches, installed dependencies and generated evidence. Treat the supplied ElevenLabs originals as private production assets; do not distribute this package or its generated files as a standalone sound library. No license or public-distribution approval for the supplied files is inferred.

The inherited ending file deliberately retains `openjm-ending-native-portrait-v004.mp4`. Picture/UI source content, camera paths, scene offsets and transitions remain unchanged; the normal rebuild always uses the frozen V005 picture. [CAMERA-PATHS.md](CAMERA-PATHS.md) covers optional inherited picture experiments, which require a separate revision. Historical UI documents and root `provenance.json` describe source origins, not current audio instructions. `sources/audio-v002-mix-settings.json` retains historical recording paths as provenance; only its local cue timing is used, not those external paths.

[Verification and limits](VERIFICATION.md) · [This revision's commercial record](commercial-record.md)
