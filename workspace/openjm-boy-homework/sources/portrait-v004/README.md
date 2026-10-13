# OpenJM portrait edition V004

Independent 9:16 adaptation of Assembly V003 with the unchanged audio-v002 soundtrack. Delivery: [openjm-assembly-v003-audio-v002-portrait-v004.mp4](openjm-assembly-v003-audio-v002-portrait-v004.mp4). **1080 × 1920, 25 fps, 2,748 frames, 109.92 seconds.** Visual and listening approval remain with the user.

The demonstration is controlled staging of OpenJM's actual mobile styles, conversation, generation sheets and playback controls. It is not evidence of live generation or generation speed. `frontend-reference/` retains the mobile component/style sources read from `web-openjm-frontend`; that repository was not edited.

## Editable owners

- [assembly.json](assembly.json) owns all scene placements, frame counts and transitions. Its nine slots and eight boundaries retain V003 timing. The original schedule is independently retained in `sources/assembly-v003.json`.
- `ui/text`, `ui/images`, `ui/music`, `ui/video` contain independent editable HTML, scene scripts, content, action schedules, native styles, fonts and assets. Shared `ui/portrait.js`, `ui/portrait.css` and `ui/touch.js` supply mobile measurement, native scrolling, mobile portals, and touch-only feedback. The original release timestamps are unchanged.
- Each scene's `sync-source.cjs` embeds its editable script/content into `index.html`; run it after editing those owners. The mobile adapter stays external. Native particle animation is frame-clock driven. No mouse pointer, tap rings or OS keyboard is shown.
- `ui/presentation/presentation.js` and `ui/video/presentation.js` share the same 400-frame presentation implementation. Keep both copies synchronized when editing. Their CSS proportionally fits complete selected artwork and its process SVGs, with editable labels below. No illustration was regenerated or stretched.
- [camera-paths.json](camera-paths.json) owns the four photographic camera paths; [CAMERA-PATHS.md](CAMERA-PATHS.md) explains editing and reproduction. All four fill 9:16 with the widest possible crop, no extra zoom. [reframing.json](reframing.json) is the generated per-frame crop ledger. The original laptop imagery is retained; the ending is now rendered natively from the genuine animation, as described below.
- `sources/audio-v002-master.mp4` is an unchanged independent copy of the supplied soundtrack master. Final assembly copies its AAC stream; it does not remix, re-encode or retime the sound.

The complete [16-second portrait presentation](assets/water-cycle-presentation-portrait-16s.mp4) is included separately. As in V003, the commercial shows only its opening 3.64 seconds before the original outro takes over. In-player playback begins at 95.96 s; fullscreen begins at 96.68 s and settles at 96.96 s without restarting. Music Play and Pause remain **76.96 / 79.96 s**.

## V004 corner correction

V004 changes only the Video scene presentation overlay in `ui/portrait.js`. Its top corners match the existing player's inner radius (14px outer radius minus 1px border), converted through the player and overlay scales. The existing frame-driven fullscreen progress reduces the visible radius smoothly to zero. Playback, border, controls, artwork, colors, timing, native ending and soundtrack remain unchanged from portrait V003.

Rebuild only this correction:

```powershell
node scripts/capture.cjs video render local/video-render
npm run build
npm run render
```

Focused checks:

```powershell
node scripts/check-corners.cjs video check local/corner-check
node scripts/seek-corners.cjs local/corner-check
node scripts/playback-corners.cjs local/corner-check --transition
```

The first check saves all 81 forward/reverse source frames from 93.76 through 96.96 seconds, including both top corners through fullscreen. The other checks exercise the encoded master. Fullscreen ends with square screen corners.

## Native ending

[Standalone ending](openjm-ending-native-portrait-v004.mp4): silent 1080 x 1920, 25 fps, 129 frames, 5.16 seconds. `assets/z-animation-end.mp4` is an identical assembly copy. The native Three.js camera uses 9:16 aspect, the existing responsive flight bounds and wingspan sizing. Original artwork, GLB, colors, lighting, seeds, wing animation, particles and hover character are retained. Opening mark is 240px; original wordmark is 420px wide. Both remain proportional. The background fills the complete frame.

