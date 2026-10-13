# Portrait V004 verification

Verified 2026-10-12. V004 corrects only the separate Video presentation overlay's top corners. Existing player styling, controls, artwork, timing, native ending and soundtrack are retained.

## Corner and playback checks

- Both corners inspected in all 76 visible source and encoded-master frames from 93.96 through 96.96 seconds. The green surface meets the inner border without overpaint or a visible gap. The existing fullscreen easing reduces the visible 13px radius continuously to zero; no final-frame corner snap was observed.
- All 81 forward/reverse source screenshots from 93.76 through 96.96 seconds match exactly at 1080 x 1920. No runtime errors or external requests.
- All 162 forward/reverse seeks of the same encoded master frames match exactly at 1080 x 1920.
- Automated normal-speed master playback from 93.76 seconds to the 109.92-second end passes: rate 1, 16.2024 seconds wall time, zero dropped frames, stalls or errors. Representative playback samples were visually inspected. This is automated playback and sampled visual inspection, not human continuous-viewing or listening approval; the current UI inventory exposed no browser or native viewing surface.
- HyperFrames 0.8.150 strict software-rendered checks pass with zero errors/warnings at nine times spanning 93.96-96.96 seconds. The CLI disables its generic motion pass for this media assembly; frame-by-frame and reverse-seek checks above provide the specific motion evidence. Raster text is outside DOM contrast testing.

## Media and preservation

- H.264 master: 1080 x 1920, 25 fps, 2,748 frames, 109.92 seconds; complete decode passes.
- Master SHA-256: `4d36c6a163d527c39a4bf2e2929a729bf8a9cb95a69121ffdbc93913d078b057`.
- All 5,154 AAC packets, timestamps, durations and side data match the retained audio-v002 master exactly. No audio processing or retiming.
- All 2,282 full-resolution decoded pictures outside the Video slot (frames 2024-2489, including its existing outgoing overlap) match portrait V003. Encoder prediction causes some pixel differences beyond the rounded corner region within that scene; exact equality there is not claimed.
- All 748 retained V003 package files are unchanged. All 703 other copied UI/source/asset files are byte-identical, including photographic shots, camera paths' inputs, presentation artwork, native ending sources and retained frontend references. The frontend application was not edited.
- Only the 466-frame Video scene was recaptured. The master was rebuilt from that scene and the retained media. Earlier deliveries remain in their independent directories and archives.

## Package and reproduction

Use README.md and root pinned manifests for reproduction. The archive excludes caches, node_modules, local scratch and redundant renders. Runtime assets and editing sources are retained locally. Initial dependency and Chromium installation requires network access; the composition itself does not.

Archive extraction, hash/reference validation and extracted-package rebuild results are recorded in the commercial record at handoff.

## Diagnostic limits and corrections

The initial radius-audit parser expected a `round` token at fullscreen; Chromium correctly serializes a zero radius as `inset(0px)`. The audit was corrected and all 76 visible radius states pass. An initial CLI invocation used an unsupported `--browser-gpu software` value; the documented `--no-browser-gpu` switch passed. The nine-time check completed slowly but passed; an unnecessary fallback check was cancelled after that result arrived.

The optional broad Markdown checker includes third-party node_modules and historical ending-source README links. Those inherited vendor/history findings are not a check of this revision's runtime. Current README links and instructions are checked directly; the historical README is explicitly identified as nonoperative in the current instructions.
