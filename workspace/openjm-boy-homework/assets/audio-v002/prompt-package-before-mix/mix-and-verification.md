# Local mix and verification — pending generated audio

This is the revision recipe, not a completed mix. The source picture remains [V003](../assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4). The cue windows and proposed input basenames are in [timing.json](timing.json).

## Ingest and timing

Retain all original downloads under `workspace/openjm-boy-homework/assets/audio-v002/originals/`; put trimmed/resampled derivatives under `assets/audio-v002/derived/`. Record hashes, real formats, voice/model/settings, selected takes and measured durations. Create these folders only when populated.

Use a 48 kHz stereo mixing timeline of exactly **5,276,160 samples** (109.92 seconds). Decode/resample originals locally; converting MP3 to WAV does not restore lost quality. Centre the narrator. Keep natural breaths and a small tail; remove only unwanted leading/trailing silence in derived copies. Place each phrase at its cue start and require the audible tail to finish within its window. Shorter takes leave more viewing space. Overlength takes require wording/pause correction and another take, not picture retiming.

The intended song has 16 seconds overall, but the film uses only its opening **144,000 samples** at 48 kHz. Start at sample **3,694,080** and end before **3,838,080**. These correspond to picture frame 1924 at 76.96 seconds and frame 1999 at 79.96 seconds. A 5–10 ms de-click fade must finish at the stop boundary. Do not trim away a musical introduction and then imply it was the original first three seconds; regenerate an immediate-vocal opening instead.

## Music envelope

Treat the following as initial mix choices and refine after listening; they are not measured loudness results.

- Music fades in from silence over 0.00–2.00 seconds.
- During narration, begin with the bed about 12–16 dB below the voice, lowering it around 150 ms before each phrase and restoring it over about 450 ms after its audible tail. Preserve musical continuity between nearby phrases and avoid pumping.
- At 76.56–76.96 seconds, fade the bed fully out. Keep it silent through 80.96 seconds.
- Feature only the homework song from 76.96 to 79.96 seconds. No narration or other bed overlaps it.
- Leave a one-second breath after Pause, 79.96–80.96. Fade the original bed back in over 80.96–82.00, already ducked for N07.
- Continue the bed's original musical timeline under the mute rather than restarting the track. This keeps its ending cue aligned.
- Let the cadence land around 107.80, supporting N09. Tail/fade reaches digital silence at 109.92. No extra SFX or captions.

Export the mixed master as `openjm-audio-v002-mix.wav`, 48 kHz stereo PCM (24-bit preferred). Target approximately **−16 LUFS integrated**, with **maximum −1 dBTP**, using measured two-pass normalization or equivalent metering and limiting. Preserve the three-second song's intelligibility; whole-file loudness alone does not establish voice balance. Leave extra peak margin if AAC encoding increases peaks, then measure the encoded audio again.

## MP4 stream-copy export

Proposed output: `workspace/openjm-boy-homework/output/audio-v002/openjm-assembly-v003-audio-v002.mp4`. It does not exist yet. Run from this package directory **only after the mixed WAV exists and passes review**:

```powershell
ffmpeg -n -i ../assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4 -i openjm-audio-v002-mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart openjm-assembly-v003-audio-v002.mp4
```

The exact-length WAV governs the audio endpoint. Do not use a picture filter, framerate conversion, video re-encode or `-shortest` to hide a timing error. Preserve the original MP4 and existing editable ZIP. AAC priming/container rounding should be inspected separately from the video stream's exact 109.92-second duration.

## Acceptance after generation and mixing

1. Listen to each narration take: same voice, clear English, gentle delivery, exact text, correct “Open Jay Em,” no clipped word or spoken direction. Confirm measured durations fit cues.
2. Check all six song lyric lines, immediate vocal onset and a complete opening line inside the selected three seconds. Inspect picture/audio together across Play and Pause.
3. Measure the WAV and decoded AAC independently for integrated LUFS and true peak. Target −16 LUFS within about 1 LU; reject true peaks above −1 dBTP and re-export if necessary.
4. Listen to the complete film on headphones and ordinary speakers for intelligibility, musical balance, clean transitions and ending. This requires an actual listener; do not infer success from meters.
5. Compare both MP4s' video packet payload hashes and timestamps, then decoded per-frame hashes. Require all 2,748 decoded frames identical, unchanged ordering/timing, 25 fps and 1920 × 1080.
6. Decode the full output with FFmpeg and require success for both audio and video. Check the exact WAV sample count, audio start offset, end coverage, no unintended tail and silence outside the song window in its isolated stem.
7. Recheck the original master hash, retain the individual audio, mixed WAV, timing/voice settings and verification evidence, then update the commercial record with actual results and the new export link.

Pending: every generated-audio check, mix, new export, encoded-audio measurement and listening pass. Current verification covers the prompt package, source metadata/hash, exact lyric text and pictured playback boundaries only.