`ending/source/runtime.ts` owns the fixed 0.5-second opening hold, 60 Hz simulation sampling, fade beginning at 244/60 seconds and lasting 0.6 seconds. Delivery samples the nearest original simulation step at f/25; it does not retime the flight. Portrait arrival is 1.566667 seconds; natural hover extends 2.5 seconds to the fixed fade. The final wordmark-only hold continues through 5.16 seconds (0.493333 seconds after fade completion). `ending/source/loader/` contains the independent genuine animation sources; `ending/source/index.html.in` supplies the portrait artwork sizing. `ending/original-assets/` and `ending/assets/` contain local original references and runtime assets. `ending/source/project/`, `source/README.md` and `source/original-build-package*.json` are retained historical landscape references, not current build instructions. Use this README and the root pinned manifests for reproduction.

Source provenance: copied from web-openjm-frontend, workspace/dashboard-loader-video/source/v2 and assets/production. Its landscape export was confirmed byte-identical to `sources/z-animation-end.mp4` (SHA-256 24aa4bde533f4106f3b1b9b205a725db9503ec8c0c2bc686ec6dfc8482159284). No frontend application files were edited. Neither repository is needed to rebuild the extracted package.

After editing ending source:

```powershell
npm run build:ending
node scripts/render-ending.cjs --evidence local/ending-recheck
npm run build
npm run render
```

Rendering writes the standalone ending and its assembly copy. Reverse seeks are checked against every forward frame; `python scripts/audit-ending.py --evidence local/ending-recheck` measures any screenshot differences. Exact animation states are distinguished from one-channel-level GPU rounding. The artwork uses compositor layers to avoid history-dependent SVG rasterization.

## Reproduce

Prerequisites: Node.js 22+, Python 3.11+, Pillow (see requirements.txt), FFmpeg/FFprobe on PATH. Initial dependency/Chromium installation needs network access; scene assets and final assembly have no account or network dependency.

```powershell
python -m pip install -r requirements.txt
npm ci
npx playwright install chromium
npm run build
npm run preview
```

For a camera-only change, run `npm run render:footage`, then `npm run build` and `npm run render`. Mobile scenes do not need recapturing.

The HyperFrames preview is editable; preserve changes in a new revision before rebuilding generated assembly HTML. The final master is rendered by the frame-counted FFmpeg path so audio can remain stream-identical. HyperFrames stays pinned at 0.8.150; the read-only upgrade probe confirmed it current during this revision. Its timeline uses the rendered camera plates; edit the JSON and rebuild those plates to change the camera paths.

Rebuild all picture inputs after source edits, then assemble:

```powershell
node ui/text/sync-source.cjs
node ui/images/sync-source.cjs
node ui/music/sync-source.cjs
node ui/video/sync-source.cjs
npm run render:footage
npm run build:ending
npm run render:ending
npm run render:ui
npm run build
npm run render
```

`scripts/capture.cjs` uses a **360 × 640 CSS viewport at deviceScaleFactor 3**. Each exact frame is captured as a 1080 × 1920 PNG. `scripts/render_ffmpeg.py` derives every body/overlap from `assembly.json`; each overlap uses incoming weight k/N over the advancing outgoing picture. `scripts/render.py` then copies AAC without `-shortest` or a timing shift.

These commands replace only this revision's derived assets/master. Make an independent revision before modifying a reviewed delivery. Original sources are retained and are not rewritten.

Verification after rebuilding (choose a separate evidence directory):

```powershell
python scripts/verify.py --evidence ../../../../tests/runs/portrait-v004-recheck
node scripts/playback.cjs ../../../../tests/runs/portrait-v004-recheck
npm run check
```

For representative editable scene seeks: `node scripts/capture.cjs text check <evidence-directory>`; repeat with `images`, `music`, `video`, `presentation`. Exact PNG equality is reported separately from small browser icon rasterization differences; see [VERIFICATION.md](VERIFICATION.md). Human visual/listening approval is not inferred from automated playback or packet checks. The initial reaction close-up lacks the upper face in the source itself. No camera move reconstructs absent image content.
