"use client";
import { useId, useRef, type ComponentType, type KeyboardEvent, type ReactNode } from "react";
import { FaCog, FaInfoCircle, FaMusic } from "react-icons/fa";
import panelStyles from "@/styles/components/Chats/MusicOptionsPanel.module.css";
import { useTranslation } from "react-i18next";
import type { MusicOptions } from "./contract";
import LanguageSelect from "./LanguageSelect";

const lyricsModes = ["automatic", "custom", "instrumental"] as const;
const lyricsLimit = 8000;

function LyricsModeGroup({ value, onChange, disabled, labelId, describedBy }: {
  value: MusicOptions["lyricsMode"];
  onChange: (value: MusicOptions["lyricsMode"]) => void;
  disabled: boolean;
  labelId: string;
  describedBy: string;
}) {
  const { t } = useTranslation();
  const groupRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = lyricsModes.length - 1;
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % lyricsModes.length
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index + last) % lyricsModes.length
        : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    onChange(lyricsModes[next]);
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };
  return <div ref={groupRef} className={panelStyles.segmented} role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy}>
    {lyricsModes.map((mode, index) => <button
      key={mode}
      type="button"
      role="radio"
      aria-checked={value === mode}
      tabIndex={value === mode ? 0 : -1}
      disabled={disabled}
      onClick={() => onChange(mode)}
      onKeyDown={(event) => handleKeyDown(event, index)}
    >{t(`music.${mode}`)}</button>)}
  </div>;
}

function OptionsCard({ id, icon: Icon, title, description, children }: {
  id: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: "true" }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return <section className={panelStyles.card} aria-labelledby={id}>
    <div className={panelStyles.cardHeader}>
      <Icon className={panelStyles.cardIcon} aria-hidden="true" />
      <div><h3 id={id}>{title}</h3><p>{description}</p></div>
    </div>
    <div className={panelStyles.grid}>{children}</div>
  </section>;
}

// Hint ids derive from the control id, so controls reference them as `${id}-hint`.
function Field({ id, label, hint, wide = false, children }: {
  id: string;
  label: ReactNode;
  hint: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return <div className={wide ? `${panelStyles.field} ${panelStyles.wide}` : panelStyles.field}>
    {label}
    {children}
    <span id={`${id}-hint`} className={panelStyles.hint}>{hint}</span>
  </div>;
}

export function describeMusicOptions(value: MusicOptions, t: (key: string) => string) {
  const lyrics = t(`music.${value.lyricsMode}`);
  return value.duration ? `${lyrics} · ${value.duration} s` : lyrics;
}

export default function MusicOptionsPanel({ value, onChange, disabled = false, publicGeneration = false }: {
  value: MusicOptions;
  onChange: (value: MusicOptions) => void;
  disabled?: boolean;
  publicGeneration?: boolean;
}) {
  const { t } = useTranslation();
  const id = useId();
  const labelFor = (field: string, key: string) => <label htmlFor={`${id}-${field}`} className={panelStyles.label}>{t(key)}</label>;
  const number = (name: "duration" | "steps" | "seed", text: string) => onChange({ ...value, [name]: text === "" ? null : Number(text) });
  return <div className={panelStyles.panel}>
    <div className={panelStyles.body}>
      <fieldset className={panelStyles.fields} disabled={disabled}>
        <legend>{t("music.options")}</legend>
        <OptionsCard id={`${id}-options`} icon={FaMusic} title={t("music.options")} description={t("music.optionsDescription")}>
          <Field id={`${id}-model`} label={labelFor("model", "music.model")} hint={t("music.modelHint")}>
            <span className={panelStyles.inputWithIcon}>
              <input id={`${id}-model`} readOnly value="openjm-music-1" aria-describedby={`${id}-model-hint`} />
              <FaInfoCircle className={panelStyles.inputIcon} aria-hidden="true" title={t("music.modelHint")} />
            </span>
          </Field>
          <Field id={`${id}-lyrics-mode`} label={<span id={`${id}-lyrics-mode-label`} className={panelStyles.label}>{t("music.lyricsMode")}</span>} hint={t("music.lyricsModeHint")}>
            <LyricsModeGroup value={value.lyricsMode} disabled={disabled} labelId={`${id}-lyrics-mode-label`} describedBy={`${id}-lyrics-mode-hint`} onChange={(lyricsMode) => onChange({ ...value, lyricsMode })} />
          </Field>
          {value.lyricsMode === "custom" && <Field id={`${id}-lyrics`} wide label={labelFor("lyrics", "music.lyrics")} hint={t("music.lyricsHint")}>
            <span className={panelStyles.textareaWrap}>
              <textarea id={`${id}-lyrics`} rows={5} maxLength={lyricsLimit} placeholder={t("music.lyricsPlaceholder")} aria-describedby={`${id}-lyrics-hint ${id}-lyrics-count`} value={value.lyrics} onChange={(event) => onChange({ ...value, lyrics: event.target.value })} />
              <span id={`${id}-lyrics-count`} className={panelStyles.counter}>{value.lyrics.length}/{lyricsLimit}</span>
            </span>
          </Field>}
          <Field id={`${id}-duration`} label={labelFor("duration", "music.duration")} hint={<>
            {t("music.durationHint")}
            {publicGeneration && <><br />{t("music.publicDurationNotice")}</>}
          </>}>
            <input id={`${id}-duration`} type="number" min={10} max={600} step="any" inputMode="decimal" aria-describedby={`${id}-duration-hint`} placeholder={t("music.automatic")} value={value.duration ?? ""} onChange={(event) => number("duration", event.target.value)} />
          </Field>
          <LanguageSelect label={t("music.language")} value={value.language} disabled={disabled} describedBy={`${id}-language-hint`} onChange={(language) => onChange({ ...value, language })} hint={<span id={`${id}-language-hint`} className={panelStyles.hint}>{t("music.languageHint")}</span>} />
        </OptionsCard>
        <OptionsCard id={`${id}-advanced`} icon={FaCog} title={t("music.advanced")} description={t("music.advancedDescription")}>
          <Field id={`${id}-steps`} label={labelFor("steps", "music.steps")} hint={t("music.stepsHint")}>
            <input id={`${id}-steps`} type="number" min={1} max={60} step={1} inputMode="numeric" aria-describedby={`${id}-steps-hint`} placeholder={t("music.automatic")} value={value.steps ?? ""} onChange={(event) => number("steps", event.target.value)} />
          </Field>
          <Field id={`${id}-seed`} label={labelFor("seed", "music.seed")} hint={t("music.seedHint")}>
            <input id={`${id}-seed`} type="number" step={1} inputMode="numeric" aria-describedby={`${id}-seed-hint`} placeholder={t("music.random")} value={value.seed ?? ""} onChange={(event) => number("seed", event.target.value)} />
          </Field>
        </OptionsCard>
        <div className={panelStyles.notice}>
          <FaInfoCircle className={panelStyles.noticeIcon} aria-hidden="true" />
          <p><strong>{t("music.generationNoticeTitle")}</strong> {t("music.generationNoticeDetail")}</p>
        </div>
      </fieldset>
    </div>
  </div>;
}
