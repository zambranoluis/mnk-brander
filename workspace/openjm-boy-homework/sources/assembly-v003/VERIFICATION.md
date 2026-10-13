# Assembly V003 — verification and limits

Status: **provisional-final-original-outro**. Verified on 2026-10-11. Delivery is the manifest-driven FFmpeg master: **109.92 seconds / 2,748 frames, 1920 × 1080, 25 fps, silent H.264/yuv420p, BT.709 limited range**.

## Observed checks

- HyperFrames 0.8.146 was already current. Strict checks passed with both hardware and software browser rendering: zero lint/runtime/motion errors or warnings and no layout findings across nine samples. There is no DOM text to contrast-check in this video-only assembly; raster UI text is outside that audit. A full alternate HyperFrames encode is not claimed.
- Inspected the HyperFrames Text scene at 10.6 seconds: dashboard is visible, no black preview. Also inspected HyperFrames snapshots at 99.28, 101 and 104.84 seconds through the outro and its dissolves.
- Inspected all **151 encoded outro frames**, timeline frames 2474–2624, in eight numbered sheets, including every frame of the sixteen-frame incoming and six-frame outgoing dissolves. Editorial replacement label is absent throughout. Existing product text and branding remain.
- All 2,748 encoded frames checked against retained source footage or the scheduled linear blends. Maximum per-frame mean RGB error at 480 × 270: below 0.77/255 in single-source sections and below 1.21/255 over all 54 dissolve frames. The former label region was separately compared over all 151 outro frames. These are lossy-encoding tolerances, not exact pixel equality.
- Full-file FFmpeg decoding and metadata pass. Complete automated rate-1 playback passed in **109.9239 seconds**, all 2,748 frames, zero dropped frames, no waiting/stalled/error events; 220 temporal samples retained.
- Manifest comparison permits exactly version, assembly status and the new `showPlaceholderLabel: false` field. Every timing value, source offset, hold, transition, slot, and frame-75 replacement requirement equals V002. Composite status stays `pending`.
- 309 independently copied media, source, UI, vendor and reference files match V002 byte-for-byte. Completed Text and Images footage was reused without rerendering the UI. Original and normalized outro hashes match V002.
- Both builders were exercised for hidden/pending, visible/pending, omitted flag/pending, and visible/replaced. Omitted visibility keeps the legacy labelled behavior; status remains independent. The FFmpeg branch test records generated commands, and the delivered false case was fully encoded and visually inspected.
- Editable ZIP extracted successfully; every archived hash matches, **333 runtime references** resolve inside the extracted project. All ten generated compositions rebuild equivalently. A full FFmpeg rebuild from extracted files is **byte-identical to the delivered MP4**. Unreviewed replacement is rejected without changing the manifest.
- All **739 baseline files** in V001/V002, including their editable ZIPs, remain unchanged. Python syntax and scoped whitespace checks pass.

## Corrections and evidence

The first package rebuild assertion compared raw HTML bytes and failed because Studio adds `data-hf-id` editor attributes and capitalizes the doctype. The comparison now ignores only those nonvisual differences across all ten composition files; copied archive bytes are still checked exactly. The failed assertion and corrected results are retained. An initial comma-separated snapshot argument was interpreted by PowerShell as only 10.6; quoting the list captured all three intended outro times. No visual defect or timeline change resulted.

Detailed evidence is retained in the originating workspace at `tests/runs/assembly-v003-20261011/`, not as a runtime dependency. Interactive computer/browser inventory exposed no viewing surfaces. Playback above is automated normal-speed execution plus inspected frames, not human subjective playback approval. Studio is available at `http://localhost:3465/#project/assembly-v003` while its task-owned service runs; HTTP 200 and persistent preview status were verified. Studio manages its own editing history while open.

The actual laptop screen composite and audio remain future work. The original outro has not been certified as a replacement. Keep labelled V002 and this clean V003; any later composite belongs in a fresh revision, following the retained frame-75 validator and visual review requirements in README. This is a local provisional deliverable; no publishing or production promotion occurred.

MP4 SHA-256: `0f1475223c65865d7edbdd0bd9e4ca9d22434cc3807831aac30c25f920b3a4b3`.
