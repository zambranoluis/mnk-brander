# Portrait V003: preserved V002 camera paths

Edit `camera-paths.json`. Each shot has ordered `knots` with a local integer `frame` (25 fps) and `centerX` in the original 1920-pixel-wide source. `assembly.json` remains the sole owner of shot placement, duration and transitions. Do not change it for a framing adjustment.

All four sources are 1920 x 1080. The exact maximum-height 9:16 crop is **607.5 x 1080**, scaled uniformly to **1080 x 1920**. Its vertical origin stays at zero, preserving every available row. There is no additional zoom. `scripts/camera.py` evaluates a shape-preserving cubic Hermite curve with a shared first derivative at each knot. Equal consecutive centers create a hold; extrema and outer endpoints have zero velocity. The crop is clamped to source bounds. Keep authored centers within **303.75 to 1616.25** so clamping does not introduce a derivative kink.

The renderer converts source fps to 25 with FFmpeg's `fps` filter without changing playback speed, then evaluates the camera for each output frame. Pillow applies the fractional source rectangle with Lanczos resampling; the exact 607.5-pixel width avoids aspect distortion and whole-pixel crop stepping. Laptop content is sampled from the original image, with no screen replacement. Source optical movement and motion blur remain.

| Shot | Local frames | Direction |
| --- | --- | --- |
| intro-boy | 0-125 | Hold expression; move toward the hand and opening lid |
| dashboard-loading | 0-125 | Follow the lifting hand; settle on the original display |
| actor-pause | 0-125 | Follow face while original camera widens; retain all available vertical image |
| outro-composite | 0-150 | Start on boy; anticipate bird emerging; follow right arc and return flight |

The reaction's upper face is absent at its source beginning. The laptop eventually exceeds the portrait width as the original camera pushes in: the display's central content remains the subject, while side edges and room context leave the crop. The outro deliberately allows the boy to leave the frame after the handoff. The approaching bird nearly fills the crop horizontally during wing extension; review the final flight at normal speed. Full landscape context cannot fit a fullscreen portrait crop.

## Rebuild

From this package directory, with Python, FFmpeg and the supplied Python requirement installed:

```powershell
python -m pip install -r requirements.txt
python scripts/render_footage.py
python scripts/build.py
python scripts/render.py
```

For a single-shot iteration: `python scripts/render_footage.py --only outro-composite`, then build and assemble. `assets/` contains generated camera plates; `sources/` contains retained originals. Do not edit `reframing.json` directly: it records the generated boxes. Mobile footage is independently retained; the native portrait ending is built separately with npm run build:ending and npm run render:ending. Camera rendering leaves both unchanged.

Final assembly advances both source pictures through the existing dissolve intervals and copies the original audio-v002 AAC packets without retiming. The delivered master is `openjm-assembly-v003-audio-v002-portrait-v003.mp4`.

## Verify and review

Use a new evidence directory when rerunning:

```powershell
python scripts/audit_camera.py --evidence local/recheck
python scripts/verify.py --evidence local/recheck
python scripts/audit_picture.py --evidence local/recheck
node scripts/seek_video.cjs local/recheck
node scripts/playback.cjs local/recheck
```

The camera audit checks every crop, continuous velocity at knots and order-independent evaluation. It creates full frame sequence contact sheets. The picture audit compares every assembled frame against source plates or manifest-owned blends. Browser seeks compare actual encoded pixels in forward and reverse order; full playback checks rate, stalls and dropped frames. These are separate from subjective approval. Review all four shots, the boy-to-bird handoff and transitions at rate 1 before approving camera feel.
