# Supplied recordings — V002

The user-authorized implementation plan makes the eleven supplied recordings authoritative for this mix. Originals are retained, with unchanged filenames, in [originals](../../assets/audio-v002/input-manifest.json). The [input manifest](../../assets/audio-v002/input-manifest.json) records original SHA-256 hashes, metadata, durations and loudness. Desktop originals were rehashed after export; all eleven copies match. Voice name/ID, generation model and settings were not supplied and remain unknown.

## Automated transcripts, separate from earlier scripted copy

These are raw local whisper.cpp transcripts recovered from the preceding inspection: small.en for narration, medium.en for the full song. [Raw evidence](../../../../tests/runs/openjm-audio-v002-mix-20261011/prior-local-transcripts/N01.json) is retained. They support wording identification; they do not verify pronunciation, same-voice consistency or subjective sound quality. In particular, “OpenJAM” and “Open J.M.” below are recognizer spellings, not approved brand spellings or instructions to replace the recordings. Intended pronunciation remains “Open Jay Em.”

| Take | Raw recognized text |
| --- | --- |
| N01 | Meet OpenJAM, a place to explore your ideas, create them, and bring them to life. |
| N02 | Start with a question. OpenJAM helps you explore the topic and develop a clear explanation. |
| N03 | Then take the next step, turn that idea into pictures, right in the same conversation. |
| N04 | Keep building on what you've started with your words and images together. |
| N05 | You can give your idea a melody, too. |
| N06 | Create a song with your own lyrics and hear another side of what you're making. |
| N07 | Bring your pictures and music closer, and see how it all comes together. |
| N08 | Questions, pictures, music, video - one conversation with more ways to express your ideas. |
| N09 | Open J.M. Bring your ideas to life. |

Full song recognition: Sunshine warms the water below, into the air the vapor goes, cooling makes the cloud drops grow, rain falls down the rivers flow, back to lakes and seas again, the water's journey has no end.

Against the earlier machine-readable script, N01 says “create them”; N05 says “You can give your idea a melody, too”; N07 says “Bring your pictures and music closer, and see how it all comes together.” The human-edited narration prompt already contains those three changes, while its prior counts and timing JSON still reflected the earlier draft. All original prompt files and the pre-mix cue JSON are retained in the [pre-mix snapshot](../../assets/audio-v002/prompt-package-before-mix/README.md). The current [timing.json](timing.json) distinguishes earlier script text from raw recognition and supplied source assignments.

The source song is 16.039188 seconds decoded at 48 kHz. Only its exact first three seconds are used. An interrupted word at Pause is explicitly accepted; no later source excerpt or pace adjustment was substituted. “Vapor” versus scripted “vapour” is a transcription spelling difference, not evidence of different sung wording.

A fresh recognizer pass over the finished AAC [recovers all nine narration phrases](../../../../tests/runs/openjm-audio-v002-mix-20261011/export-transcription.txt). It omits the brief featured song and has coarse timestamps; it is not a song-intelligibility, synchronization or listening approval.

## Actual placement and level corrections

All starts and internal pauses are preserved at original pace. The stereo narration stem has identical left/right samples. Per-take constant gain brings its initial 3.53 LU loudness spread to a common −17.5 LUFS target before master processing.

| Take | Start (s) | End exclusive (s) | Gain before master (dB) | Trailing samples removed |
| --- | ---: | ---: | ---: | ---: |
| N01 | 0.80 | 7.487354 | -1.31 | 0 |
| N02 | 11.00 | 18.079187 | +0.74 | 0 |
| N03 | 33.20 | 39.312667 | +0.33 | 0 |
| N04 | 43.20 | 48.111021 | +0.55 | 0 |
| N05 | 53.20 | 55.969000 | -2.06 | 0 |
| N06 | 59.00 | 63.754292 | -1.47 | 0 |
| N07 | 82.00 | 86.832667 | +1.32 | 0 |
| N08 | 96.80 | 104.349396 | -1.00 | 0 |
| N09 | 105.20 | 108.800000 | -2.21 | 1489 |

N08 uses the authorized expanded window and ends at 104.349396 seconds. N09 loses 1,489 samples (31.020833 ms) of trailing silence only, ending at 108.800000. The discarded tail was checked below −60 dBFS; no words or internal pauses were cut. No other narration takes were trimmed or accelerated.

Human headphone and ordinary-speaker review remains outstanding for clarity, consistent voice, “Open Jay Em” pronunciation in N01/N02/N09, music balance, transitions and the final cadence. No supplied take was replaced.
