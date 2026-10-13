# Later presentation — specification only

This stage is prepared, not implemented. The review film remains a separate 24-second silent image-stage sequence.

Use the same four independent illustrations in `artwork/`. [presentation-spec.json](presentation-spec.json) is the editable timing and assignment owner: 1920×1080, 25 fps, exactly 16 seconds / 400 frames.

| Frames (inclusive) | Seconds | Illustration and treatment |
| --- | --- | --- |
| 0–99 | 0–4 | Evaporation: warmth from the sun and a restrained upward path; water vapour stays invisible. |
| 100–199 | 4–8 | Condensation: fine liquid droplets gather into clouds. |
| 200–299 | 8–12 | Precipitation: water falls as rain toward the river catchment. |
| 300–399 | 12–16 | Collection: flow returns through the river to the lake; finish by connecting back to evaporation. |

Keep labels editable. Do not render labels into the source illustrations. Reuse the local files directly; a new generation is unnecessary. Process motion is still to be authored, checked and rendered after the review.

The surrounding dashboard shot must show all 400 frames in one uninterrupted in-player playback, followed by a 50-frame / two-second completed/replay hold. Its minimum is therefore **18 seconds / 450 frames**, before any added request, generation, setup or transition time. Do not cut playback short or stretch the old five-second opening to masquerade as the full cycle.

The preserved request, lyrics and final response remain in [content.json](content.json). Silence remains the default. No song, presentation video, public application player or final assembly was implemented here. Reconcile total film length from the actual later scenes rather than the earlier approximate 72-second direction.

Science reference: [USGS Water Science School](https://water.usgs.gov/edu/watercycle-kids-beg.html), checked for evaporation, condensation, precipitation and runoff during V004 preparation. The arrows are teaching graphics; they do not depict visible vapour.
