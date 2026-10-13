# OpenJM boy homework — screen replacement and directed product film

<!-- portrait-v006:start -->
## Portrait V006 — supplied cinematic SFX candidate

2026-10-12: implemented the supplied V006 plan as an independent revision. [Full MP4](output/portrait-v006/openjm-assembly-v003-audio-v002-portrait-v006.mp4), [mixed WAV](output/portrait-v006/audio/portrait-v006-mix.wav), [SFX stem](output/portrait-v006/audio/sfx-stem.wav), [private editable ZIP](output/openjm-portrait-v006-editable.zip), [rebuild instructions](output/portrait-v006/README.md), [117-cue manifest](output/portrait-v006/sfx-cues.json), [preparation settings](output/portrait-v006/sfx-preparation.json), and [verification limits](output/portrait-v006/VERIFICATION.md). This is the current sound candidate; earlier revisions remain preserved and do not acquire listening approval.

All six user-supplied ElevenLabs MP3s from `Desktop/commercial/audio/sound-effects` are copied unchanged into [retained workspace originals](assets/sfx-v006/provenance.json) and the package, including the exact filename `06-bird-flyb.mp3`. Provider settings were not supplied; no generation, account access or spend occurred. Kenney Interface Sounds 1.0 supplies verified CC0 UI taps, with source URL and original license in [package provenance](output/portrait-v006/assets/sfx/provenance.json). V005's bundled effects are absent from the V006 mix and asset selection. The retained V005 reference carries its old audio only for A/B comparison; the mixer maps its video alone. Supplied originals and the editable ZIP are private production material, not a standalone sound library.

The new treatment uses softened opening bloom with original seeded low-mid texture, one laptop contact at 3.84 s, UI-entry expansion at 9.44 s, three muted tap variations on actual entry frames spaced approximately 4–6 frames apart, distinct paste/selection/submission, and four bloom/tactile result combinations. Reaction and reading holds stay quiet. Fullscreen uses source 0.12–0.40 s; its final-stem crest falls at 96.745 s. Emergence onset is 99.2826 s; separated flutter follows inspected wing/turn gestures. Filtering shifted the flyby energy crest from source 0.415 to 0.785 s, so placement was recalculated to keep its final-stem crest at 104.400 s. Closing bloom starts after narration at 108.84 s; effects end at 109.539875 s.

**Measured checks:** all 2,748 V005 video packets, timestamps and decoded frames are identical: 1080 × 1920 / 25 fps / 109.92 s. PCM outputs contain exactly 5,276,160 stereo samples at 48 kHz. UI sample-peak offsets are at most 17.667 ms, within one frame. WAV measures −16.03 LUFS / −1.55 dBTP; AAC −16.04 LUFS / −1.54 dBTP. The original lossless audio-v002 master retains 0 dB gain; necessary local limiting reaches only 0.0654 dB (song: 0.0505 dB). Added effects duck by 9 dB beneath speech; the strongest measured overlapping SFX window is 12.24 dB below narration. Mono fold-down changes stem RMS by −0.809 dB, with correlation 0.666. These are masking/compatibility proxies, not subjective approval.

Song timing remains 76.96–79.96 s, the pause tap ends at 79.88 s, and both PCM outputs have exactly 48,000 zero samples per channel at 79.96–80.96 s. AAC boundary residue reaches −56.66 dBFS and decoding exposes 512 padding samples; exact-zero/sample-count claims remain PCM-only. The preview AAC packets equal the final MP4 audio packets. Complete unmuted rate-1 automated playback passed with 2,748 frames and zero drops/stalls/errors. HyperFrames 0.8.150 strict check passed with zero warnings/errors and nine layout samples; no version change was needed.

**Independent package:** final ZIP CRC/extraction and hashes pass for 794 files and 410 local references. Rebuilding from that final extraction reproduces 19 outputs byte-for-byte: prepared derivatives/measurements, cue manifest, stem, mixed WAV, preview AAC, MP4 and preview HTML. The extracted verifier also passes complete frame/packet identity and audio checks. All 785 preservation-baseline files (V005 package, supplied sources and earlier ZIPs) are unchanged; 693 inherited picture/UI/asset files are identical in V006.

**Comparisons and actual listening:** [six raw/prepared RMS-matched pairs and complete V005/V006 matched-level soundtracks](../../tests/runs/openjm-portrait-v006-20261012/comparisons/listen.html) were generated and measured. The laptop's largest 10 ms energy share falls from 74.6% to 36.4%; flutter energy below 120 Hz falls from 73.7% to 2.18%. Bloom remains mostly high-frequency, so the separate warm texture is retained. No headphone/speaker audition, subjective A/B judgment, naturalness/chirp/musical-content certification or intelligibility approval occurred. No further filtering changes were made on the pretense of listening.

Evidence: [mix](../../tests/runs/openjm-portrait-v006-20261012/mix-report.json), [final extracted verifier](../../tests/runs/openjm-portrait-v006-20261012/package-rebuild/verification.json), [cue-picture inspection](../../tests/runs/openjm-portrait-v006-20261012/cue-picture-review.jpg), [final cue anchors](../../tests/runs/openjm-portrait-v006-20261012/final-cue-anchors.json), [automated playback](../../tests/runs/openjm-portrait-v006-20261012/playback.json), [strict preview check](../../tests/runs/openjm-portrait-v006-20261012/hyperframes-check.txt), [preservation](../../tests/runs/openjm-portrait-v006-20261012/preservation.json), [final ZIP audit](../../tests/runs/openjm-portrait-v006-20261012/package-final/package-check.json), [reproduction hashes](../../tests/runs/openjm-portrait-v006-20261012/package-rebuild.json), and [objective comparisons](../../tests/runs/openjm-portrait-v006-20261012/comparisons/comparison.json). The first verifier run hit a local function-name shadowing error, corrected before the passing run. V006 copies of inherited auxiliary scripts now reference the actual retained ending; V005 was not modified.

**Status and exact next action:** implementation, technical verification and private editable delivery are complete as a candidate. Human listening acceptance remains open: review the full MP4 at normal speed on headphones and speakers, then compare the matched files for laptop spike, bloom brightness, bird rumble, flyby emphasis and speech clarity. Record device, moments and actual judgment before declaring it selected/final. No publication, production replacement, staging, commit or provider change occurred; unrelated user state and processes remain intact.
<!-- portrait-v006:end -->

<!-- portrait-v005:start -->
## Portrait V005 — subtle SFX, delivered for listening review

2026-10-12: executed the supplied plan as an independent V004 derivative. [Full V005 MP4](output/portrait-v005/openjm-assembly-v003-audio-v002-portrait-v005.mp4), [editable ZIP](output/openjm-portrait-v005-editable.zip), [rebuild instructions](output/portrait-v005/README.md), [cue manifest](output/portrait-v005/sfx-cues.json), [SFX stem](output/portrait-v005/audio/sfx-stem.wav), [mixed WAV](output/portrait-v005/audio/portrait-v005-mix.wav), and [verification and limits](output/portrait-v005/VERIFICATION.md).

142 deterministic cues use independent originals of the bundled soft-click, key-press, chime and short-whoosh assets with [provenance](output/portrait-v005/assets/sfx/provenance.json). Actual scene frame states and interaction schedules supply typing, press and completion cues; assembly offsets translate them. Single paste and numeric entries are distinguished from character typing. Cursor moves, placeholder events and reading holds are silent. Soft opening/expansion accents and separated stylized bird movement finish by 106.96 s. No continuous chirping, paid generation, frontend/API edits or picture changes.

**Measured verification:** every one of V004's 2,748 video packets, timestamps and full-resolution decoded frames is identical. Both PCM outputs contain exactly 5,276,160 stereo samples at 48 kHz; delivery remains 1080 × 1920 / 25 fps / 109.92 s. The maximum UI transient offset is 25.834 ms, within one frame. The strongest overlapping effect is 19.91 dB below narration in the measured 100 ms voiced windows. WAV measures −16.02 LUFS / −1.52 dBTP; AAC −16.03 LUFS / −1.51 dBTP. Original base gain stays at 0 dB; necessary local peak limiting reduces isolated peaks by at most 0.02924 dB.

Song source and placement remain 76.96–79.96 s; the authorized pause tap ends at 79.888 s. The gap from 79.96–80.96 s is exactly 48,000 zero PCM samples per channel. AAC transform residue at the gap edges reaches −56.66 dBFS, and decoding exposes 512 padding samples beyond logical duration; exact-zero/sample-count claims apply only to the WAV and stem. Final peak reduction over the song is at most 0.02050 dB.

Complete unmuted automated rate-1 playback passes with 2,748 frames, zero drops/stalls/errors. Inspected 34 playback samples across all requested review moments and a 30-image outro motion sheet. Strict HyperFrames 0.8.150 check passes with zero warnings/errors and nine layout samples. The preview references V005's exact AAC stream. These checks do not establish human hearing or approval.

**Independent package:** 771 files and 409 local runtime/media references verified after ZIP extraction and CRC checking. Fresh npm dependencies and an extracted-package rebuild reproduce the stem, mixed WAV, preview AAC, MP4, cue-state extraction and preview HTML byte-for-byte. 763 earlier files remain unchanged, with 693 identical retained picture/UI/asset copies. The first preservation inventory accidentally counted just-created V005 copies as earlier files; the raw baseline is retained and the corrected prior-version audit excludes only V005. The delivered limiter was refined from whole-mix resampling to a measured local gain envelope, reducing the intervention to 0.03 dB.

Evidence: [mix](../../tests/runs/openjm-portrait-v005-20261012/mix-report.json), [picture/cues/audio](../../tests/runs/openjm-portrait-v005-20261012/verification.json), [automated playback](../../tests/runs/openjm-portrait-v005-20261012/playback.json), [inspected playback samples](../../tests/runs/openjm-portrait-v005-20261012/playback-review.jpg), [outro motion](../../tests/runs/openjm-portrait-v005-20261012/outro-motion.jpg), [strict preview check](../../tests/runs/openjm-portrait-v005-20261012/hyperframes-check.txt), [preservation](../../tests/runs/openjm-portrait-v005-20261012/preservation.json), [archive audit](../../tests/runs/openjm-portrait-v005-20261012/package-final/package-check.json), and [independent rebuild](../../tests/runs/openjm-portrait-v005-20261012/package-rebuild.json).

**Status and next action:** implementation, measured checks and independent packaging complete. Review V005 at normal speed on headphones and speakers for warmth, subtlety, speech clarity and synchronized tails. Human listening remains pending; unheard audio is not approved. Earlier deliverables and user-managed services remain intact. No staging, commit, production replacement, publication or deployment occurred.
<!-- portrait-v005:end -->

<!-- portrait-v004:start -->
## Portrait V004 — rounded Video card correction

2026-10-12: implemented the supplied plan as an independent V003 derivative. [V004 master](output/portrait-v004/openjm-assembly-v003-audio-v002-portrait-v004.mp4), [editable ZIP](output/openjm-portrait-v004-editable.zip), [reproduction instructions](output/portrait-v004/README.md), [source correction](output/portrait-v004/ui/portrait.js), and [verification and limits](output/portrait-v004/VERIFICATION.md).

The separate presentation overlay now clips its two top corners to the player's existing inner radius: 14px outer radius minus the 1px border, converted through the measured player scale and current overlay scale. The existing frame-derived fullscreen easing reduces the visible radius from 13px to zero; reverse seeks recompute it. Border, controls, artwork, colors, playback timing, native ending and soundtrack remain unchanged. Only the 466-frame Video scene was recaptured, then the master was rebuilt. Earlier deliveries and frontend application are preserved.

**Verified:** both corners inspected in every visible frame from 93.96-96.96 seconds in source captures and the encoded master. No green overpaint, gap or corner snap observed. All 81 forward/reverse source screenshots and 162 encoded-master seeks match exactly at 1080 x 1920. Radius arithmetic follows the existing fullscreen progress continuously to zero. Automated rate-1 playback from 93.76 seconds through the end passes with zero drops, stalls or errors; representative samples inspected. HyperFrames 0.8.150 strict checks pass at nine relevant times. Full decode and required 1080 x 1920 / 25 fps / 2,748 frames / 109.92 seconds pass. All 5,154 AAC packets and timestamps are identical, and all 2,282 full-resolution pictures outside the Video slot match V003. All 748 V003 baseline files and 703 other independent source/UI/asset copies are unchanged.

Evidence: [corner states and reverse seeks](../../tests/runs/openjm-portrait-v004-20261012/corners/video-check.json), [radius audit](../../tests/runs/openjm-portrait-v004-20261012/radius-audit.json), [encoded corner details](../../tests/runs/openjm-portrait-v004-20261012/encoded/corner-detail-1.png), [master/audio](../../tests/runs/openjm-portrait-v004-20261012/verification.json), [unchanged pictures](../../tests/runs/openjm-portrait-v004-20261012/unchanged-picture.json), [preservation](../../tests/runs/openjm-portrait-v004-20261012/preservation.json), [encoded seeks](../../tests/runs/openjm-portrait-v004-20261012/video-seeks.json), [playback](../../tests/runs/openjm-portrait-v004-20261012/corners-playback.json), and [HyperFrames](../../tests/runs/openjm-portrait-v004-20261012/hyperframes-check.json).

**Package:** 751 files byte-verified after ZIP CRC checking/extraction; all 262 local runtime references resolve. [Archive audit](../../tests/runs/openjm-portrait-v004-20261012/package/package-check.json). Fresh `npm ci`, `npm run build` and `npm run render` from the extracted package succeed and reproduce the master byte-for-byte. Its 81 source screenshots also match the delivered source exactly, with no external requests or runtime errors. [Independent rebuild](../../tests/runs/openjm-portrait-v004-20261012/package-rebuild.json).

