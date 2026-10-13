# V006 verification and listening limits

## Completed technical checks

- Every V005 video packet, PTS/DTS/duration and decoded frame hash matches: 2,748 frames, 1080 × 1920, 25 fps, 109.92 s. Full decode passes. All assembly timing and transitions are unchanged.
- Both 24-bit WAVs have 5,276,160 stereo samples at 48 kHz. No clipped samples. WAV: −16.03 LUFS / −1.55 dBTP; AAC: −16.04 LUFS / −1.54 dBTP, below the −1.5 dBTP ceiling.
- Frame-derived UI synchronization: maximum full-cue sample-peak offset 17.667 ms, below one 40 ms frame. Prompt taps use three deterministic variations, separated by at least four actual entry frames. Paste, numeric entry and press provenance is checked against retained browser-evaluated UI states.
- SFX are at least 12.24 dB below narration in measured overlapping voiced 100 ms windows (voice above −35 dBFS). This is a masking proxy, not proof of intelligibility. Stereo correlation is 0.666; mono fold-down changes stem RMS by −0.809 dB. No polarity widening is used.
- Final-stem flyby energy crest is 104.400 s; fullscreen crest is 96.745 s. Opening SFX end by 0.70 s; the reaction stays free of added sound; the final effect ends at 109.539875 s, before 109.76 s.
- Song retains source/timing at 76.96–79.96 s. Pause tap ends at 79.88 s. WAV and stem each contain exactly 48,000 zero samples per channel at 79.96–80.96 s. Maximum necessary peak reduction over the song is 0.051 dB; maximum over the film is 0.066 dB.
- AAC has transform residue at pause edges (peak −56.66 dBFS) and 512 decoder padding samples. Exact zero/sample-count claims apply to PCM, not decoded AAC.
- Full unmuted rate-1 automated playback: 2,748 frames, zero drops/stalls/errors, 110.47 s wall time. This is automated playback, not human listening.
- HyperFrames 0.8.150 strict check: zero lint/runtime/motion warnings or errors, zero layout issues across nine samples. Preview uses the final AAC stream.

## Comparison and acceptance

Six raw/prepared pairs are produced at matched RMS, and full V005/V006 comparisons at −16.04 LUFS. The laptop's largest 10 ms energy share fell from 74.6% to 36.4%; prepared flutter energy below 120 Hz fell from 73.7% to 2.18%. Bloom remains predominantly high-frequency (91.6% above 4 kHz after treatment), so its separate low-mid texture supplies the proposed warmth. These signal changes do not establish naturalness or audible improvement.

The specified processing remains a candidate. No human headphone/speaker audition, subjective A/B judgment, naturalness/chirp/musical-content approval, or speech-intelligibility approval was performed. Next action: use the comparison script and complete a normal-speed headphone and speaker review before selecting V006 as final.

## Reproduction and preservation

The private ZIP is extracted and rebuilt from local dependencies; the delivery record records the final hash comparison. No provider account or earlier workspace is needed. All supplied originals and V005 files are retained byte-for-byte. Earlier deliverables are preserved.

The first verification invocation encountered a local function-name shadowing error; it was corrected before the passing identity/audio checks. Inherited auxiliary scripts contained absent V005 ending paths; the V006 copies now reference the actual retained V004 ending. The original scripts remain untouched. No missing-input workaround or regenerated substitute was used.
