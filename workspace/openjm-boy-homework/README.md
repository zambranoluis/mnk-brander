# OpenJM boy homework — recovered pre-SFX bases

Active task: [pre-sfx-baseline](revisions/pre-sfx-baseline/README.md). Current decisions and recovery status: [commercial record](openjm-boy-homework-commercial.md).

| Selected base | Direct video | Review status |
| --- | --- | --- |
| Landscape audio-v002 | [1920 × 1080 MP4](output/openjm-assembly-v003-audio-v002.mp4) | Recovered unchanged; subjective listening approval pending |
| Portrait V004 | [1080 × 1920 MP4](output/openjm-assembly-v003-audio-v002-portrait-v004.mp4) | Recovered unchanged; subjective visual/listening approval remains with the user |

Both are 109.92 seconds, 25 fps, 2,748 frames. “Pre-SFX” retains narration, music and the song. V005 introduced added effects and V006 revised them; neither is an active base. Future edits must use new output filenames and preserve these two copies.

The flattened videos are available for immediate editing. The source recovery is intentionally asset-incomplete. A full source rebuild requires the omitted inputs supplied by the user, the original toolchain and a fresh verification pass. No source render, remix, installation or preview service was run during recovery.

## Editable owners

| Recovered source | Owners and scope |
| --- | --- |
| [Assembly V003 timing](sources/assembly-v003/assembly.json) | Landscape timing/transitions; [historical source guide](sources/assembly-v003/README.md), Text/Images HTML, content, interaction schedules, native engine and render scripts |
| [Audio V002 settings](sources/audio-v002/mix-settings.json) | [Mix code](sources/audio-v002/mix_audio.py), [cue timing](sources/audio-v002/timing.json), [supplied recordings and transcripts](sources/audio-v002/supplied-recordings.md), [input provenance](assets/audio-v002/input-manifest.json) |
| [Portrait V004 timing](sources/portrait-v004/assembly.json) | Separate mobile Text/Images/Music/Video/presentation sources; [camera paths](sources/portrait-v004/camera-paths.json), [camera guide](sources/portrait-v004/CAMERA-PATHS.md), [native ending runtime source](sources/portrait-v004/ending/source/runtime.ts), [historical source guide](sources/portrait-v004/README.md) |

Landscape includes editable Text/Images projects but consumes rendered Music/Video clips. Portrait's mobile code is not an exact landscape substitute. Assembly V003's historical “silent” and “audio outstanding” statements describe the picture project; the selected landscape MP4 already includes audio-v002.

The original laptop-screen composite is still unfinished; the retained original outro is not a completed screen replacement. Old source guides, localhost URLs and verification reports are historical, not current readiness checks. Read the [dependency and reproduction limits](revisions/pre-sfx-baseline/DEPENDENCIES.md) before using historical commands.

## Provenance and verification

- [Recovery file list and SHA-256 hashes](revisions/pre-sfx-baseline/recovery-files.json): original M: paths, local destinations and unchanged-copy hashes.
- [Omitted dependency inventory](revisions/pre-sfx-baseline/omitted-dependencies.csv): original locations, expected local project paths, purpose, size and SHA-256.
- [Recovery verification](../../tests/runs/2026-10-13-pre-sfx-recovery/verification.json): current copy, decode, metadata, packet, navigation and preservation checks, with their scope.
- [Original commercial record](archives/pre-recovery/openjm-boy-homework-commercial.md): unchanged historical decision history, including SFX revisions and failed screen-composite work. Its old relative links and preview URLs are not active navigation.

No editable ZIP is created. A future package would need a separately selected scope and restored dependencies. Productions remain entirely under the user's management. Files are local and uncommitted; recovery does not establish availability to collaborators.