**Status and next action:** implementation, rendering, verification and independent editable packaging are complete. The user can review V004, especially 93.96-96.96 seconds; no required implementation work remains. [Editable V004 Studio](http://localhost:3473/#project/portrait-v004) returns HTTP 200; earlier preview services remain intact. Current UI inventory exposed no browser/native viewing surface, so automated playback and sampled visual inspection are distinguished from human continuous viewing/listening approval. No staging, commit, promotion, publication or deployment occurred.
<!-- portrait-v004:end -->

<!-- portrait-v003:start -->
## Portrait V003 — native portrait ending, delivered for review

2026-10-12: implemented the supplied plan in an independent derivative. [V003 master](output/portrait-v003/openjm-assembly-v003-audio-v002-portrait-v003.mp4), [standalone silent ending](output/portrait-v003/openjm-ending-native-portrait-v003.mp4), [editable ZIP](output/openjm-portrait-v003-editable.zip), [reproduction instructions](output/portrait-v003/README.md), and [verification and limits](output/portrait-v003/VERIFICATION.md). V001/V002 remain preserved; this changes only the brand-ending picture and its existing dissolve.

The genuine animation was copied from `web-openjm-frontend/workspace/dashboard-loader-video/source/v2`, with independent model, artwork, production style references and dependency manifests. Its landscape export matches the retained original ending byte-for-byte. The native 1080 x 1920 camera uses the existing responsive flight bounds and wingspan scaling. Original artwork, colors, particles, lighting, bird character and message remain. Opening mark is 240px; wordmark is 420px wide. The opening hold remains 0.5 seconds. Portrait arrival is 1.566667 seconds; natural hover extends to the fixed 4.066667-second fade, which completes at 4.666667. The centered close continues to 5.16 seconds. The 60 Hz simulation is sampled at 25 fps without changing animation speed.

**Verified:** ending is silent / 129 frames / 5.16 seconds; master is 1080 x 1920 / 25 fps / 2,748 frames / 109.92 seconds. Both decode completely. All 5,154 AAC packets and timestamps match audio-v002. All 2,619 full-resolution pictures before frame 2619 are identical to V002. The six-frame dissolve, every camera path, mobile input and assembly placement remain unchanged. All 2,748 pictures pass the source/blend audit. All 1,428 V001/V002/loader baseline hashes and 639 original commercial-source hashes remain unchanged. The extracted package rebuilt both MP4s byte-identically using local retained sources and freshly installed pinned dependencies.

All 129 ending frames and the affected transition frames were inspected, including entrance, wing clearance, hover, typography, synchronized fade and final hold. Automated rate-1 playback of the ending and actual master transition passes with zero drops/stalls/errors; sampled playback images were inspected. All forward/reverse animation states match. 47 screenshots match exactly; 82 differ by isolated one-channel-level GPU rounding pixels (worst frame mean 0.000000482254/255). The first SVG reverse-seek rasterization failure was corrected with compositor layers; the initial software-GPU performance warnings and the playback server's byte-range correction remain documented. HyperFrames strict checks pass for the native ending with hardware GPU and the master at nine software-rendered scene times. Raster typography and human listening are outside those automated checks.

Evidence: [ending and seeks](../../tests/runs/openjm-portrait-v003-20261012/ending-audit.json), [master/audio](../../tests/runs/openjm-portrait-v003-20261012/verification.json), [unchanged pictures](../../tests/runs/openjm-portrait-v003-20261012/unchanged-picture.json), [picture audit](../../tests/runs/openjm-portrait-v003-20261012/picture-audit.json), [ending playback](../../tests/runs/openjm-portrait-v003-20261012/ending-playback.json), [transition playback](../../tests/runs/openjm-portrait-v003-20261012/transition-playback.json), [preservation](../../tests/runs/openjm-portrait-v003-20261012/preservation.json), and [independent rebuild](../../tests/runs/openjm-portrait-v003-20261012/package-rebuild.json).

**Package:** the final ZIP contains 748 byte-verified files and 262 resolved local runtime references; CRC, extraction and all file hashes pass. [Final archive audit](../../tests/runs/openjm-portrait-v003-20261012/package-final/package-check.json).

**Status and next action:** rendering, technical verification and independent packaging are complete; review the standalone ending and V003 master at normal speed for composition, transition feel, pacing and sound. No interactive browser/native viewing surface was exposed, so continuous subjective viewing/listening approval is not claimed. [Editable V003 Studio](http://localhost:3472/#project/portrait-v003) remains available alongside V001/V002. The frontend application was not changed. Nothing was staged, committed, promoted, published or deployed; the files are local deliverables.
<!-- portrait-v003:end -->

<!-- portrait-v002:start -->
## Portrait V002 — fullscreen camera paths, delivered for visual review

2026-10-12: implemented the supplied plan in an independent derivative, preserving V001. [V002 MP4](output/portrait-v002/openjm-assembly-v003-audio-v002-portrait-v002.mp4), [editable ZIP](output/openjm-portrait-v002-editable.zip), [package instructions](output/portrait-v002/README.md), [camera paths](output/portrait-v002/camera-paths.json), [camera editing/reproduction](output/portrait-v002/CAMERA-PATHS.md), [timing owner](output/portrait-v002/assembly.json), and [verification/limits](output/portrait-v002/VERIFICATION.md).

All four live-action shots now fill 1080 x 1920 using the widest exact 9:16 source crop, 607.5 x 1080, with no extra zoom. Editable frame-indexed C1 cubic camera paths follow expression-to-lid, hand-to-display, the widening reaction, and boy-to-bird flight. All crop boxes remain inside the source. Source speed, original laptop imagery, mobile footage, brand plate, soundtrack and transitions are retained. Early bird emergence/return and final wing clearance were corrected after sequence inspection; first-pass evidence is preserved. The reaction's initial missing upper face is an existing source limitation. Portrait cropping excludes landscape context and laptop side edges; no missing image area was generated.

**Verified:** 25 fps / 2,748 frames / 109.92 seconds; complete decode; all 5154 AAC packets and timestamps unchanged; all 529 photographic frames and all affected transition frames inspected; all 2,748 assembled pictures pass the source/blend audit (maximum mean 1.204155/255). All 2227 full-resolution frames outside affected shots/overlaps are identical to V001. Automated rate-1 playback passes with zero drops/stalls/errors (110.4617 seconds); its 46 changed-range samples were inspected. 1064 forward/reverse seeks over 532 actual master frames are pixel-identical at audit resolution. Strict HyperFrames 0.8.150 software checks pass at nine times. All 690 V001 baseline files and 639 original-source hashes remain unchanged. The ZIP contains 697 byte-verified files and 259 resolved local runtime references. Building the extracted package succeeds, and its 151-frame outro camera rerender is byte-identical to delivery. [Independent rebuild](../../tests/runs/openjm-portrait-v002-20261012/package-rebuild.json). [Technical results](../../tests/runs/openjm-portrait-v002-20261012/verification.json), [camera audit](../../tests/runs/openjm-portrait-v002-20261012/camera-audit.json), [picture audit](../../tests/runs/openjm-portrait-v002-20261012/picture-audit.json), [unchanged frames](../../tests/runs/openjm-portrait-v002-20261012/unchanged-picture.json), [playback](../../tests/runs/openjm-portrait-v002-20261012/playback.json), [seeking](../../tests/runs/openjm-portrait-v002-20261012/video-seeks.json), [preservation](../../tests/runs/openjm-portrait-v002-20261012/preservation.json), [ZIP verification](../../tests/runs/openjm-portrait-v002-20261012/package-check.json).

**Status and next action:** implementation, rendering, technical checks and independent editable packaging are complete; the user reviews the camera paths, particularly the outro handoff and final bird flight. No interactive viewing surface was exposed, so measured playback and sampled/frame-sequence inspection are distinguished from human continuous viewing or listening approval. [V002 Studio](http://localhost:3471/#project/portrait-v002) returns HTTP 200 and remains available; V001's server on 3470 is preserved. The test harness's CORS, bounded seeking and quoted CLI sample-list corrections are documented in the package. No production promotion, staging, commit, push, publication or unrelated service change occurred.
<!-- portrait-v002:end -->

<!-- portrait-v001:start -->
## Portrait edition V001 — delivered for visual and listening review

2026-10-12: the supplied implementation plan authorizes a separate portrait derivative, including rendering and verification. [Portrait master](output/portrait-v001/openjm-assembly-v003-audio-v002-portrait-v001.mp4), [editable ZIP](output/openjm-portrait-v001-editable.zip), [editable package instructions](output/portrait-v001/README.md), [timing owner](output/portrait-v001/assembly.json), [verification and review limits](output/portrait-v001/VERIFICATION.md), and [16-second portrait presentation](output/portrait-v001/assets/water-cycle-presentation-portrait-16s.mp4). The earlier landscape outputs and physical-screen registration decision remain in force; no screen replacement was attempted.

The actual frontend mobile styles, mobile navigation and bottom-sheet portal behavior were inspected and retained independently. Eight relevant source files and hashes are in the package's frontend reference inventory; `web-openjm-frontend` was read but not edited. The controlled conversation is staged at **360 × 640 CSS pixels / 3× capture**, producing **1080 × 1920 / 25 fps / 2,748 frames / 109.92 seconds**. Text, Images, Music and Video preserve wording, assets, action release times and continuous conversation state. Mobile wrapping and native scrolling replace desktop camera moves. Touch focus/press feedback replaces the cursor; no tap rings or OS keyboard. Video selects Portrait 9:16. This remains controlled staging, not live generation/performance evidence.

The introduction and reaction use individual moving portrait crops. The laptop-opening shot uses a wider moving crop on a dark canvas to retain display/hand action. The complete original outro is fitted because the bird crosses the room; the complete brand animation and typography are uniformly fitted against its sampled background. Original displays are retained. Presentation artwork and registered process graphics are proportionally fitted, with editable portrait labels and unchanged four-part/400-frame timing. Its player begins at 95.96 s and expands to fullscreen without restarting; V003's short assembly slot remains unchanged, with the complete 16-second presentation delivered separately.

All nine scene placements and eight transition durations remain unchanged. Play/Pause are **76.96 / 79.96 s**. Final AAC stream-copy verification matches **all 5,154 packet hashes, PTS/DTS, durations and side data** to audio-v002. Full decoding and metadata pass. All 2,748 picture frames match the expected sources/blends within encoding tolerance (maximum mean 1.406/255 at audit resolution). All eight boundary contact sheets, including all 54 dissolve frames, and moving-footage samples were inspected. There are 69 representative reverse seeks: 68 pixel-identical; one Music sample differs only in very small native icon rasterization. The extracted package's Video project passed 20 further seeks with no missing/external asset requests. HyperFrames 0.8.150 passed strict software checks at nine scene times; its hardware attempt stalled and was stopped. The derivative alone was upgraded from 0.8.146. Native browser/PIL/FFmpeg checks do not certify human visual or listening approval.

Corrections retained in the evidence: mobile sheet layering/scroll, wrapped input height, and restoration of welcome typography after shared CSS alignment. An initial normal-speed playback under concurrent load completed with 22 dropped frames; it is retained separately, and the final idle run passed: all 2,748 frames, zero dropped frames, no stalls/errors, rate 1, 110.0255 seconds wall time. All 220 sampled playback frames were inspected. [Playback evidence](../../tests/runs/openjm-portrait-v001-20261012/playback.json). All 639 copied original-source hashes and eight frontend references remain unchanged; the original V003 master still matches its recorded SHA-256. Evidence: [technical results](../../tests/runs/openjm-portrait-v001-20261012/verification.json), [picture alignment](../../tests/runs/openjm-portrait-v001-20261012/picture-audit.json), [seek raster audit](../../tests/runs/openjm-portrait-v001-20261012/seek-pixel-audit.json), [package byte/reference audit](../../tests/runs/openjm-portrait-v001-20261012/package-check.json).

**Status and next action:** implementation, rendering, technical verification and independent editable packaging are complete. The ZIP has 694 byte-verified files and 259 resolved local runtime references. The user reviews portrait framing, reading comfort, pacing and sound; subjective visual/listening approval is not claimed. No staging, commit, push, publishing or production promotion is authorized or performed. [Editable Studio](http://localhost:3470/#project/portrait-v001) returns HTTP 200 and remains available on the task-owned server.
<!-- portrait-v001:end -->


## Narration and music V002 — mixed review copy; listening pending

Implemented the supplied audio-mix plan. [Review MP4](output/audio-v002/openjm-assembly-v003-audio-v002.mp4) and [24-bit WAV](output/audio-v002/openjm-audio-v002-mix.wav) are exported in the existing V002 folder. The [handoff](output/audio-v002/README.md), [actual recordings/transcripts](output/audio-v002/supplied-recordings.md), [cue data](output/audio-v002/timing.json), and [mix verification](output/audio-v002/mix-and-verification.md) describe the current result.

All eleven supplied Desktop MP3s were copied with unchanged filenames and matching SHA-256 hashes to [commercial originals](assets/audio-v002/originals/); original hashes were checked again after export. The supplied takes govern wording: N01 “create them,” N05 “You can give your idea a melody, too,” and N07 “Bring your pictures and music closer, and see how it all comes together.” Earlier prompt/cue records remain in the [pre-mix snapshot](assets/audio-v002/prompt-package-before-mix/); V001 and the three V002 generation prompts are unchanged. Voice ID/model/settings were not supplied. Raw automated transcripts are retained separately and do not certify pronunciation or voice consistency.

Narration starts at 0.80, 11.00, 33.20, 43.20, 53.20, 59.00, 82.00, 96.80 and 105.20 seconds. All words, internal pauses and original pace are preserved. N08 ends at 104.349396 s; N09 loses only 31.020833 ms of trailing silence and ends at 108.80. The 3.53 LU take variation is balanced by constant per-take gain before mastering. The bed ducks beneath speech, fades out 76.56–76.96, remains muted until 80.96, returns through 82.00, and reaches silence at 109.92 while continuing its original source timeline. The exact first three seconds of the song occupy 76.96–79.96 with a final 10 ms de-click; the interrupted word at Pause is accepted by the supplied plan.

**Technical results:** WAV and AAC are −16.02 LUFS integrated; true peaks −1.50 / −1.49 dBTP. WAV is 48 kHz stereo / 24-bit / exactly 5,276,160 samples. The 109.92-second picture is stream-copied: all 2,748 video packets, timestamps and decoded frames match V003. Full decode and final original-hash checks pass. [Results](../../tests/runs/openjm-audio-v002-mix-20261011/verification.json) and [preservation](../../tests/runs/openjm-audio-v002-mix-20261011/preservation-after.json) retain evidence. Encoded controls at frames 1923/1924/1999 were inspected. A fresh export transcription recovers all nine narration phrases but omits the short song; it is not listening approval.

The first PCM exact-silence check found 14 samples of −138.47 dBFS master-resampling residue after Pause. Explicitly zeroing the authored silent second corrected it; the failed candidate is retained. AAC still has expected transform-window residue (first 10 ms after Pause peak −56.66 dBFS) and 512 raw decode-padding samples; its container presentation is 109.92 s with start 0. WAV/stem boundaries are exact. No subjective assertion is inferred from these measurements.

**Next action:** the user reviews the MP4 on headphones and ordinary speakers for clarity, consistent voice, “Open Jay Em” pronunciation in N01/N02/N09, music balance, transitions and ending. That listening remains outstanding; the requested review copy is delivered without claiming full listening approval. No picture project, provider/service setting, earlier media or unrelated change was modified; nothing was staged, committed, published or promoted. The unchanged original-outro and V004 registration decisions remain in force.

## Narration and music V001 — preserved earlier draft; V002 supersedes narration

2026-10-11: the supplied narration/music plan authorizes audio for the fixed V003 picture. The user subsequently chose **“I’ll generate and download the files using the prompts.”** The immediate deliverable is complete: [generation handoff](output/audio-v001/README.md), [121-word timed narration and voice direction](output/audio-v001/01-narration.md), [instrumental prompt](output/audio-v001/02-instrumental.md), [exact-lyric song prompt](output/audio-v001/03-homework-song.md), [cue data](output/audio-v001/timing.json), and [local mixing/export/verification instructions](output/audio-v001/mix-and-verification.md). At that earlier checkpoint these were prompt-ready files; generated-audio status is superseded by V002 above.

Settled direction: one warm, conversational adult female English narrator, gentle piano/light percussion/uplifting textures, brand pronounced “Open Jay Em,” no captions or extra sound effects. Nine separate narration takes fit proposed windows at approximately 117–133 words/minute; generated takes still require duration and listening checks. The song retains the exact displayed six-line lyric and requests a 16-second full version with immediate singing; only its first three seconds will play. The bed mutes at 76.96, the song stops at 79.96 with Pause, and the bed returns from 80.96. No narration runs from 66.20 through 82.00. This is external commercial sound design, not proof of live OpenJM song generation.

Fresh verification: FFprobe confirms the source is silent H.264, 1920 × 1080, 25 fps, 2,748 frames and 109.920000 seconds. Its SHA-256 matches the retained V003 master below. The assembly music slot starts at frame 1424/56.96 seconds; the source play/pause actions at 20/23 seconds yield output frames 1924/1999. Actual encoded frames 1850, 1923, 1924 and 1999 were inspected for lyrics, pre-play, playing and paused states: [contact sheet](../../tests/runs/openjm-audio-v001-20261011/song-controls.jpg). Prompt/cue validation and its scope are retained in [verification](../../tests/runs/openjm-audio-v001-20261011/package-verification.json).

ElevenLabs documentation was checked for TTS and music prompting. This session exposed no ElevenLabs tool, configured API key or usable browser session; account capability was not tested. The user owns generation now. Retain all eleven original downloads with their actual extensions under `assets/audio-v001/originals/` when supplied; log voice ID/model/settings and selected take names. The folder is proposed, not populated. New candidate outputs will use `output/audio-v001/openjm-audio-v001-mix.wav` and `output/audio-v001/openjm-assembly-v003-audio-v001.mp4`, keeping video stream copy and all earlier deliverables intact.

**Historical next action (superseded by the V002 mix above):** the user generates and provides nine narration downloads, one instrumental and one vocal song using the prompts. Then fit and mix locally, measure WAV and encoded AAC near −16 LUFS with maximum −1 dBTP, check Play/Pause synchronization and all 2,748 unchanged frames, fully decode the new export, and obtain actual headphone/speaker listening. Those audio checks and exports remain pending. This audio checkpoint supersedes the older “audio remains future work” next-action wording; original-outro and V004 registration decisions remain settled. No existing picture, earlier package, provider configuration or service was changed; nothing was staged, committed or promoted.

## Outro presentation V004 — bounded attempt stopped; retain original outro

2026-10-11: implemented the supplied joint-tracking attempt in the [independent V004 project](output/outro-presentation-v004-preview-project/README.md). **Registration failed; the recommendation is to keep the original outro.** This replaces the previous outro next-action/review state only. Assembly decisions and synchronization contracts remain unchanged.

Fresh original-source annotations and manual corrections supplied boundary search regions without using V003 coordinates. All 95 potentially visible frames have inner-glass and surrounding-bezel observations with explicit confidence: 9,880 points, including 1,095 unobservable estimates, 6,954 blurred estimates and 1,831 measured transition candidates. One sequence-wide OpenCV/NumPy solve combines a single display homography per frame, a fixed bezel model, uncertainty-weighted alignment and temporal acceleration constraints. Original-source crops, coordinates, confidence, controls and build hashes are retained.

**Failed gate:** 40 separately marked withheld edge points produce **1.6609 px median / 7.0026 px maximum**, exceeding the required ≤1 / ≤2 px. These marks carry approximately 2 px annotation uncertainty and cannot certify one-pixel physical accuracy. Frames **50–68 (2.0833–2.8333 seconds, inclusive frame timestamps)** remain unsupported by reliable visible boundaries. Withheld samples also exceed 2 px at frames 80, 96, 112, 128 and 140. Even fitting candidates include 119 residuals above 2 px. Convergence and smoother motion do not establish stable registration. [Measurement results](../../tests/runs/outro-presentation-v004/registration.json), [visual review and limitations](../../tests/runs/outro-presentation-v004/review.md), [enlarged original/grid/stabilized-bezel diagnostic](../../tests/runs/outro-presentation-v004/original-grid-stabilization-diagnostic.mp4).

Exact presentation frame 50 at 2.000 seconds and the selected inset are prepared: a 1600 × 1000 canvas, complete 1472 × 828 presentation centred at `(64,86)`, constant dark neutral border. They were not composited into an export. All 95 grid/original-bezel states were inspected, including adjacent-frame comparisons. No optical blur, edge blend or fade was added after failure. The conditional V004 presentation MP4, HyperFrames preview and original/presentation comparison were **not produced**. Animated playback, final production and assembly replacement remain deferred.

**Verification:** original and diagnostic grid are 145 frames, 1920 × 1080, 24 fps, 6.041667 seconds, no audio; full decoding passes. Exact frozen-source selection, inset geometry/constant border, and unchanged lossless pixels outside all 145 diagnostic masks pass; this does not validate physical coverage. Normal-speed automated diagnostic playback completed with zero dropped frames; quarter-speed completed with one dropped frame and failed its zero-drop assertion. HyperFrames delivery checks/deterministic preview seeks were not run after the registration gate failed. [Technical results](../../tests/runs/outro-presentation-v004/technical-verification.json). [Preservation](../../tests/runs/outro-presentation-v004/preservation-after.json) verifies all **2,109** baseline source/prior-project/export/assembly files unchanged, excluding runtime caches. No previous project, assembly, application/API, service or provider setting was changed by this task; no staging, commit or promotion occurred. The concurrently added Assembly V003 record below is preserved. Artifacts remain local/untracked.

**Stop and next action:** review the failure evidence and retain the original outro. The authorized bounded attempt has ended; no further replacement revision is underway. A materially different continuation requires new user direction.

<!-- assembly-v003:start -->
## Assembly V003 — clean provisional final

2026-10-11: implemented the supplied V003 plan. Status: **provisional-final-original-outro**. [Clean MP4](output/assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4), [independent editable ZIP](output/openjm-assembly-v003-editable.zip), [V003 instructions](output/assembly-v003/README.md), [manifest](output/assembly-v003/assembly.json), [verification and limits](output/assembly-v003/VERIFICATION.md), [Studio preview](http://localhost:3465/#project/assembly-v003).

V003 independently copies V002 and removes only the editorial replacement overlay. `outroContract.showPlaceholderLabel` is false in both HyperFrames and FFmpeg; composite status remains **pending**. Original product text and branding remain. The original outro retains its full 151 frames, framing and normal-speed action, sixteen-frame incoming and six-frame outgoing dissolves. All scene timing, holds and transitions are unchanged: **109.92 seconds / 2,748 frames, 1080p, 25 fps, silent**. Completed UI footage is byte-identical to V002 and was not rerendered.

The frame-75 replacement contract and its required visual evidence remain available for a future revision. Labelled V002 remains preserved for that work. This assembly V003 is separate from the earlier failed `outro-presentation-v003-preview-project`; no unfinished composite was integrated.

Verification: strict HyperFrames hardware/software checks passed; the Text snapshot at 10.6 seconds is visible. All 151 outro frames, including every frame of both dissolves, were inspected with no label. All 2,748 encoded frames match source pictures or blends within encoding tolerance; full decode and metadata pass. Automated full rate-1 playback completed in 109.9239 seconds with all 2,748 frames, zero drops, stalls or errors. ZIP extraction verifies 333 local runtime references, all copied hashes, equivalent composition rebuilds, and a byte-identical full FFmpeg rerender. All 739 V001/V002 baseline files remain unchanged. [Contract/hash audit](../../tests/runs/assembly-v003-20261011/contract.json), [playback](../../tests/runs/assembly-v003-20261011/playback.json), [package check](../../tests/runs/assembly-v003-20261011/package-check.json), [full rebuild](../../tests/runs/assembly-v003-20261011/rebuild-check.json), [preservation](../../tests/runs/assembly-v003-20261011/preservation-after.json).

Package verification initially failed on Studio-added editor IDs and doctype casing; corrected comparison ignores only those nonvisual differences. No interactive viewing surface was exposed, so human subjective playback approval is not claimed. Current next action: user review of this clean provisional master; audio and the actual screen composite remain future work. No staging, commit, publishing, production promotion or unrelated service changes. Files are local; repository sharing is not implied.

MP4 SHA-256: `0f1475223c65865d7edbdd0bd9e4ca9d22434cc3807831aac30c25f920b3a4b3`.
ZIP SHA-256: `ffba7b05c2d287c11cc7983f7f1bcd4f775a4ac33b7475f685d175b6cb5207cf`.
<!-- assembly-v003:end -->

<!-- assembly-v002:start -->
## Smoother assembly V002 — delivered for review

2026-10-11: implemented the supplied plan as an independent revision. **109.92 seconds / 2748 frames, silent 1920 × 1080 at 25 fps.** [Review MP4](output/assembly-v002/renders/openjm-assembly-v002-review.mp4), [independent editable ZIP](output/openjm-assembly-v002-editable.zip), [project and replacement instructions](output/assembly-v002/README.md), [manifest](output/assembly-v002/assembly.json), [verification and limits](output/assembly-v002/VERIFICATION.md). [Studio](http://localhost:3464/#project/assembly-v002) remains available on the task-owned preview service.

Text holds its original reading camera for five seconds (source 15.8–20.8), then uses one two-second pullback to the image opening; total 22.8 seconds. Images stays at a fixed camera, holding its settled board from 17–20 seconds plus 0.32 seconds for the outgoing dissolve; total 20.32 seconds. Original content, typing, clicks, native layout and artwork are preserved in independent `ui/text` and `ui/images` projects. Both clips were rendered at 3840 × 2160 and downsampled. The old Text ambient still was replaced with the retained native particle renderer, using the same deterministic clock as Images. The exact Text endpoint and Images opening match pixel-for-pixel.

The shared manifest now has all eight boundary transitions: four eight-frame dissolves, the matched Text→Images pullback/cut, the unchanged Music→Video cut, the sixteen-frame presentation→outro dissolve and preserved six-frame ending dissolve. Linear incoming picture weighting retains an opaque outgoing picture. No speed ramps, decorative transitions or new titles were added.

**V002 replacement contract (carried into V003):** Video begins presentation at source 15 seconds; the outro starts after three seconds at source 18.00 and overlaps through source 18.64. Required embedded presentation starts at **3.00 seconds / frame 75**, continuing synchronously through frames 75–90 during the overlap. The full 151-frame original outro is retained at timeline 98.96–105.00; brand ending starts at 104.76. “OUTRO PLACEHOLDER — screen composite pending.” is attached to the outro picture and follows both dissolves. V001's frame-34 contract remains historical and unchanged in V001. The unfinished standalone composite is neither produced nor integrated by this task.

Verification: strict HyperFrames 0.8.146 assembly check passes with zero errors/warnings, as do native UI/layout and Text reading/contrast checks. All 1080 UI frame states checked; fixed camera geometry throughout both holds, continuing ambient motion, and 23 repeatable sampled seeks. Two pre-submit Text samples show only small browser composer-edge antialias variation (maximum 4/255 channel value; mean below 0.001/255), with exact geometry. Metadata and full-file decode pass. All 2748 encoded frames align to sources or blends; every one of 54 dissolve frames was mathematically checked and visually inspected. All 220 samples from complete normal-speed playback were inspected. Playback passed in 109.9382 seconds: all 2748 frames, zero dropped frames and no waiting/stalled/error events. This is automated playback and frame inspection, not claimed human subjective playback approval.

The ZIP was extracted independently: every copied hash matches, 333 local runtime references resolve within the package, the manifest rebuild reproduces the composition, and an unreviewed replacement is rejected without mutation. Wrong fps and obsolete frame-34 evidence also fail validation. All 358 original/V001/source-project baseline files remain unchanged. [Package evidence](../../tests/runs/assembly-v002-20261011/package-check.json), [playback result](../../tests/runs/assembly-v002-20261011/playback.json), [UI audit](../../tests/runs/assembly-v002-20261011/ui-check.json), [transition audit](../../tests/runs/assembly-v002-20261011/every-transition-frame.json), and [preservation](../../tests/runs/assembly-v002-20261011/preservation-after.json).

Corrections: Studio initially read an unfinished Text MP4, producing the user-reported black scene. A complete temporary source restored preview; both completed V002 files are now connected, and the Text scene at 10.6 seconds and boundaries were inspected. The renderer now finalizes via a `.rendering.mp4` candidate before swapping media. An initial transparent-canvas audit false positive, source-copy character encoding mismatch and ZIP-check HTML-entity parsing were corrected. Unused inherited UI components now use bundled local GSAP instead of a CDN. Broad documentation scanning still encounters an irrelevant third-party Playwright missing CONTRIBUTING.md; canonical and owned-package document checks pass. This dependency is excluded from the ZIP.

**Next action:** review the silent V002 master. Audio and the separately produced final screen composite remain outstanding. The replacement validator requires actual framing, occlusion and frame-75/overlap synchronization evidence before integration. Current timing arithmetic cannot establish synchronization inside a missing composite. No production promotion, staging, commit, publication or unrelated service change occurred. Deliverables are local; shared repository availability is not implied.

MP4 SHA-256: `01ff5648ea37803f1d5328656466112f8475e2ff97b1da62b416aad786319be9`. ZIP SHA-256: `26f5e5118a35f2ec6305f03c2b2adb9b6f17f48c548a1bd4724ef8023000fe77`.
<!-- assembly-v002:end -->

## Outro presentation V003 — review candidate delivered; registration failed

2026-10-11: the supplied plan authorizes an independent frozen-frame registration preview and a stop for user review before final production. V003 uses exact source frame 50 at 2.000 seconds ("01 Evaporation"), fixed in the original camera movement. Animated presentation playback and assembly replacement remain deferred. This supersedes only V002's proposed-next-step text below; V001/V002 and their known failures remain preserved.

[Independent V003 project](output/outro-presentation-v003-preview-project/README.md). Measurements, three manual reveal corrections, grid diagnostics, independent source marks, and preservation baseline are retained under `tests/runs/outro-presentation-v003-preview/`. The selected geometry currently misses registration targets: 40 source marks yield 2.0868 px median and 5.5797 px maximum, versus <=1 / <=2 px. A uniform inset was tried and rejected after worse residuals; it is absent from selected controls. Frames 50-68 remain especially uncertain due to offscreen corners and blur. Reflections and optical softness remain deferred because registration has not passed.

**Preview delivery:** [V003 MP4](output/y-outro-presentation-v003-preview.mp4), [separate HyperFrames preview](http://localhost:3463/#project/outro-presentation-v003-preview-project), [enlarged screen comparison](output/outro-presentation-v003-preview-project/assets/enlarged-screen-comparison.mp4), and [stationary grid](output/outro-presentation-v003-preview-project/assets/stationary-grid.mp4). The task-owned Studio service is running and returned HTTP 200. No Desktop copy was requested or created.

**Verification:** [actual results and limits](../../tests/runs/outro-presentation-v003-preview/verification/review.md). Silent 1920 × 1080, 24 fps, 145 frames, 6.041667 seconds; complete decoding passed. All 145 lossless frames and masks recompute exactly from selected coordinates/controls, the frozen source equals decoded frame 50, and outside-mask pixels are unchanged. Build/export hashes tie the rendered candidate to those inputs. Strict HyperFrames checks and 435 deterministic seeks passed. Normal-speed lightweight playback decoded all 145 with zero drops; quarter-speed playback completed with one dropped frame, failing its zero-drop check. All 95 exposed grid/still states and original-edge stabilizations were inspected; continuous subjective playback approval is not claimed. Registration remains failed at 2.0868 / 5.5797 px, and optical finishing remains off.

**Preservation:** original inputs, Scene 2, V001/V002 outro projects and prior sibling exports retain their baseline hashes. The broader 1,769-file audit detected 14 concurrently modified files in the separate assembly V002 work; those changes were preserved and not caused by this task's edits. Whole-assembly byte identity is not claimed. No application/API or assembly changes, production promotion, staging, commit or publication were performed by this task. Artifacts remain local/untracked.

**Stop for user review.** Next action: review this frozen-image candidate and enlarged comparison before deciding further registration work. No final version, added reflections/optical blur, animated playback or assembly swap has been produced.

---

<!-- assembly-v001:start -->
## Outro presentation V002 - stopped, tracking not accepted

2026-10-11: the user reports that the HyperFrames preview still expands/contracts relative to the laptop screen and distorts the inner composition. **Stop the animated V002 attempt.** The agent's earlier grid assessment was too permissive; technical checks do not establish satisfactory screen anchoring. The user suggests trying one still presentation image instead. That simpler next pass should isolate registration, retaining the photographed camera movement; a still alone cannot repair a wrong display-plane transform. No still-image revision has been built yet.

The [independent V002 project](output/outro-presentation-v002-project/README.md) and sibling `output/y-outro-presentation-v002.mp4` are retained as **unaccepted work in progress**, not delivery. No V002 Desktop copy was made. V001 and its original inputs remain retained; V001's sparse manually interpolated corners have a confirmed tracking defect, superseding its earlier visual-success claim below.

V002 work attempted: bidirectional Lucas-Kanade feature tracking with RANSAC between manual constraints; per-frame right/lower border refinement; one shared picture/alpha homography; fixed presentation aspect fit and source playback from outro time zero. The first composite was rendered with HyperFrames 0.8.146 (145 frames; screenshot capture; hardware GPU). Strict HyperFrames checks passed and the first build's lossless exterior-pixel audit passed, but **visual anchoring remains failed according to user review**. These technical passes are not acceptance.

Exact stopped state: `tracking.json`, `controls.json` and the latest diagnostic grid include a subsequent 2.5-pixel hinge correction and 1.2-pixel feather. **The project PNG sequence, Studio picture and sibling MP4 still represent the earlier composite; they have not been rebuilt from these latest controls.** Preserve this distinction on resumption. No further build or render ran after the user's stop.

Evidence is retained in `tests/runs/outro-presentation-v002/`: first-pass and refined grids, original-screen stabilizations, source edge samples, feature residuals, hinge comparisons, first-composite MP4, render/check logs and preservation baselines. The directory named `grid-accepted` is a provisional diagnostic name, **not a passed acceptance state**. Automated normal-speed grid playback decoded 145 frames without drops; an earlier quarter-speed run dropped one frame, and later playback attempts do not override the visual failure. Full final decoding/timing/preservation/delivery verification remains unfinished. An in-app-browser opening attempt failed because that browser surface was unavailable; Studio service on port 3462 was created and HTTP 200 verified.

**Next action:** agree the still-image tracking trial, using a frozen frame from the existing presentation and checking the physical screen boundary through the whole pullback before adding animation. Preserve V001/V002 and use a separate trial revision. No application/API changes, assembly replacement, production promotion, staging, commit or publishing occurred.

---

## Full commercial assembly V001 - preserved earlier delivery

2026-10-11: the supplied plan authorizes the complete silent assembly and editable ZIP with a labelled replaceable outro. The user's subsequent pacing correction explicitly selects five seconds after the complete text answer and three seconds after the image board settles. Text now uses source 0-20.8 seconds and Images 0-20 seconds. All other shots keep the supplied timing/framing; the resulting assembly is **107.24 seconds / 2681 frames at 25 fps, 1920 x 1080**. This supersedes earlier assembly stops only for this task. Other standalone work and review states below remain preserved.

[Independent assembly and replacement instructions](output/assembly-v001/README.md), [editable manifest](output/assembly-v001/assembly.json), [source provenance](output/assembly-v001/provenance.json), [Studio](http://localhost:3460/#project/assembly-v001). All Desktop inputs are retained as independent local copies. The 25 fps dashboard clips remain byte-identical assets; 24/60 fps sources use frame duplication/drop without retiming or optical flow. The original longer plan is retained inside the assembly references.

The `outro-composite` slot is 151 frames / 6.04 seconds, now at 96.28-102.32 seconds. The brand ending starts at 102.08 seconds for a six-frame linear overlap. The label reads “OUTRO PLACEHOLDER — screen composite pending.” and fades with the outgoing shot. Presentation must start at **1.36 seconds / frame 34**, continuing from the stage-4 cut at source 16.36 seconds after playback starts at source 15 seconds. Desktop `boy-final-presentation.mp4` and recorded `water-cycle-presentation-16s.mp4` were verified byte-identical.

**Known incoming-composite mismatch:** the concurrently maintained standalone outro section below currently specifies presentation time zero at its first frame. That timing is not compatible with this assembly's frame-34 offset. Its owning conversation must supply a corrected composite; this task does not change or duplicate that production. The replacement validator checks technical format and requires recorded visual evidence before a swap. All music/audio remain outstanding.

**Current state: assembly delivered, awaiting the compatible composite.** [Silent review MP4](output/assembly-v001/renders/openjm-assembly-v001-review.mp4) and [independent editable ZIP](output/openjm-assembly-v001-editable.zip) are ready. Strict HyperFrames 0.8.146 checks pass with zero errors/warnings. Metadata, full-file decode, all-frame source alignment, every join, six-frame dissolve and label containment pass. Complete normal-speed playback presents all 2681 frames with zero dropped frames and no stalls/errors; all 215 half-second samples were visually inspected. Original source hashes remain unchanged. Extracted package hashes match, all 29 runtime references are local, and ten extracted-project snapshots match the working project exactly. Replacement without recorded visual checks is rejected without mutation. [Verification and limits](output/assembly-v001/VERIFICATION.md) and [package evidence](../../tests/runs/assembly-v001-20261011/package-check.json) retain the details.

The delivered MP4 is rendered with FFmpeg from the same editable manifest. The HyperFrames browser encode was stopped after 509/2681 frames because of poor throughput and memory pressure; its alternate command remains available but is not claimed as completed. Initial font/check invocation issues were corrected. An initial RGB-intermediate export introduced a small colour shift and was replaced by the verified YUV export. A first playback under memory pressure dropped frames; the final isolated playback passes. Hardware browser previews show darker video levels than the source-aligned MP4, so use the MP4 for colour review. The broader commercial-folder documentation scan still reports unrelated existing virtual-environment license formatting and historical missing production links; scoped assembly documentation checks pass.

**Next action:** review the tighter assembly, then supply an outro composite with the required frame-34 presentation start and unchanged shot framing/timing. Follow the package replacement instructions and validate it before swapping the media and removing the label. Music/audio remain outstanding. These are local deliverables; no staging, commit, publication or production promotion occurred.
<!-- assembly-v001:end -->


## Outro presentation V001 - delivered standalone outro

2026-10-11: the supplied implementation plan authorizes this edited outro alone, its independent HyperFrames project, and an identical Desktop copy. Earlier review stops are superseded only for this screen replacement; full-commercial assembly remains outside scope.

Inputs are independent byte copies of `C:/Users/MrMonka/Desktop/commercial/y-outro.mp4` and `C:/Users/MrMonka/Desktop/commercial/screen-recordings/boy-final-presentation.mp4`. Their verified formats are respectively 145 frames / 24 fps / 6.041667 seconds and 400 frames / 25 fps / 16 seconds, both 1920 x 1080 and silent. [Input baseline](../../tests/runs/outro-presentation-v001/input-hashes-before.json) retains original and copied SHA-256 hashes.

The [independent project](output/outro-presentation-v001-project/README.md) owns both videos, fresh manual corner anchors, all-frame geometry, exact source timestamps, screen/foreground masks, optical controls, local GSAP, rebuilding/check scripts and 145 lossless composites. Presentation time equals outro frame / 24 from frame zero, including the concealed opening. No restart occurs at first visibility (subpixel edge coverage at frame 50, 2.083333 seconds; recognizable picture at frame 51, 2.125 seconds). Output frame 144 samples presentation frame 150 at 6.000 seconds. The full source image fits a nominal 16:10 display plane with minimal top/bottom letterboxing. The physical camera angle and distance limit readability.

Implementation adapts only the previous local perspective-warp/lossless-sequence approach. It uses new measured geometry and manually interpolated corners, no prior shot coordinates or color key. Screen gain increases naturally with viewing angle, optical defocus follows the shot, and strongly filtered broad plate reflections remain. The original boy, bird, room and camera are preserved outside the matte. Frame inspection found and corrected hinge-boundary undercoverage and old-interface contamination in the initial reflection blend; earlier diagnostic sheets are retained. The build now streams two presentation frames at a time to reduce memory use.

**Current state: complete.** [Edited outro MP4](output/y-outro-presentation-v001.mp4) is delivered beside the project, with an identical copy at `C:/Users/MrMonka/Desktop/commercial/y-outro-presentation-v001.mp4`. [Delivery hashes](../../tests/runs/outro-presentation-v001/accepted/delivery-copies.json) prove the two copies identical. The next action is user playback review; no application/API changes, full-commercial assembly, production promotion, commit or publishing occurred. Earlier sources and deliverables remain retained.

Verification:

- [Final metadata](../../tests/runs/outro-presentation-v001/accepted/metadata.json) and [full decode](../../tests/runs/outro-presentation-v001/accepted/full-decode.log): silent H.264, 1920 x 1080, 24/1 fps, 145 frames, 6.041667 seconds; full-file decode exit 0. [Render log](../../tests/runs/outro-presentation-v001/accepted/render.log): HyperFrames 0.8.146, screenshot capture, hardware GPU, one worker, 71.6 seconds. Only this new project's pin changed from 0.8.145 to 0.8.146; [final strict validation](../../tests/runs/outro-presentation-v001/accepted/hyperframes-check.json) has zero errors/warnings.
- [435 exact seeks](../../tests/runs/outro-presentation-v001/accepted/seek.json): all 145 frames match their PNGs forward, backward and in shuffled order. [Complete rate-1 playback](../../tests/runs/outro-presentation-v001/accepted/playback.json): 6.0526 seconds elapsed, all 145 decoded frames, zero dropped frames, no waiting/stalled/error events. Sampled encoded frames were visually inspected in the [playback contact sheet](../../tests/runs/outro-presentation-v001/accepted/encoded-playback-contact.jpg).
- [Lossless pixel audit](../../tests/runs/outro-presentation-v001/accepted/pixel-audit.json) and [independent delivery audit](../../tests/runs/outro-presentation-v001/accepted/delivery-audit.json): zero changed pixels outside replacement coverage in all 145 decoded 8-bit plate frames; complementary foreground masks pass. This exact equality applies before lossy H.264 encoding. All 145 decoded output images are unique. The timing manifest advances continuously from presentation time zero through 6.000 seconds without an offset, restart or speed change.
- Encoded-image matching initially mistook nearly stationary opening frames because browser RGB-to-YUV conversion shifts colors. A fixed first-frame color calibration plus full-resolution comparison resolves 144/145 nearest matches; concealed frame 7 remains codec-ambiguous with adjacent frame 6 (less than 1% score difference). This diagnostic does not replace the exact 435 source-frame seek checks. Initial failed diagnostics and the calibration are retained. No encoded freeze or playback error was found.
- [Original and copied input hashes](../../tests/runs/outro-presentation-v001/accepted/input-hashes-after.json) match the pre-change baseline. [Visual review scope](../../tests/runs/outro-presentation-v001/accepted/visual-review.md) records inspection of all 145 composited states and every exposed screen region, including the early edge and final distant display. Human subjective playback approval is not claimed. Sources/project/export remain local and untracked; shared availability is not implied.

[Editable Studio preview](http://localhost:3453/#project/outro-presentation-v001-project) remains available while this task-owned service runs. Revisions should preserve V001 and use a new output version.


## Music V005 and Video V006 - current delivery and review stop

2026-10-11: **Music, Video with fullscreen playback, and the complete standalone presentation are delivered and technically verified. Stop for user review.** The supplied implementation plan explicitly continues from approved V004. It authorizes these stages and supersedes the earlier song/presentation stop and two-second replay-hold requirement. The new Video ends exactly when its 16-second presentation ends, with no replay screen, hold or outro. Actor footage and final commercial assembly remain outside this implementation.

| Review artifact | MP4 | Independent editable ZIP | Project and preview |
| --- | --- | --- | --- |
| Music V005, 24 s / 600 frames | [Music MP4](../openjm-homework-immersive/stages/v005/output/stage-3-music-v005.mp4) | [Music ZIP](../openjm-homework-immersive/stages/v005/output/openjm-music-v005-editable.zip) | [Instructions](../openjm-homework-immersive/stages/v005/music-project/README.md) - [Studio 3450](http://localhost:3450/#project/music-project) |
| Video V006, 31 s / 775 frames | [Video MP4](../openjm-homework-immersive/stages/v006/output/stage-4-video-fullscreen-v006.mp4) | [Video ZIP](../openjm-homework-immersive/stages/v006/output/openjm-video-fullscreen-v006-editable.zip) | [Instructions](../openjm-homework-immersive/stages/v006/video-project/README.md) - [Studio 3451](http://localhost:3451/#project/video-project) |
| Water-cycle presentation, 16 s / 400 frames | [Presentation MP4](../openjm-homework-immersive/stages/v006/output/water-cycle-presentation-16s.mp4) | [Presentation ZIP](../openjm-homework-immersive/stages/v006/output/water-cycle-presentation-16s-editable.zip) | [Instructions](../openjm-homework-immersive/stages/v006/presentation/README.md) - [Studio 3452](http://localhost:3452/#project/presentation) |

All three are silent H.264, 1920 x 1080, 25 fps, with no audio stream. [Delivery hashes](../../tests/runs/homework-music-video-implementation/delivery.json) and [archive/source hashes](../../tests/runs/homework-music-video-implementation/packages.json) identify the handoff. These are local/untracked files; collaborator access is not implied. The other agent's completed text/image cursor revisions sharing V005/V006 are independently preserved in `openjm-text-v005` and `openjm-images-v006`; the named Music/Video folders avoid collisions.

### Interaction, continuity and editable owners

Each dashboard project owns `content.json`, `timing.json`, `interactions.json`, `cursor.js` and its `music-scene.js` or `video-scene.js`. Native bounds are calibrated into one dashboard coordinate system before timeline playback. Cursor movement, arrow/hand/text shape, native hover/focus, 120 ms press feedback, release-triggered UI state, typing, caret and scrolling derive from composition time. There are no click rings. The pointer parks outside reading content and remains visible through the dashboard shots; in Video it fades only after fullscreen expansion completes at 16 s. Camera scale remains uniformly 0.875 with translation (110, 67) until the single playing presentation expands.

Music focuses the composer at 1.8 s and types the preserved request from 2-5 s. It selects Music, My lyrics, focuses and deliberately pastes the exact six preserved lyric lines, selects the previous duration value and types 16, then confirms at 9.4 s. Send releases at 10 s. Native acceptance, composer availability, chip removal, animated Music placeholder and Working morph continue to completion at 14 s. The result follows native scrolling and settles before the reading hold. Play releases at 20 s, progress advances for three seconds, and Pause releases at 23 s. The local 16-second FLAC is digital silence; **no audible song was synthesized**. The Playing morph uses the retained native renderer with a silent spectrum, without invented audio-reactive beats. Music placeholder motion is sampled from retained native CSS/TSX source.

Video begins with the same completed image and paused music result. It focuses the composer, types the preserved request from 2-6 s, selects staged landscape 16:9 / 16 seconds / silent settings, and confirms at 8.64 s. Send releases at 9.12 s. Controlled pending UI and Working morph continue until the player and exact preserved ready response appear at 13 s. Play releases at 15 s; Fullscreen releases at 15.72 s and expansion finishes at 16 s. One surface advances through frames 0-399 from 15-31 s without replacing, restarting, skipping or freezing the presentation.

`presentation.js` and `presentation.css` are shared byte-for-byte by the player and standalone project. V004's four independently copied illustrations remain unchanged. Editable labels and separate SVG process layers show evaporation at frames 0-99 (sun warmth/upward direction, no visible vapour), condensation at 100-199 (fine droplets gathering), precipitation at 200-299 (rain toward the catchment), and collection at 300-399 (river into lake and a visual return to evaporation). Labels remain at least 34.927 displayed pixels in the player, exceeding the requested 24. Focal results and composer retain at least 64 pixels of output clearance; the composer minimum is 82 pixels. Older conversation content is intentionally clipped by its scroll region.

### Provenance, verification and corrections

- [Fresh guarded Music audit](../../tests/runs/homework-music-video-implementation/references/audit.json): genuine authentication/bootstrap; native settings, submission, pending, completion, Play/Pause and history restoration; zero unexpected reads or forwarded application writes. One conversation, board and music identity are restored, with chronological timestamps. The silent native fixture reported exactly 16 seconds. [27 native source copies](../../tests/runs/homework-music-video-implementation/native-source-audit.json) match the sibling frontend. Its `VIDEO_GENERATION_AVAILABLE = false` remains unchanged. Enabled Video settings, generation and player are explicitly controlled commercial staging, not a public feature, integration test or generation-speed claim. No application/public API edits occurred.
- [Music verification](../../tests/runs/homework-music-video-implementation/verification-v005.json) and [Video verification](../../tests/runs/homework-music-video-implementation/verification-v006.json): all 600/775 output frames, measured cursor targets, native hover/press feedback, release ordering, field edits, scrolling, safe margins and clipping; 270/249 forward, reverse and repeated seeks including click boundaries and particle state. Native Music dialog, placeholder and completed Play control match reference dimensions and font size exactly. Every presentation frame maps once to 0-399.
- Strict HyperFrames 0.8.145 checks pass with zero lint/runtime/layout/motion errors or warnings: [Music](../../tests/runs/homework-music-video-implementation/check-music-corrected.log), [final duration selection](../../tests/runs/homework-music-video-implementation/check-music-selection.log), [Video](../../tests/runs/homework-music-video-implementation/check-video-final.log), and [presentation](../../tests/runs/homework-music-video-implementation/check-3.log). Native dashboard secondary-text contrast is preserved and excluded from the full sweep; standalone contrast passes. Informational overlaps during modal/native scroll/fullscreen transitions remain recorded.
- [Independent extraction checks](../../tests/runs/homework-music-video-implementation/package-check.json): all archive entries match source/extracted hashes; 52/44/16 package seek checks load without external requests or runtime errors. All 400 presentation DOM states match exactly between player and standalone. Both dashboard MP4s were rendered from the extracted packages. After expansion/cursor fade, [366 aligned encoded frames](../../tests/runs/homework-music-video-implementation/encoded-presentation-comparison.json) compare at average SSIM 0.999228, minimum 0.996509, allowing ordinary H.264 differences.
- Metadata and full decode pass for all three exports. Complete normal-speed playback reports zero dropped frames and no waiting/stalled/error events: [Music](../../tests/runs/homework-music-video-implementation/music-playback.json), [Video](../../tests/runs/homework-music-video-implementation/video-playback.json), [presentation](../../tests/runs/homework-music-video-implementation/presentation-playback.json). Agent visual inspection covers all 284 quarter-second playback samples plus full-resolution encoded selection, playback, fullscreen press and ending frames. Technical verification and sampled visual review do not establish subjective user approval.
- Corrections retained in evidence include duplicate native restoration requests, reverse-seek placeholder initialization, hidden presentation reset, unused captured CSS/media, Video chip identity/encoding, composer-notice clipping and exact duration text selection. Early renders remain diagnostic drafts. Concurrent edits to generic stage folders were recovered into the named projects; the other agent's text/image handoff was preserved. [V002-V004 preservation](../../tests/runs/homework-music-video-implementation/preservation-after.json) passes all 421 inventoried durable files. [Parallel handoff preservation](../../tests/runs/homework-music-video-implementation/parallel-handoff-preservation.json) passes its MP4s, ZIPs and 260 packaged source files. User-managed services and unrelated changes remain untouched; no commit, push, publishing or production promotion occurred.

[Final handoff audit](../../tests/runs/homework-music-video-implementation/final-handoff-audit.json) passes 155/157/11 source and extracted package files, all current delivery links and preview ports 3450-3452. The canonical documentation checker and `git diff --check` pass.

**Exact next action:** review the three MP4s above. Requested corrections should use independent new revisions. Music ends paused at 0:03 of 0:16 with an available composer; Video ends on presentation frame 399 at 31 s. Do not assemble actor footage or the rest of the commercial at this stop. Earlier sections below preserve historical decisions and evidence; their old pending-stage statements and replay-hold requirement are superseded by this delivery.

## Preserved text/image cursor revisions V005 / V006

The following handoff belongs to the separately completed text/image task. Its scope/stop statements describe that task at delivery; the Music/Video section above owns the current continuation.


**Both cursor revisions are rendered and technically verified. Stop before later commercial stages.** The supplied implementation plan authorizes these independent text/image revisions and exports. It supersedes the earlier review stops only for this cursor/timing scope; subjective approval of the films remains with the user. Copy, artwork, UI layout and camera poses remain preserved. No application/public API changes, song, later presentation, assembly, production promotion or publishing occurred.

| Stage | Current review | Independent editable package | Preview |
| --- | --- | --- | --- |
| Text V005, 26 s / 650 frames | [MP4](../openjm-homework-immersive/stages/v005/output/stage-1-text-v005.mp4) | [ZIP](../openjm-homework-immersive/stages/v005/output/openjm-text-v005-editable.zip) · [instructions](../openjm-homework-immersive/stages/v005/openjm-text-v005/README.md) | [Studio](http://localhost:3440/#project/openjm-text-v005) |
| Images V006, 27 s / 675 frames | [MP4](../openjm-homework-immersive/stages/v006/output/stage-2-images-v006.mp4) | [ZIP](../openjm-homework-immersive/stages/v006/output/openjm-images-v006-editable.zip) · [instructions](../openjm-homework-immersive/stages/v006/openjm-images-v006/README.md) | [Studio](http://localhost:3441/#project/openjm-images-v006) |

Both exports are silent H.264, 1920×1080, 25/1 fps. [Delivery hashes](../../tests/runs/homework-cursor-v005-v006/delivery.json) and [archive/source hashes](../../tests/runs/homework-cursor-v005-v006/packages.json) identify the exact handoff. These are local/untracked deliverables; shared availability is not claimed.

### Interaction and timing owners

Each project contains an editable `interactions.json`, `interactions.js` and `interactions.css`: target controls, output-space resting points, movement, hover, press/release and visibility. The 28-output-pixel white pointer and restrained click pulse live above the interface outside conversation clipping. Actual control geometry is measured after layout/camera transforms and queried again after composer replacement. Pre-release anchor calibration makes the cursor independent of seek history. Native hover/focus/pressed declarations are driven by timeline attributes; controls without a separate native active style retain their native hover appearance during the click pulse. UI responses use schedule release times and the same deterministic frame clock as preview/export.

- **Text:** composer release/focus 3.00 s; existing typing 3.08–5.8 s; completed-prompt pause and deliberate approach; Send release 7.8 s. Processing, answer reveal, full-answer hold and closing path move one second later, retaining their durations and ending. Response starts 9.8 s; full answer 15.8 s; closing movement 18–25.5 s; settle to 26 s. The previous welcome fade anticipated submission; its same-duration fade now begins on release. Native Send is enabled when the typed prompt is present. Pointer fades out by 9.05 s.
- **Images:** focus 2.36 s, typing 2.4–5.4 s, actions release 6 s, Image 7 s, Wallpaper & video 16:9 8.6 s, Done 10 s, Send 11 s. Acceptance/background work 11–15 s; reveal/native scrolling 15–17 s; preserved artwork/camera hold 17–25 s; preserved ending 25–27 s. Pointer fades out by 12.4 s. Result arrival and automatic scrolling remain system responses.

### Verification and corrections

- [Text verification](../../tests/runs/homework-cursor-v005-v006/v005-verification.json) and [image verification](../../tests/runs/homework-cursor-v005-v006/v006-verification.json) pass every output frame plus the end boundary, all eight targets, enabled-control/hover/press/focus state, release-before-response ordering, output-size/pulse containment and cursor departure. They cover 30/52 unique seek positions in forward, reverse and reordered passes, compare shared timeline/direct rendering, and preserve 406/401 original post-response/post-submit states after the specified time offsets. Float comparisons use 1e-8 precision for camera arithmetic. Particle canvas and placeholder state are included in seek equality.
- [Text HyperFrames check](../../tests/runs/homework-cursor-v005-v006/v005-check-final.json) and [image check](../../tests/runs/homework-cursor-v005-v006/v006-check-final.json): zero lint/runtime/layout/motion errors or warnings, 11/18 timestamps and 300 motion samples each. Inherited secondary-text contrast remains outside the full layout sweep, as in the original revisions.
- [Text package check](../../tests/runs/homework-cursor-v005-v006/v005-package-check.json) and [image package check](../../tests/runs/homework-cursor-v005-v006/v006-package-check.json): 107/153 archive files match independently extracted copies; all interaction states load with local assets and no external runtime requests. **Both complete final MP4s were rendered from these extracted packages**, using HyperFrames 0.8.145, hardware GPU, screenshot capture and four workers. Tool/browser installation remains an external prerequisite.
- [Text metadata](../../tests/runs/homework-cursor-v005-v006/v005-metadata.json), [image metadata](../../tests/runs/homework-cursor-v005-v006/v006-metadata.json), [text decode](../../tests/runs/homework-cursor-v005-v006/v005-full-decode.log) and [image decode](../../tests/runs/homework-cursor-v005-v006/v006-full-decode.log) verify exact resolution, fps, frame counts, durations, no audio streams and complete decode.
- [Text complete playback](../../tests/runs/homework-cursor-v005-v006/v005-playback.json) and [image complete playback](../../tests/runs/homework-cursor-v005-v006/v006-playback.json): normal speed, all 650/675 frames, zero dropped frames and no waiting/stalled/error events. Agent visual inspection covers all 82 source seek stills, all 212 quarter-second playback samples, and full-resolution encoded click/ending frames. This is technical and sampled visual review, not the user's subjective approval.
- Initial generic `project` folders were unexpectedly overwritten with V004 source during CLI validation. Those check results were discarded; snapshots are retained under this run's `overwritten-v005-project/` and `overwritten-v006-project/`. Recovery used independently copied, uniquely named project folders, after which source hashes remained stable through checks, previews, packaging and rendering. The exact external overwrite mechanism was not established. An initial cursor-speed check prompted a slower text departure; a float-only comparison failure was corrected to the stated precision. These corrections precede the final verification and packages.
- [Preservation audit](../../tests/runs/homework-cursor-v005-v006/preservation-after.json): all 1,280 inventoried earlier V003/V004 source, MP4, ZIP and evidence files are unchanged; runtime caches were excluded. Current package sources still match their archives. Existing user-managed services and unrelated changes remain untouched. No staging, commit or push occurred.

**Exact next action:** review the two revised MP4s. Any correction should create another independent revision. The text stage ends at 26 s in V003's original final UI/camera state; the image stage ends at 27 s in V004's original completed-board state (scale 0.88, translation 109/67, scrollTop 574, available empty composer, Standby morph). Later song/presentation/player/final assembly work remains unimplemented; the retained 400-frame presentation plus 50-frame replay-hold specification still governs that later scope when authorized.

[Final handoff audit](../../tests/runs/homework-cursor-v005-v006/final-audit.json) verifies current review/package links and both preview services. Canonical documentation and `git diff --check` pass. The broader optional commercial-folder scan reports pre-existing NumPy license formatting in `local/venv` and three missing historical production links already present in the before-record; these unrelated files and historical references were preserved.

## Preserved V004 image-stage review

The following is the original V004 handoff history. Its review links and evidence remain valid for that preserved revision; V005/V006 above own the current cursor review and stop.

2026-10-10: **Stage 2 image review V004 is ready for the user's review. Stop here.** The user explicitly authorized implementation of the four-step image-stage plan, using V003's exact conversation with fresh framing after an intervening shot. That authorization supersedes the previous Stage 1 execution stop; it does not establish subjective approval of V003. V002, V003 and earlier assets/deliverables remain preserved. The later 16-second presentation has reusable artwork and a specification only. No song, presentation sequence, final assembly, public API or application change was implemented. Nothing was published or promoted to production.

### V004 delivery and editable owners

- [24-second image-stage MP4](../openjm-homework-immersive/stages/v004/output/stage-2-images-v004.mp4): silent H.264, 1920×1080, 25 fps, exactly 600 frames. SHA-256: `b78e8dc06a8cd5343a9c51d522a5e7d839ef68a2aff563594c8aadbe76e8b288`.
- [Independently verified editable ZIP](../openjm-homework-immersive/stages/v004/output/openjm-images-v004-editable.zip): 149 files, SHA-256 `b82a8d9230eaf90e1cbf69ae0221fdd4a6b61156864c6441cc787138633d3db4`. Includes the native UI, local fonts/icons/background, deterministic morph and placeholder, four independent illustrations, editable SVG/JSON board, rendered board, source provenance, exact generation prompts and later presentation specification. [Package checks](../../tests/runs/homework-images-v004/package-check.json), [delivery hashes](../../tests/runs/homework-images-v004/delivery.json).
- [Reproduction instructions](../openjm-homework-immersive/stages/v004/project/README.md), [content](../openjm-homework-immersive/stages/v004/project/content.json), [timing/camera](../openjm-homework-immersive/stages/v004/project/timing.json), [scene](../openjm-homework-immersive/stages/v004/project/scene.js), [native UI](../openjm-homework-immersive/stages/v004/project/native-ui.json), and [guarded fixture](../openjm-homework-immersive/stages/v004/source/scenario.cjs) are the editable owners. Preview: `http://localhost:3430/#project/project`. Earlier previews and user-managed services were left running.

### V004 sequence and native continuity

| Time | Behavior |
| --- | --- |
| 0–2 s | Establish the existing V003 conversation, first/selected Water-cycle presentation history, docked composer and animated morph; no dashboard entrance replay |
| 2–5 s | Type “Make pictures of the water cycle for my presentation.” |
| 5–8 s | Open native actions; select Image at 5.5 s; select Wallpaper & video 16:9 at 6.6 s; confirm at 7.6 s |
| 8–12 s | Native acceptance and seeded sorting placeholder; Working morph; composer remains available during background generation |
| 12–14 s | Reveal the one board, follow native scrolling and transition the morph back to Standby |
| 14–22 s | Hold the complete board inside its native card, with a restrained uniform camera move; composer and morph remain visible |
| 22–24 s | Settle for the next editorial cut |

The captured native Image flow leaves the composer available, removes the submitted Image chip and returns to Standby on completion. One conversation and one board identity (`immersive-water-cycle-board`) survive native history restoration without duplicate cards. Chronological fixture timestamps start at `2026-10-10T16:00:00.000Z`, retain V003's exact research response at `.500Z`, and advance to the image request at `16:00:33.000Z` and completion update at `16:00:37.000Z`. Later requests, lyrics and final response remain unchanged in `content.json`.

All framing uses one 1920×1080 dashboard coordinate system. Opening camera is scale 0.875, translation (110, 67); reading scale reaches 0.886, translation (106, 66); ending is scale 0.88, translation (109, 67), scrollTop 574. The result is never detached from its card. Hold labels measure at least 31.795 displayed pixels. The focal result and composer maintain at least 64 pixels of output clearance. Native scrolling intentionally masks older content, and the native particle renderer retains its own viewport clipping; neither is represented as globally unclipped UI.

The frozen morph reference is replaced with an independent adaptation of the actual native particle renderer, presets and transition logic, precomputed at fixed 120 Hz and sampled from composition time. [Native source hashes](../openjm-homework-immersive/stages/v004/project/native-provenance.json) cover 21 retained source files. Placeholder sorting uses native algorithms/timing with seeded ordering and time-derived positions. Neither motion depends on wall-clock playback or a network result.

### Artwork and prepared later presentation

The [editable board](../openjm-homework-immersive/stages/v004/project/artwork/board.svg), [assignments](../openjm-homework-immersive/stages/v004/project/artwork/board.json) and [rendered 1920×1080 result](../openjm-homework-immersive/stages/v004/project/artwork/board.png) use reading order Evaporation, Condensation, Precipitation, Collection. Each illustration is independently retained without lettering; labels and restrained arrows are separate editable SVG elements. Copies also reside in `workspace/openjm-homework-immersive/assets/stage-2-v004/`.

Evaporation reuses the original landscape and Precipitation the original cloud/rain illustration byte-for-byte. Built-in image generation created matching Condensation and Collection from both retained references. The first condensation candidate had oversized droplets that read as rain and was rejected; its correction uses fine suspended droplets along the cloud edge, with clear air below. Collection shows continuous river flow into the lake. All four were inspected together for landscape/material/lighting/palette continuity and the intended process. [Exact prompts and correction](../openjm-homework-immersive/stages/v004/project/artwork/prompts.json), [artwork provenance](../openjm-homework-immersive/stages/v004/project/artwork/README.md). The original evaporation landscape's distant rain is retained; its upward teaching arrow is a graphic, not visible vapour. The science premise was checked against [USGS](https://water.usgs.gov/edu/watercycle-kids-beg.html).

The [later presentation brief](../openjm-homework-immersive/stages/v004/project/PRESENTATION.md) and [editable specification](../openjm-homework-immersive/stages/v004/project/presentation-spec.json) assign four consecutive 100-frame/four-second sections: evaporation 0–99, condensation 100–199, precipitation 200–299, collection 300–399. Reuse these exact illustrations with editable labels and process animation; finish by connecting collection back to evaporation. The surrounding shot must show all **16 seconds / 400 frames** of uninterrupted in-player playback plus a **two-second / 50-frame completed/replay hold**, minimum **18 seconds / 450 frames**, before additional setup or transitions. The earlier five-second evaporation clip remains preserved but no longer defines the presentation. Recalculate the eventual film duration rather than forcing the previous approximately 72-second total. Silence remains the default.

### V004 verification and limits

- [Fresh native audit](../../tests/runs/homework-images-v004/references/audit.json): genuine auth gate/bootstrap succeeded; Image settings, submission, pending, completed and restored states were captured using guarded prepared data. Zero unexpected reads or forwarded application writes; one restored board. This is controlled illustrative commercial staging, not evidence of live generation, integration or performance.
- [Native geometry and deterministic seeking](../../tests/runs/homework-images-v004/verification.json): 23 native element comparisons pass; all 600 output-frame states plus the end boundary pass selected-history, card identity, composer control containment, label size and clipping checks. 57 positions tested forward, reverse and reordered give 171 painted seeks. Particle pixels, placeholder styles and frame state are exact. Screenshot tolerance allows ordinary antialiasing up to 4/255 under 1% of pixels, plus at most 64 native rounded-corner pixels up to 13/255; the initial raster failure is retained and the narrow Chromium raster-cache exception is explicit.
- [Strict HyperFrames check](../../tests/runs/homework-images-v004/check-final-composer.json): zero errors/warnings across 17 requested timestamps and 300 motion samples. Targeted annotations address false opaque-canvas occlusion and native modal/notice/clamped-preview overlap. Inherited native secondary-text contrast is not covered by this full layout sweep. Board lettering was inspected at actual output size.
- [Scenario tests](../../tests/runs/homework-images-v004/scenario-tests.txt): 2/2 pass, including V003 content preservation, chronological timestamps, one board identity and blocked duplicate/unknown operations. [Extracted ZIP checks](../../tests/runs/homework-images-v004/package-check.json): nine states load with local assets, no external requests/runtime errors, four editable labels and the 400/450-frame specification. Every archive entry matches its source and independently extracted copy byte-for-byte.
- [Metadata](../../tests/runs/homework-images-v004/metadata.json), [full decode](../../tests/runs/homework-images-v004/full-decode.log) and [final render](../../tests/runs/homework-images-v004/render-final.log): exactly 600 frames, 24 seconds, 25/1 fps, 1920×1080, no audio; complete decode passed. HyperFrames 0.8.145 used screenshot capture, hardware GPU and four workers.
- [Complete normal-speed playback](../../tests/runs/homework-images-v004/playback.json): 24.045 seconds elapsed, all 600 frames, zero dropped frames and no waiting/stalled/error events. Agent visual inspection covered 57 source seek stills, all 96 samples from final continuous playback and the [full-resolution encoded ending](../../tests/runs/homework-images-v004/encoded-final-v004.png). Technical playback verification does not establish the user's subjective approval.
- Encoded inspection exposed a brief composer expansion defect: the shell interpolated before its internal rows. Grid rows, padding and control offset now follow the native resize transition; all-frame control containment and the complete export/playback/package checks were rerun. The initial MP4/ZIP remain under this run's `initial-composer-*` names as retained diagnostic drafts.
- [Preservation](../../tests/runs/homework-images-v004/preservation-after.json): all 269 inventoried earlier durable files are unchanged, including V002/V003 source and exports, original artwork, scenario and earlier presentation. Runtime caches were excluded before inventory. No sibling application or public API edits, user-service shutdown, staging, commit, push or production promotion occurred. Unrelated existing changes remain untouched. Deliverables are local/untracked; shared availability is not claimed.
- [Final handoff audit](../../tests/runs/homework-images-v004/final-audit.json) confirms all 30 current handoff links, delivery hashes, preserved files and 21 native source copies/originals. Canonical documentation and `git diff --check` passed. HyperFrames `history end` reported that the task-owned preview process held its history lock; the preview was left available for review. This does not affect the independently verified archive or export.

**Exact resume point:** review the V004 MP4. If corrections are requested, preserve these delivered files and create an independent revision. Stage 2 ends at local frame 600/time 24 s, camera scale 0.88, translation (109, 67), scrollTop 574, one completed board, empty available composer and Standby morph. The next authorized stage should start from this conversation after the editorial cut and use the prepared 400-frame presentation plus 50-frame replay hold. Do not implement the song, presentation/player or final assembly until separately authorized.

## Preserved V003 text-stage review

V003's original review and evidence remain below. Its former Stage 1 stop and instruction to continue without a camera reset have been superseded by the explicit V004 plan above; the supplied plan requires fresh framing after an intervening shot. This preserves earlier work without treating review delivery as approval.

### V003 delivery and editable owners

- [V003 review MP4](../openjm-homework-immersive/stages/v003/output/stage-1-text-v003.mp4): English, silent H.264, 1920×1080, 25 fps, 625 frames, exactly 25 seconds. SHA-256: `5075fd55e083b03191c9e71b5c474aca0635478f8194682218a2e108e017cbc0`.
- [Editable V003 ZIP](../openjm-homework-immersive/stages/v003/output/openjm-text-v003-editable.zip), [reproduction instructions](../openjm-homework-immersive/stages/v003/project/README.md), [editable content](../openjm-homework-immersive/stages/v003/project/content.json), and [deterministic timeline](../openjm-homework-immersive/stages/v003/project/scene.js). All 103 packaged files match the project. An independent extracted copy loads without application access or remote asset requests. [Package evidence](../../tests/runs/homework-directed-v003/package-check.json), [delivery hashes](../../tests/runs/homework-directed-v003/delivery.json).
- Editable preview: `http://localhost:3420/#project/project`; returned HTTP 200 and remains running for review. The earlier V002 preview was left running.
- `content.json` owns the revised research answer; `npm run build` now compiles its native paragraph/bold/link markup and synchronizes `scene.js` into `index.html`. The staged fixture reads that same research field. The research request and USGS URL, all later requests, lyrics, final response, image assets and five-second presentation remain preserved. Public APIs and the sibling application were not edited.

### Direction and timing

The supplied answer begins “Of course!”, explains the four stages in the exact requested wording, and closes “You can remember it as: up, clouds, down, and around!” before the source link. Its 89 displayed words include the five source-label words. Word count is derived from the actual rendered text, replacing V002's hard-coded 47-word limit. The [USGS source](https://water.usgs.gov/edu/watercycle-kids-beg.html) was rechecked on 2026-10-10 and supports the science in the supplied copy.

| Time | Current behavior |
| --- | --- |
| 0–8.8 s | Preserved opening, typing, submission and arrival camera state; all first 220 frame states agree with V002 apart from the separate answer reveal count |
| 8.8–14.8 s | Progressive answer and source reveal in fixed native line boxes |
| 14.8–17 s | Complete answer reading pause, scale 1.60 |
| 17–24.5 s | Gentle quintic-eased zoom out to 1.48 in the same dashboard coordinate system |
| 24.5–25 s | Half-second settle; final text measures 26.9952 displayed pixels |

The native 1920×1080 dashboard fills the film. The answer remains inside its native card with unchanged font, colors and wrapping; collection naturally occupies two lines. No conversation scrolling is needed. Uniform scale and a fixed dashboard focal point (1180, 430) keep the source comfortably visible. English, silence and the wider approximately 72-second film direction remain settled; later global timings must be reconciled from the new 25-second ending when those stages are approved.

This remains illustrative film-only staging with prepared responses, not proof of live generation, integration or performance. The retained native icons/background/fonts and frozen particle-form reference are independently local. History uses uniform ISO timestamps, new conversation creation `2026-10-10T16:00:00.000Z` later than all retained entries, advancing updates, and first/selected `immersive-water-cycle`. The native private-chat processing capsule remains 320 pixels. Ordinary Folk's [Gemini project](https://www.ordinaryfolk.co/project/gemini) and [process](https://www.ordinaryfolk.co/process) remain the selected framing references; this scoped revision did not reassess those films or introduce a new visual direction.

### Verification and limits

- [Fresh native audit](../../tests/runs/homework-directed-v003/references/audit.json): real auth gate and dashboard bootstrap HTTP 200; guarded fixtures, no unexpected reads, no API writes, no detected identity contamination. User-managed application services were reused and left running.
- [Native comparison and seeking](../../tests/runs/homework-directed-v003/scene-verification.json): all seven paragraphs match native copy/font/color and geometry within 0.1 pixel. 625 output-frame states retain stage coverage and first/selected history. 138 painted seeks cover 46 positions forward, backward and repeated, including exact ending and fractional settle boundary. Chromium antialiasing tolerance remains at most 4/255 per channel across less than 1% of pixels; observed maximum affected 529 pixels (0.026%). This is not byte-identical screenshot equality.
- [Revision checks](../../tests/runs/homework-directed-v003/revision-checks.json): all 626 states including the end boundary pass; first 220 states preserved; monotonic word reveal and closing scale; settled tail; visible words clear every clipping ancestor and output boundary. Minimum visible-word output clearance is 83.66 pixels. Final font size is 26.9952 pixels. [Scenario checks](../../tests/runs/homework-directed-v003/scenario-tests.txt): 2/2 passed, preserving later copy, chronological history and blocked unknown operations.
- [Strict HyperFrames layout/runtime/motion check](../../tests/runs/homework-directed-v003/check-final.json): zero errors/warnings over all 11 requested timestamps and 300 motion samples. [Reading/closing contrast](../../tests/runs/homework-directed-v003/check-reading-contrast.json): 380/380 actual DOM text checks pass at 14.8, 17, 20.75 and 24.96 seconds. Inherited native secondary-label contrast deficiencies in the opening remain outside this claim; the full layout sweep excludes contrast.
- [Metadata](../../tests/runs/homework-directed-v003/metadata.json), [full decode](../../tests/runs/homework-directed-v003/full-decode.log) and [render log](../../tests/runs/homework-directed-v003/render.log): 625 frames, 25 seconds, 25/1 fps, 1920×1080, video only; complete decode passed. HyperFrames 0.8.145 (verified current) used screenshot capture, hardware GPU and four workers.
- [Complete rate-1 playback](../../tests/runs/homework-directed-v003/playback.json): 25.010 seconds elapsed, all 625 frames, zero dropped frames, no waiting/stalled/error events. Agent visual review covered all 46 source boundary/transition stills, all 100 samples collected during complete normal-speed playback, and the [full-resolution encoded final frame](../../tests/runs/homework-directed-v003/encoded-final.png). Human subjective playback approval remains pending.
- PowerShell initially passed only the first timestamp to direct CLI checks; those single-sample diagnostics are retained and were superseded by quoted lists with verified sample counts. Package scripts now quote the lists. The copied scenario test initially rejected the deliberately changed answer; its preservation scope was corrected to the unchanged requests/lyrics/final response. Static `keyframes --shot` still cannot resolve this runtime-driven camera; actual painted seeks and complete playback supply motion evidence.
- [Preservation](../../tests/runs/homework-directed-v003/preservation-after.json): all 159 inventoried non-cache earlier files are byte-identical, including V002 sources, MP4/ZIP, original scenario, artwork and presentation. Initial broad comparison detected only the active V002 preview's generated cache changing; that runtime cache is explicitly excluded from source/deliverable preservation. No user-managed process was stopped. Existing unrelated deletions/untracked changes remain untouched. Deliverables remain local/untracked; no commit, push or shared availability is claimed.

**Historical V003 ending:** global frame 625 (25 s), camera scale 1.48, translation (-786.4, -96.4), scrollTop 0, full research answer/source visible, composer docked and `immersive-water-cycle` first/selected. The original pending review and continuation instructions are preserved in the [pre-V004 record](../../tests/runs/homework-images-v004/commercial-record-before.md); the operative resume point is now V004 above.

### Preserved V002 review

[V002 MP4](../openjm-homework-immersive/stages/v002/output/stage-1-text-v002.mp4), [editable ZIP](../openjm-homework-immersive/stages/v002/output/openjm-text-v002-editable.zip), [project instructions](../openjm-homework-immersive/stages/v002/project/README.md) and [verification](../../tests/runs/homework-directed-v002/scene-verification.json) remain retained. Its 23-second, 575-frame ending and shorter answer are superseded for current review only. [Pre-revision commercial record](../../tests/runs/homework-directed-v003/commercial-record-before.md) preserves its detailed checks and failure/correction history, including localized assets, corrected CSS reduction and raster-cache correction. V002 was delivered for review and was not marked approved.

## Preserved earlier immersive execution

The original [composition](../openjm-homework-immersive/composition/index.html), recordings, [V001 text project](../openjm-homework-immersive/stages/v001/stage-1-text/index.html), original [scenario](../openjm-homework-immersive/source/scenario.cjs), [five-second presentation source](../openjm-homework-immersive/presentation/index.html) and [125-frame presentation clip](../openjm-homework-immersive/output/presentation-opening.mp4) remain retained. Their layered recorded-footage execution and previous instruction to continue to the full 72-second assembly are superseded by the directed staging and approval sequence above. They are historical inputs, not current approved production.

## Preserved dashboard recordings

Availability note from this handoff: the historical production links below for `scene-2.mp4`, `scene-2-dashboard-v1.mp4` and `scene-2-dashboard-v1.md` currently do not resolve. The two MP4 paths were absent from this task's initial preservation inventory. Their historical text is retained without inferring replacement filenames or modifying unrelated production files. The current V002 review and editable package links above resolve and are verified.

- [V2 review MP4](output/dashboard-loading-review-v2.mp4): silent H.264, 1440×900, 25 fps, 436 frames, 17.44 seconds.

- [V2 raw capture](assets/dashboard-loading-1440x900-v2.webm): VP8, 1440×900, 25 fps, 503 frames, 20.12 seconds.

- The review removes only the first 67 blank browser frames (2.68 seconds). No overlay, speed change, internal cut, or Scene 2 timing adjustment was added.

- [V1 review](output/dashboard-loading-review-v1.mp4) and [V1 raw capture](assets/dashboard-loading-1440x900.webm) remain unchanged. The original [Scene 2](../../productions/commercials/openjm/boy-homework/scene-2.mp4) remains unchanged.



## Selected recording direction and provenance



The main conversation and Question composer remain empty, ready for a new question. `rahkia-v1` is the default and visibly selected model. Capture-only model metadata follows the sibling `mnk-lab/openjm-api-docs/api-reference.md`, GET /v1/models example (lines 770–791, checked 2026-10-10): OpenJM ownership/root, 262144 context, loaded state, paid model tier, default chat model, reasoning, agentic, web search and memory capabilities. Its example pricing is retained as fixture metadata, not represented as verified live pricing. The shared showcase fixtures were not changed.



The 12 fictional capture-only history entries are Fractions practice, Solar system notes, English presentation, Multiplication practice, Reading comprehension, Animal habitats, Geometry homework, Grammar revision, Science project ideas, Vocabulary practice, History presentation, and Study timetable. Each has a natural topic-specific preview, no messages and a distinct descending valid timestamp, grouped four per day across three recent days. The captured interface displays October 9, 8 and 7. Exact timestamps, previews and model payload are retained in the accepted audit.



The explicit user direction removes every demo/sample/fictional label from this recording, including the V1 disclosure overlay, and removes Water cycle homework entirely. Provenance remains here and in audit files. This is controlled illustrative footage using a genuine authenticated app and real animations; it does not establish live history, model generation, pricing, service integration or loading performance.



Preserved: English interface, genuine loader and WebGL bird, bird landing, dashboard entrances, identity masks, hidden pointer, native sidebar/card sizes and spacing, history at scrollTop 0, normal animation speed, Escape only after bird arrival, silence, 1440×900 viewport.



## Capture implementation and reproduction



Scoped changes in sibling `web-openjm-frontend`: `tests/e2e/helpers/scene2Capture.ts`, `tests/e2e/showcase/scene2-video.spec.ts`, `tests/unit/scene2-video.test.mjs`, and the Scene 2 section of `tests/e2e/README.md`. Existing `playwright.scene2.config.ts`, capture selection policy and unrelated modifications were preserved. No application, backend, animation, shared fixture or user-service source was changed.



Verified existing Node/Java listeners on 3000/8082; the normal frontend preflight and genuine reusable QA session passed. Services were reused and left running. The scenario retains SSR authentication/bootstrap, exact named browser read fixtures, blocked API writes/unknown reads, identity masking that preserves the canvas, and persistent content monitoring. Session storage selects the existing history panel. Automatic screenshots, tracing and video remain disabled; failed explicit recordings are discarded.



Run from the frontend checkout:



```powershell

node scripts/playwright-run.mjs run capture -- --config=playwright.scene2.config.ts --project=showcase-scene2 tests/e2e/showcase/scene2-video.spec.ts

```



Accepted V2 run: `playwright/runs/2026-10-10T20-16-40-200Z-capture-1393ebff9eb7`, result directory `results/scene2-video-real-loading--72a72-1-and-full-history-viewport-showcase-scene2`. Independently copy its `dashboard-loading.webm` into a new versioned commercial asset and its `capture-accepted.json` and `audit.json` into a new evidence run. Never copy private authentication state. Inspect the actual lead-in of each new capture; do not reuse this trim count blindly.



To reproduce the accepted V2 encode from the retained raw file, run from this repository root:



```powershell

ffmpeg -v error -i workspace/openjm-boy-homework/assets/dashboard-loading-1440x900-v2.webm -vf "trim=start_frame=67,setpts=PTS-STARTPTS" -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart workspace/openjm-boy-homework/output/dashboard-loading-review-v2.mp4

```



The existing output is retained; do not overwrite it when making another revision. The two frame-boundary observations and average-pixel analysis agree that frame 67 is the first nonblank frame; [trim evidence](../../tests/runs/scene2-dashboard-v2/trim.json) and [boundary contact sheet](../../tests/runs/scene2-dashboard-v2/lead-in-boundary.jpg) retain that check.



## V2 verification and limits



- Genuine QA gate and protected capture: 2/2 passed. [Accepted capture evidence](../../tests/runs/scene2-dashboard-v2/capture-accepted.json) and [request/monitor audit](../../tests/runs/scene2-dashboard-v2/audit.json).

- All 12 entries loaded during `preparing-3d`, before dashboard reveal. All 353 monitor samples passed: no identity contamination, empty-history flash, forbidden labels or incomplete reveal.

- `rahkia-v1` visibly selected; composer empty. History viewport is 808 px tall, content is 1056 px tall, native overflow is `auto`, scrollTop is zero. Nine title rows intersect the viewport; three continue below it. Visibility assertions use the scroll viewport, not simultaneous visibility of all 12 entries.

- Request audit: zero unexpected reads, zero API writes; six named fixture reads. WebGL canvas, flying/arrival/exit phases and Escape ordering passed.

- Inspected raw contact sheet, exact blank-to-loader boundary, loader and landing sequence, [entrance](../../tests/runs/scene2-dashboard-v2/entrance.png), [settled dashboard](../../tests/runs/scene2-dashboard-v2/settled.png), and all 35 sampled frames from [normal-speed playback](../../tests/runs/scene2-dashboard-v2/normal-speed-contact.jpg). The sidebar fills its viewport, the model is readable, and there is no disclosure overlay or water-cycle entry.

- [Encoded metadata](../../tests/runs/scene2-dashboard-v2/review-metadata.json): 1440×900, 25 fps, 436 frames, 17.44 seconds, no audio stream. Full-file FFmpeg decode passed for raw and MP4.

- [Automated real-time playback](../../tests/runs/scene2-dashboard-v2/playback.json) played the complete MP4 at rate 1 in Chromium in 17.467 seconds: 436 frames, zero dropped frames, no waiting/stalled/error events. Its [reproduction script](../../tests/runs/scene2-dashboard-v2/check-playback.cjs) uses only the local MP4, a temporary loopback server and a task-owned browser, both closed afterward. Browser/native interactive viewing was unavailable in this session; subjective normal-speed approval remains with the user's requested review. This is not a claim of human playback review.

- Focused capture/policy unit checks: 14/14 passed; after correcting a lint naming error, the affected two tests and scoped ESLint passed again. Frontend documentation links: 69 documents passed. Canonical workspace checker: 9 documents / 94 links passed. Scoped whitespace and direct untracked-file checks passed. No application build was needed for this capture-only tooling revision.

- [Preservation comparison](../../tests/runs/scene2-dashboard-v2/preservation-after.json) confirms V1 MP4, V1 raw, original Scene 2 and shared showcase fixtures are byte-identical to their [pre-change hashes](../../tests/runs/scene2-dashboard-v2/preservation-before.json). Original Scene 2 SHA-256 remains `BF92C81F12BDEB684F8CCDA1E043C23C6475341454539795827C172172C7F666`.



The first V2 run (`2026-10-10T20-13-34-281Z-capture-588fe30a9968`) passed auth, model/composer and geometry checks but rejected the recording because readiness counted `innerText` while native entrances hide loaded content. The correction counts rendered history DOM text for loading readiness, with separate visible viewport assertions; the accepted rerun passed. Its failed recording was discarded. The first local playback probe needed a CORS header for canvas observation; that task-owned probe was stopped, corrected and rerun successfully.



## Preserved V1 evidence



V1 accepted run: `2026-10-10T19-42-07-102Z-capture-4c643509d64a`. Its [accepted evidence](../../tests/runs/scene2-dashboard-v1/capture-accepted.json) and [contact sheet](../../tests/runs/scene2-dashboard-v1/capture-contact.jpg) remain retained. V1 had four fictional entries including Water cycle homework, demo-reasoning, and the disclosure overlay; those choices are superseded only for V2. The initial V1 run failed because the default panel hid history; selecting saved history state fixed it. Its optional recursive record check encountered third-party NumPy license formatting inside the preserved task-local virtual environment; current commercial links are checked directly.



## Scene 2 integration — compressed holds



The current request explicitly lifts the earlier integration pause. It authorizes the separate `scene-2-dashboard-v1.mp4` derivative and verification without another creative approval stop. No application or API changes are needed. This authorization does not change the independent immersive continuation above.



- [Playable first composite preview](output/scene-2-dashboard-v1-preview.mp4), retained before the final narrow-bezel fringe correction.

- [Editable self-contained HyperFrames project and reproduction instructions](output/scene-2-dashboard-v1-project/README.md).

- [Delivered Scene 2 dashboard V1](../../productions/commercials/openjm/boy-homework/scene-2-dashboard-v1.mp4), alongside the preserved original. [Delivery notes](../../productions/commercials/openjm/boy-homework/scene-2-dashboard-v1.md). SHA-256: `5C303A58CECBFF9366224C754421CBB21D6092D2A14206328C1FB3E7692CC8F7`.



The original scene retains 121 frames, 1920×1080, 24 fps, 5.041667 seconds, silence, and camera/character/room motion. Only the display is retimed. The complete 1440×900 dashboard is perspective-fitted, retaining sidebar, branding, composer and `rahkia-v1`; no visible demo label is added. Controlled illustrative provenance remains the V2 provenance above.



| Scene time | V2 review time | Treatment |

| --- | --- | --- |

| 0–0.50 s | None | Original concealed opening |

| 0.50–1.05 s | 0–4.68 s | Compressed loader wait |

| 1.05–1.25 s | 4.68–5.36 s | Loader fade and start of entrance |

| 1.25–2.25 s | 5.36–7.28 s | Bird entrance and branding reveal |

| 2.25–2.50 s | 7.28–9.00 s | Shortened hover hold |

| 2.50–3.75 s | 9.00–10.28 s | Landing and dashboard entrances |

| 3.75–5.041667 s | 10.28–11.571667 s | Settled dashboard at normal ambient speed |



Boundaries come from [decoded V2 frames](../../tests/runs/scene2-composite-v1/v2-080.jpg), including [branding/landing](../../tests/runs/scene2-composite-v1/v2-160.jpg) and [settling](../../tests/runs/scene2-composite-v1/v2-240.jpg), not capture-command timestamps. Source time is continuous and increasing. Adjacent-frame blending supplies fractional samples. Every chronological phase remains; redundant waits and excess settled footage are compressed or excluded. The settled section occupies 31 output frames, 1.291667 seconds.



The project retains independent source copies, selected per-frame corners, five manual shallow-opening corrections, foreground/replacement PNG masks, exact source-frame mapping, controls, scripts, local GSAP and lossless PNG intermediates. The screen grade is gain 0.78 plus BGR black level 11/13/16, with 0.65-pixel source softness and 1.1/0.55-pixel opening/open optical softness. A maximum five-pixel inner-bezel blend and per-frame foreground matting protect hand, fingers, bezel and camera notch. Surrounding illumination is copied from the plate.



[track_screen.py](track_screen.py) now routes to the corrected packaged tracker. The [original unfinished draft](../../tests/runs/scene2-composite-v1/original-track-screen-draft.py), its frame-15 failure, and partial `assets/masks/` remain historical unselected preparation. Selected `tracking.json` is authoritative; another decoder's automatic fit can differ slightly and needs inspection before selection. The current automatic rebuild completed all 109 exposed frames, with a maximum 1.59-pixel difference from the selected fit generated from the earlier FFmpeg-decoded plates.



### Integration verification and corrections



- Reviewed all 121 lossless frames in numbered contact sheets, emphasizing first exposure, hand release, landing and final close-up. Initial opening fragmentation and bezel color remnants are preserved in [failed diagnostics](../../tests/runs/scene2-composite-v1/failed-early-matte.jpg). Corrected shallow-opening geometry, connected screen-region selection and edge reconstruction resolved them. The final close-up's thin saturated top-edge fringe was corrected within the inner-bezel blend.

- An exact-time seek test exposed GSAP rounding to the preceding frame. The [failed check](../../tests/runs/scene2-composite-v1/failed-seek.txt) and first HyperFrames export remain retained. A 0.0001-frame numeric tolerance corrected selection. The corrected test passed 363 checks across all 121 frames forward, backward and shuffled, equal to the corresponding PNGs.

- HyperFrames updated only this project's pin from 0.8.138 to 0.8.145. An upgraded check initially warned `sweep_static` when it sampled before all images loaded; an explicit build-ready promise resolves the readiness race. Strict validation then passed with no errors or warnings. No static-content waiver or artificial motion was added.

- Automated normal-speed playback of the first direct-encode preview passed: 121 frames, zero dropped frames, no waiting/stalled/error events, about 5.095 seconds wall time. CUA exposed no native apps or browser viewing surfaces; subjective normal-speed viewing is not claimed. The MP4 and local Studio remain available for user playback.

- Final HyperFrames 0.8.145 [render log](../../tests/runs/scene2-composite-v1/verified/hyperframes-render.log), [strict check](../../tests/runs/scene2-composite-v1/final/hyperframes-check-final.json), [metadata](../../tests/runs/scene2-composite-v1/verified/metadata.json), and [full decode](../../tests/runs/scene2-composite-v1/verified/full-decode.log): 121 frames, 1920×1080, 24/1 fps, 5.041667 seconds, H.264, no audio; decode exit 0. Strict check has no errors/warnings; its DOM contrast checker does not assess raster UI text.

- The final edge-cleanup project passed [363 repeatable seeks](../../tests/runs/scene2-composite-v1/verified/seek.json). The final MP4 passed [rate-1 playback](../../tests/runs/scene2-composite-v1/verified/playback.json) in 5.045 seconds: 121 decoded frames, zero dropped frames, no waiting/stalled/error events. Inspected encoded playback samples covering hand overlap, branding, dashboard entrance and final close-up. All 121 final lossless frames were inspected in numbered contact sheets.

- [Lossless pixel audit](../../tests/runs/scene2-composite-v1/verified/pixel-audit.json): zero changed pixels outside the replacement matte across all 121 frames. Exact equality applies before lossy H.264 encoding. All seven earlier source/output hashes [remain unchanged](../../tests/runs/scene2-composite-v1/verified/preservation-after.json); the project's two independent inputs [match their originals](../../tests/runs/scene2-composite-v1/verified/independent-input-hashes.json).

- An independent encoded-frame check initially found an ambiguous downsampled match at frame 110. [Retained diagnostic](../../tests/runs/scene2-composite-v1/verified/failed-downsampled-alignment.txt) records that full-resolution comparison confirms frame 110; close scores now use full-resolution images.



- [Independent final check](../../tests/runs/scene2-composite-v1/verified/independent-delivery-check.json) passed all 121 preserved plate exteriors, complementary masks, the five-pixel maximum boundary and encoded frame alignment. [Delivery hash](../../tests/runs/scene2-composite-v1/verified/delivery.json) proves the staged and production files identical. [Script/document checks](../../tests/runs/scene2-composite-v1/verified/script-doc-checks.json) passed Python compilation, Node syntax, canonical documentation, scoped commercial links and whitespace. [Visual review scope](../../tests/runs/scene2-composite-v1/verified/visual-review.md) distinguishes frame inspection from human playback approval.



**Scene 2 status:** implementation, technical verification and separate production delivery are complete. The next review is the user's subjective normal-speed playback of the delivered MP4; it is not claimed as completed by the agent. The local Studio preview is available at `http://localhost:3417/#project/scene-2-dashboard-v1-project` while its task-owned service remains running. The immersive continuation has its own checkpoint above.
