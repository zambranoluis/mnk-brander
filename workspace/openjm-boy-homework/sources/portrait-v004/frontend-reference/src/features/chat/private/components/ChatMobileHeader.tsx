"use client";

import React from "react";
import type { ChatIntroPhase } from "@/features/chat/private/hooks/useChatSurfaceIntro";
import { Icon } from "@/components/ui";
import styles from "@/features/chat/private/styles/ChatMobileHeader.module.css";

type ChatMobileHeaderProps = {
  title: string;
  description: string;
  onBack?: () => void;
  onMenu?: () => void;
  backAriaLabel: string;
  menuAriaLabel: string;
  introPhase?: ChatIntroPhase;
};

export default function ChatMobileHeader({
  title,
  description,
  onBack,
  onMenu,
  backAriaLabel,
  menuAriaLabel,
  introPhase,
}: ChatMobileHeaderProps) {
  return (
    <header
      className={styles.root}
      data-chat-intro-phase={introPhase}
    >
      <button
        className={styles.button}
        type="button"
        onClick={onBack}
        aria-label={backAriaLabel}
      >
        <Icon name="chevronLineDown" className={styles.backIcon} aria-hidden="true" />
      </button>

      <div className={styles.copy}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <button
        className={styles.button}
        type="button"
        onClick={onMenu}
        aria-label={menuAriaLabel}
      >
        <Icon name="menu" className={styles.menuIcon} aria-hidden="true" />
      </button>
    </header>
  );
}
