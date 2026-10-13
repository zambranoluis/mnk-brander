# OpenJM audio V002 — review export

Status: **mixed and technically verified; human listening approval pending**.

- [Film with audio](openjm-assembly-v003-audio-v002.mp4)
- [48 kHz stereo, 24-bit WAV master](openjm-audio-v002-mix.wav)
- [Supplied recordings, transcripts and actual cue placement](supplied-recordings.md)
- [Current cue data](timing.json) and [reproducible mix settings](mix-settings.json)
- [Mix details, verification and remaining review](mix-and-verification.md)

The picture is unchanged: **109.92 seconds, 2,748 frames, 1920 × 1080, 25 fps**. All video packet bytes, timestamps and decoded frames match the [V003 picture master](../assembly-v003/renders/openjm-assembly-v003-provisional-final.mp4). The video stream was copied without re-encoding.

WAV and encoded AAC both measure **−16.02 LUFS integrated**. True peaks are **−1.50 dBTP WAV / −1.49 dBTP AAC**. The WAV contains exactly **5,276,160 stereo sample frames**. Both streams decode completely.

All eleven Desktop MP3s were copied unchanged into [commercial-owned originals](../../assets/audio-v002/input-manifest.json). Narration wording and natural pace are preserved; N08 ends at 104.349396 seconds and N09's trailing silence is trimmed to finish at 108.80. The exact first three seconds of the song play at 76.96–79.96, accepting the interrupted word at Pause. The piano bed continues its original timeline across the muted section.

The [narration prompt](01-narration.md), [instrumental prompt](02-instrumental.md) and [song prompt](03-homework-song.md) are retained as earlier generation instructions. Their “missing/pending” and complete-first-line wording is historical and superseded by the supplied-recording decision. The complete six-file [pre-mix prompt package](../../assets/audio-v002/prompt-package-before-mix/README.md) and V001 package remain preserved. No provider operation, generation or publication was performed in this mix session.

Next action: review the MP4 on headphones and ordinary speakers, especially “Open Jay Em” in N01/N02/N09, voice consistency, speech clarity, music balance, the Play/Pause transition and the ending. Automated transcription and meters do not establish listening approval. This is commercial sound design over the retained picture, not evidence of live OpenJM generation.
