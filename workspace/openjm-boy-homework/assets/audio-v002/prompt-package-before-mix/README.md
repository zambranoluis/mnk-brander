# OpenJM narration and music — V002

Status: **prompt-ready; audio not yet generated or mixed**. On 2026-10-11 the user chose to generate and download the ElevenLabs files personally. This revision addresses the feedback that V001 focused too much on homework: the narration now presents OpenJM and its connected creative workflow. V001 is preserved. Cue windows, music treatment and song lyrics are unchanged. The audio export follows once those downloads are available.

## Generate these files

1. Follow [Narration](01-narration.md): select one soft, warm adult female English voice, keep it for all nine phrases, and download each phrase separately.
2. Follow [Instrumental](02-instrumental.md): generate one continuous piano-led music bed.
3. Follow [Homework song](03-homework-song.md): use the exact six lyric lines, with singing from the first beat.
4. Retain all eleven original downloads, including their real extensions. Put them in `workspace/openjm-boy-homework/assets/audio-v002/originals/` when available. That folder and the audio files do not exist yet.
5. Return the downloads for local assembly using [Mix and verification instructions](mix-and-verification.md) and [machine-readable cues](timing.json).

Use the proposed basenames in the prompts, adding `.wav`, `.mp3`, or the actual downloaded extension. Do not rename MP3 data to WAV. Prefer the highest quality download actually offered; keep originals unchanged. Log the selected voice name/ID, model, settings, generation date, and any take/version suffix alongside the downloads. No voice reference or video upload is needed.

## Fixed picture

Input: [V003 finished picture](../assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4).
Timing authority: [assembly.json](../assembly-v003/assembly.json).

- Exactly 109.92 seconds, 25 fps, 2,748 frames; 1920 × 1080 H.264.
- SHA-256: `0f1475223c65865d7edbdd0bd9e4ca9d22434cc3807831aac30c25f920b3a4b3`.
- Song playback: **76.96–79.96 seconds**, frames **1924–1998 inclusive**; frame 1999 is paused.
- Narration: **122 spoken words** in nine separate cues, counting “Open Jay Em” as three words. Cue windows total 58.8 seconds; actual takes may be shorter.
- Original outro and settled visual edits remain the picture source. No captions or additional sound effects.

The source was probed and hashed on 2026-10-11. Encoded frames 1850, 1923, 1924 and 1999 were inspected for lyrics, pre-play, playing and paused states. The source is silent; its synthetic UI waveform is not an analysis of generated audio. Adding audio here is commercial sound design, not evidence of a live OpenJM generation.

## Provider notes

Checked 2026-10-11: ElevenLabs documents voice selection and TTS controls; descriptive directions pasted into the spoken-text field may themselves be spoken. Keep direction separate from phrase text. [ElevenLabs TTS documentation](https://elevenlabs.io/docs/overview/capabilities/text-to-speech).

Eleven Music supports instrumental and vocal work, custom lyrics, section editing and duration controls. Exact onset, timing and musical quality still require listening to generated output. Download formats/options depend on the available interface and account. [Eleven Music documentation](https://elevenlabs.io/docs/eleven-creative/products/music).

Account generation was not tested. This session exposed no ElevenLabs connector, configured key or browser session. The user's manual-generation choice now owns the next action. No audio quality, loudness, synchronization, headphone/speaker listening or new MP4 verification is claimed.
