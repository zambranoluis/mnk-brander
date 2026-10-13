# Loader video v2

From the parent work item (`workspace/dashboard-loader-video/`), rebuild the revised video with:

```powershell
node scripts/prepare.mjs
npm --prefix preview ci
node scripts/prepare-v2.mjs
node scripts/build-v2.mjs
npm --prefix preview/v2 run check
npm --prefix preview/v2 run render
```

The source ZIP retains both versions and all shared immutable assets. V2 source is in this directory; the GLB, logo, wordmark and production style references remain in `assets/production/`. V2 compiles to `preview/v2/`, with the pinned renderer dependencies installed at `preview/node_modules/`. No application dependency changes are needed. The render writes `output/dashboard-loader-16x9-v2.mp4`; V1 outputs are preserved.

The original 0.5-second opening hold and 2.066667-second entrance are unchanged. The bird stays in its center-hover behavior for 1.5 seconds after arrival. The existing seeded hover normally lasts 1.250604 seconds, so the isolated v2 scene extends its deadline through the 0.6-second fade. Wing effort, body orientation, tail motion and scheduled gestures retain their production behavior. Nothing exits or lands in an avatar.

The synchronized fade starts at 4.066667 seconds. The bird canvas, particles, halo and gradient backdrop fade out while the original wordmark moves from 78% height to frame center. At 4.666667 seconds, only the wordmark is visible at (960, 540) on solid `#080b0a`. The closing hold is 0.5 seconds. Total: 5.166667 seconds, 310 frames, silent 1920 x 1080 / 60 fps.

Studio: run `npm --prefix preview/v2 run preview` after checking port 3318. Review at `http://localhost:3318/#project/v2`. Focused verification commands are `node scripts/verify-browser-v2.mjs`, `node scripts/verify-studio-v2.mjs`, `python scripts/verify-media-v2.py`, `node scripts/verify-playback-v2.mjs` and `node scripts/verify-preservation-v2.mjs`, all from the parent work-item directory. Browser comparison temporarily uses free port 3319; Studio verification expects 3318. Python checks need Pillow. Preservation verification requires the original repository.

Current status and evidence are in [the v2 plan](../../records/v2/plan.md) and [verification notes](../../records/v2/verification.md). Restore manifests only when intentionally reconstructing a preview; preserve any later Studio edits first.
