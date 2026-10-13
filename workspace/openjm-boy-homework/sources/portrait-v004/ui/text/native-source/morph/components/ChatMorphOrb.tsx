"use client";

import ChatMorphCanvas from "@/features/morph/components/ChatMorphCanvas";
import type { MorphRenderTarget } from "@/features/morph/components/ChatMorphCanvas";
import { CHAT_MORPH_MODES } from "@/features/morph/constants/chatMorphPreset";
import type { MorphAudioFrame, MorphMode } from "@/features/morph/types/morph";

type ChatMorphOrbProps = {
  mode?: MorphMode;
  renderTarget?: MorphRenderTarget;
  readAudioFrame?: (nowMs: number) => MorphAudioFrame | null;
};

export default function ChatMorphOrb({
  mode = "standby",
  renderTarget,
  readAudioFrame,
}: ChatMorphOrbProps) {
  return (
    <ChatMorphCanvas
      mode={mode}
      presets={CHAT_MORPH_MODES}
      ariaHidden
      renderTarget={renderTarget}
      readAudioFrame={readAudioFrame}
    />
  );
}
