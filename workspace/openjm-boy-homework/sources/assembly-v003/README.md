# OpenJM boy homework — assembly V003 — clean provisional final

Status: **provisional-final-original-outro**. Clean provisional revision: **109.92 seconds / 2,748 frames, 1920 × 1080, 25 fps**. Audio and the final laptop screen composite remain outstanding. V001, labelled V002 and all original inputs are preserved. V003 independently copies V002 sources and completed UI footage without rerendering the UI. The unfinished standalone composite is not included or integrated.

[Open V003 Studio](http://localhost:3465/#project/assembly-v003) while the local preview service runs. You can edit in its timeline. See `VERIFICATION.md` for completed checks and limits.

## Use and rebuild

The independent package contains original source clips, normalized playback media, editable UI projects in `ui/text` and `ui/images`, the presentation reference, local native particle engine/source, fonts, GSAP, scripts and the manifest. Runtime pictures require no Desktop files, sibling project, account or external asset request.

Install Node.js 22+, Python 3.11+, FFmpeg/FFprobe on PATH. For UI rebuilding install the locked dependencies and Chromium (first install requires network):

```powershell
npm ci
npx playwright install chromium
npm run build
npm run check
npm run preview
npm run render
```

`npm run render` produces `renders/openjm-assembly-v003-provisional-final.mp4` using FFmpeg. Preserve reviewed exports by using a new revision/output path. The optional `npm run render:hyperframes` is available, but the delivered master uses FFmpeg.

To rebuild the UI footage after editing its source:

```powershell
node ui/text/sync-source.cjs
node ui/images/sync-source.cjs
npm run render:ui
npm run render
```

`scene.js`, `content.json` and `interactions.json` are editable owners in each UI project; Images additionally owns `timing.json`. Text's `seam-state.json` retains the selected image-opening answer/history DOM; its embedded copy in `scene.js` must be updated together if content changes. `ambient.json` documents the shared clock; Text's event list is in `scene.js`, Images' list and 22.8-second offset are in `timing.json`. Both independent `morph.js` files sample the same 44-second native simulation. Local `native-engine.js` is already compiled. Optional engine rebuild requires TypeScript 5.9.3; Images' `build-native.cjs` uses the retained native sources.

The UI renderer captures each paused timeline at frame/25, at **3840 × 2160**, then downsamples once with Lanczos into 1080p BT.709 H.264. This includes the entire two-second pullback. No action is sped up. The five-second text hold fixes camera scale 1.6 at (-928,-148); after source 20.8 seconds it pulls back over two seconds to scale 0.875 at (110,67). Images holds that camera throughout, including its completed board from 17–20 seconds and the outgoing 0.32-second overlap. Ambient particles continue during both holds.

`assembly.json` is the sole timing/transition owner consumed by both `scripts/build.py` (HyperFrames) and `scripts/render_ffmpeg.py` (FFmpeg). Rebuilding generated scene HTML overwrites direct Studio edits, so preserve those in a revision before rebuilding.

## Exact timeline

End times are exclusive; frames are zero-based.

| Slot | Timeline seconds | Retained frames | Count |
| --- | --- | --- | --- |
| intro-boy | 0.00–5.04 | 0–125 | 126 |
| dashboard-loading | 4.72–9.76 | 118–243 | 126 |
| text | 9.44–32.24 | 236–805 | 570 |
| images | 32.24–52.56 | 806–1313 | 508 |
| actor-pause | 52.24–57.28 | 1306–1431 | 126 |
| music | 56.96–80.96 | 1424–2023 | 600 |
| video | 80.96–99.60 | 2024–2489 | 466 |
| outro-composite | 98.96–105.00 | 2474–2624 | 151 |
| brand-ending | 104.76–109.92 | 2619–2747 | 129 |

The explicit `transitions` list includes all eight boundaries. Intro→loading, loading→text, images→reaction and reaction→music each overlap eight frames. Text→images is a continuous two-second camera pullback ending in matched framing, with a zero-overlap cut. Music→video keeps the original matched cut. Video→outro overlaps sixteen frames, and outro→ending overlaps six.

Every dissolve is a **linear incoming picture over an opaque outgoing picture**. At overlap frame k of N, incoming weight is k/N; outgoing is 1−k/N. The next frame is fully incoming. The outgoing picture continues advancing at normal speed. V003 has `outroContract.showPlaceholderLabel: false`: both builders omit the editorial label. The original picture advances through both blends unchanged. Composite status remains `pending`; label visibility does not certify replacement. There is no black dip, added title, decorative transition or speed ramp.

## Retained frame-75 outro replacement contract

Labelled V002 retains **“OUTRO PLACEHOLDER — screen composite pending.”** V003 hides only that editorial overlay; existing product text and branding remain. The full original outro remains 151 frames / 6.04 seconds, with unchanged framing and action timing. Required replacement: silent 1920 × 1080, 25 fps, H.264/yuv420p, BT.709 limited range. A correctly timed 24 fps / 145-frame composite can be normalized with frame duplication/drop, never by stretching action.

Presentation playback starts at video-source 15.00 seconds. The incoming outro starts at video-source **18.00 seconds**, so the presentation must start inside the replacement at **3.00 seconds / reference frame 75**. During the sixteen-frame overlap the outgoing video continues through source 18.60 (exclusive endpoint 18.64); both pictures show presentation frames **75–90**. Then the outro continues without restarting, ending at presentation frame 225 (9.00 seconds). The brand dissolve covers the last six outro frames. The original full 16-second reference is in `references/boy-final-presentation.mp4`.

The V001 frame-34 contract is superseded **in V002 and V003**. No retained standalone composite is declared compatible. Metadata cannot establish registration, credible edges or presentation synchronization.

1. Preserve this provisional version and copy to a fresh assembly revision before replacing anything.
2. Copy the finished composite into that revision's `assets/` with a new descriptive name.
3. Run the read-only technical validator:

```powershell
python scripts/validate_outro.py assets/outro-composited.mp4 --report candidate-check.json
```

4. Inspect every frame against `sources/y-outro.mp4`, the presentation reference and both overlaps. Record the actual candidate's `sha256`, `reviewer` and `evidence` (nonempty text), plus these completed visual checks as true: `framingAndTimingMatch`, `presentationStartsAtFrame75`, `overlapFrames75Through90Synchronized`, `continuousPresentationPlayback`, `occlusionAndEdgesReviewed`, `noBakedLabel`. Frame-34 evidence is refused. Do not certify checks that have not been performed.
5. Apply the verified replacement and recheck/re-render:

```powershell
python scripts/replace_outro.py --media assets/outro-composited.mp4 --review candidate-visual-review.json
npm run check
npm run render
```

Only the media reference/status and generated label change. The 151-frame slot, source timing, eight-boundary schedule and three-second presentation offset remain unchanged. Repeat timing, join, decode, playback and ZIP checks on the new revision.

## Verification and limitations

See `VERIFICATION.md` for observed results. These retained UI projects stage the genuine interface using controlled content; they are not live generation or performance evidence. The original unlabelled plate does not contain the final presentation composite, so actual two-picture screen synchronization remains for replacement review. Automated rate-1 playback and inspected frames do not establish human subjective playback approval. Review colour in the MP4; hardware-browser previews can differ in video levels.
