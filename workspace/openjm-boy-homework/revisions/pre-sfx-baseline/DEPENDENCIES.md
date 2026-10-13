# Dependencies and reproduction limits

This recovery preserves code and supporting text unchanged. It does not restore a runnable, asset-complete package. The [commercial README](../../README.md) identifies the two available flattened base videos. Paths below are relative to the recovered commercial unless stated otherwise.

## Inventory and classification

[omitted-dependencies.csv](omitted-dependencies.csv) records 662 deliberately omitted files, with original absolute M: location, expected project path, purpose, byte count and SHA-256 measured during recovery. It includes both direct inputs and historical/prepared intermediates; listing a file does not mean every scene needs it. Use the chosen scene's actual consumers to select restoration scope. [recovery-files.json](recovery-files.json) maps every recovered source and video to its original location and hash.

| Class | Expected paths and role | Readiness |
| --- | --- | --- |
| Landscape input footage | `sources/assembly-v003/sources/*.mp4`; normalized scene clips under `sources/assembly-v003/assets/` | Omitted; original footage and rendered Music/Video clips are required for assembly. Text/Images have editable projects. |
| Landscape silent picture | `sources/assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4` | Omitted generated intermediate consumed by `sources/audio-v002/mix_audio.py`; the available flattened audio-v002 MP4 is not this silent original. |
| UI visual inputs | Each format's `ui/*/assets/`, `ui/*/artwork/`, fonts and referenced images/SVGs | External asset files omitted. Code, JSON/content and inline markup remain byte-identical, including inline icons/artwork already embedded in source. |
| Portrait input footage and camera plates | `sources/portrait-v004/sources/*.mp4`, `sources/portrait-v004/assets/*.mp4` | Omitted; `camera-paths.json`, `reframing.json` and render/capture code are retained. |
| Portrait soundtrack | `sources/portrait-v004/sources/audio-v002-master.mp4` and `sources/audio-v002.m4a` within that project | Omitted project-local media; final mux uses the former and preview uses the latter. The recovered landscape base retains the soundtrack, but no extraction or project-local media copy was made. |
| Native ending assets | `sources/portrait-v004/ending/assets/` and `ending/original-assets/public/` within that project | Original hummingbird/wordmark SVGs and GLB omitted; native animation code, styling, source template and compiled JS retained. |
| Narration, music and song originals | `assets/audio-v002/originals/N01.mp3` through `N09.mp3`, `instrumental.mp3`, `homework-generated-short-song.mp3` | All eleven omitted. [Original input manifest](../../assets/audio-v002/input-manifest.json) retains provenance, original hashes and metadata. |
| Prepared audio and mix | `assets/audio-v002/derived/`, `sources/audio-v002/openjm-audio-v002-mix.wav`, portrait UI FLAC media | Omitted; these require originals/settings to reproduce. No stems or audio-only exports were copied. |
| Reference/delivery media | Presentation reference videos, standalone ending, UI renders and other project media named in the CSV | Deliberately omitted; the only recovered media files are the two selected base MP4s. |
| Toolchain | Root and scene `package.json`/lockfiles; portrait `requirements.txt` | Manifests retained; installed dependencies, browsers, caches and environments excluded. Existing FFmpeg/FFprobe/Python were used only for recovery checks. |
| Prior evidence, packages and previews | Old `tests/runs/`, ZIP references and localhost URLs in unchanged source/history documents | Historical, not current dependency availability or verification. ZIPs and prior test artifacts were not imported. |

The [literal source-reference report](../../../../tests/runs/2026-10-13-pre-sfx-recovery/source-reference-audit.json) inventories statically extractable HTML/CSS and assembly asset references. It distinguishes locally present targets, known omitted assets, external URLs and unresolved historical/dynamic paths. It is a static inventory, not proof that a browser or source build runs. The [historical Markdown link report](../../../../tests/runs/2026-10-13-pre-sfx-recovery/historical-links.json) records preserved links separately; only the new navigation documents are required to resolve now.

## Historical command assumptions

The recovered source guides retain their original commands and claims for provenance. Their project-local media references remain absent, and delivery links inside a source README are not remapped to the shallow output copies. Use the commercial README for current video navigation.

`sources/audio-v002/mix_audio.py` still assumes the original Desktop audio folder, earlier audio-v001 material, a prior editable ZIP and historical evidence locations in its preparation/preservation flow. It imports NumPy, whose environment is not part of this recovery. Supplying audio alone does not certify that its historical `prepare` command is safe or complete in this layout. Reconcile those dependencies in a new task before running it.

Rendering scripts retain original output names and overwrite behavior. The source-copy operation does not retrofit them into a new build system or certify write isolation for future edits. Before a future render, create the authorized derivative and review its input/output paths so retained sources and delivered bases stay unchanged.

Portrait pinned manifests retain Playwright 1.63.0, Three.js 0.186.1, GSAP 3.14.2 and esbuild 0.25.11. Those are historical pins, not a recommendation to upgrade or a claim that dependencies are installed. HyperFrames commands may fetch pinned CLI packages; no such command was run. No current preview URL is offered.

## Restoration order for later source work

1. Select the target format and scene; use its recovered owners, not a different format's implementation.
2. Supply required originals/artwork/fonts/models from the CSV and verify their hashes at the expected paths. Original absolute locations are provenance only and do not authorize writes to M:.
3. Reconcile historical toolchain and script assumptions in a new editing task, retaining these recovered files as the base.
4. Rebuild only needed intermediates to new output names, then perform source/runtime, picture/timing and audio verification appropriate to that change.
5. Keep human listening/visual review and the unfinished laptop-screen composite explicitly open until actually resolved.

Productions remain managed by the user. This document does not authorize rendering, installation or production changes during recovery.
