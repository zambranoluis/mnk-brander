# Mix and verification — supplied audio V002

The [review film](openjm-assembly-v003-audio-v002.mp4) and [WAV master](openjm-audio-v002-mix.wav) are complete. The user-authorized plan accepts the recordings' wording, natural pace, N08's longer window and an interrupted song word at Pause. Those decisions supersede the earlier prompt-only recipe, which is [preserved verbatim](../../assets/audio-v002/prompt-package-before-mix/mix-and-verification.md).

## Mix

See [supplied-recordings.md](supplied-recordings.md) for transcripts and source assignments; [timing.json](timing.json) owns placement and [mix-settings.json](mix-settings.json) records exact gains and the master filter. Originals remain untouched. Decoded float WAVs and isolated full-length narration, bed and song stems are retained under [derived](../../assets/audio-v002/derived/narration-timeline.wav).

- 48 kHz stereo timeline, 5,276,160 samples per channel. Narration is centred, with per-take constant loudness correction to −17.5 LUFS before mastering. No narration pace, pitch, interior pause, EQ or wording edits. Only N09's final 1,489 silent samples are trimmed.
- Piano begins at source zero and runs continuously. Its pre-master base is −24 LUFS; narration triggers another 7.5 dB reduction, with 150 ms anticipation and 450 ms recovery after an 80 ms tail allowance. A mild 1.6 kHz / Q 0.7 / −3 dB EQ blend follows the same cue envelope to make room for speech. Across active narration samples, the pre-master speech-to-bed RMS margin measures 13.71–22.66 dB, with the widest gap during the opening fade. These are mix measurements, not subjective approval.
- Bed fades in 0–2 s, fully out 76.56–76.96, stays exactly silent 76.96–80.96, returns 80.96–82.00, and fades to zero 108.80–109.92. Cosine envelopes smooth the transitions. It never restarts its musical timeline.
- Song source samples 0–143,999 occupy timeline samples 3,694,080–3,838,079 (76.96–79.96). A 480-sample / 10 ms de-click reaches zero at Pause. No bed or narration overlaps. The WAV is digitally silent throughout 79.96–80.96.
- Two-pass FFmpeg loudnorm targeted −16 LUFS / −1.5 dBTP with LRA 20. The measured crest factor required its dynamic true-peak mode; it did not use pure constant-gain normalization. Final WAV is 24-bit PCM; AAC is 320 kb/s. Video was copied with `-c:v copy`, without `-shortest` or a picture filter.

## Measured verification

[Machine-readable results](../../../../tests/runs/openjm-audio-v002-mix-20261011/verification.json), [metadata](../../../../tests/runs/openjm-audio-v002-mix-20261011/export-metadata.json) and [preservation comparison](../../../../tests/runs/openjm-audio-v002-mix-20261011/preservation-after.json) retain the checks.

| Check | Result |
| --- | --- |
| WAV loudness / true peak | −16.02 LUFS / −1.50 dBTP |
| Decoded AAC loudness / true peak | −16.02 LUFS / −1.49 dBTP |
| WAV layout / duration | 48 kHz, stereo, 24-bit PCM; 5,276,160 samples; 109.92 s |
| MP4 picture | 1920 × 1080, 25 fps, 2,748 frames; 109.920000 s |
| Video packets and timing | All 2,748 payload SHA-256 hashes, PTS, DTS, durations and flags identical |
| Decoded picture | All 2,748 per-frame hashes and timestamps identical |
| Full decode | All eleven MP3s, WAV and final MP4 audio/video passed |
| Originals / earlier work | Eleven Desktop/copy hashes, V003 MP4/ZIP, V001 and retained prompt snapshots match baseline |
| Exact cue sample checks | All nine narration stems match source resampling × gain; song matches source 0–3 s × gain × final fade |
| Play / Pause | Stem boundaries at frames 1924 / 1999; encoded UI frames inspected |
| Final WAV sample | Digital zero |

The [boundary contact sheet](../../../../tests/runs/openjm-audio-v002-mix-20261011/play-pause-frames.jpg) shows frames 1923, 1924 and 1999. Packet/frame equality also preserves the previously verified picture controls and timing.

AAC has transform-window residue around edits; it is not sample-identical to PCM. In the first 10 ms after Pause its maximum measured sample is −56.66 dBFS, falling below −60 dBFS after 1.48 ms and below −80 dBFS after 14.69 ms; the WAV and isolated stems stop at the exact boundary. The MP4 audio starts at 0 and presents 109.92 s; raw AAC decoding returns 512 extra codec-padding samples (10.667 ms). Container timing remains 109.92 s. These codec limits are separate from the exact WAV duration and unchanged video. No claim of absolute digital silence in decoded AAC at Pause is made.

The first exact-silence check rejected 14 residual PCM samples after Pause at −138.47 dBFS from master resampling. The authored silent second was explicitly zeroed after master processing; the corrected export passes. [Failure and original candidate](../../../../tests/runs/openjm-audio-v002-mix-20261011/initial-silence-check-failure/failure.json) are retained. Loudness was remeasured after correction.

A fresh local transcription of the exported AAC recovered all nine narration phrases; it omitted the featured three-second song. See [recognized text](../../../../tests/runs/openjm-audio-v002-mix-20261011/export-transcription.txt). Recognition is wording evidence only. It cannot certify “Open Jay Em,” voice identity, timing, intelligibility, timbre or musical quality.

## Recheck and rebuild

[mix_audio.py](mix_audio.py) contains the sample placement, mix and independent verification. The existing commercial-local Python provides NumPy; FFmpeg and FFprobe 8.1.1 were available on PATH. From the repository root, the read-only media recheck is:

```powershell
workspace/openjm-boy-homework/local/venv/Scripts/python.exe workspace/openjm-boy-homework/output/audio-v002/mix_audio.py verify
```

This rewrites only this run's diagnostic reports. `prepare` ingests and snapshots; `mix` builds the new stems/master/export. Both intentionally refuse existing outputs, so make a separate version before rebuilding; never delete retained work merely to rerun them. Mixing uses existing supplied files and FFmpeg; it does not rerender or upgrade the HyperFrames picture project. No extra dependencies were installed.

## Remaining listening

Human headphone and speaker review is **not performed**. Check all nine phrases for natural delivery, clarity and consistent voice; “Open Jay Em” in N01/N02/N09; music balance and recovery; the accepted interrupted song word at 79.96; and the musical ending. No confirmed listening defect was used to replace or regenerate a supplied take. The review export is delivered now, as authorized, with this limit explicit.
