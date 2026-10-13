import type { MorphMode } from "@/features/morph/types/morph";

export function resolveChatMorphMode(
  hasActiveWork: boolean,
  isMusicPlaying: boolean,
  previewMode: MorphMode | null,
  restingMode: MorphMode,
): MorphMode {
  // Work always takes visual priority, then a playing song. The resting mode
  // communicates the selected tool only after the current turn has reached a
  // terminal state and no song is playing.
  if (hasActiveWork) {
    return "working";
  }

  return isMusicPlaying ? "playing" : previewMode ?? restingMode;
}
