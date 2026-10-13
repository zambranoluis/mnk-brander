"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  FaDownload,
  FaExclamationTriangle,
  FaMusic,
  FaPause,
  FaPlay,
  FaSyncAlt,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import type { MusicJob } from "./contract";
import { musicBlob } from "./services";
import { primeMusicAnalysis, releaseMusicPlayback, startMusicPlayback, stopMusicPlayback } from "./playback";
import MusicGenerationPlaceholder from "./MusicGenerationPlaceholder";
import styles from "./Music.module.css";

const waveBars = Array.from({ length: 48 }, (_, index) => index);
const waveformStyle = (height: number) => ({ "--bar": `${height}px` } as CSSProperties);

function formatTime(seconds: number) {
  return !Number.isFinite(seconds) || seconds < 0 ? "0:00" : `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

type MusicCardProps = {
  job: MusicJob;
  error?: string;
  onRefresh: () => void;
  showPrompt?: boolean;
  formatTimestamp?: (value: string) => string;
  copyButtonLabel?: string;
  copiedButtonLabel?: string;
};

export default function MusicCard({ job, error, onRefresh, showPrompt = true, formatTimestamp, copyButtonLabel, copiedButtonLabel }: MusicCardProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrubbing = useRef(false);
  const resource = useRef<{ url?: string; controller?: AbortController }>({});
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playWhenReady, setPlayWhenReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const completed = job.status === "completed";

  useEffect(() => {
    const owned = resource.current;
    return () => { owned.controller?.abort(); if (owned.url) URL.revokeObjectURL(owned.url); };
  }, [job.id]);
  useEffect(() => { if (audioRef.current) { audioRef.current.volume = volume; audioRef.current.muted = muted; } }, [muted, volume]);
  useEffect(() => {
    const audio = audioRef.current;
    return () => { if (audio) releaseMusicPlayback(audio); };
  }, [completed]);
  useEffect(() => {
    if (!url || !playWhenReady || !audioRef.current) return;
    void audioRef.current.play().catch(() => setPlaybackError(true));
    setPlayWhenReady(false);
  }, [playWhenReady, url]);

  async function loadAudio() {
    if (resource.current.url) return resource.current.url;
    resource.current.controller?.abort();
    const controller = new AbortController();
    resource.current.controller = controller;
    setLoading(true); setPlaybackError(false);
    try {
      const blob = await musicBlob(job.id, job.jobToken, controller.signal);
      if (controller.signal.aborted) return null;
      const next = URL.createObjectURL(blob);
      resource.current.url = next;
      setUrl(next);
      return next;
    } catch {
      if (!controller.signal.aborted) setPlaybackError(true);
      return null;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); return; }
    primeMusicAnalysis();
    setPlayWhenReady(true);
    if (!url) {
      const loaded = await loadAudio();
      if (!loaded) setPlayWhenReady(false);
    }
  }

  async function download() {
    const downloadUrl = url ?? await loadAudio();
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${job.id}.flac`;
    link.click();
  }

  function seekTo(next: number) {
    const duration = audioRef.current?.duration;
    const limit = Number.isFinite(duration) && duration && duration > 0 ? duration : visibleDuration;
    const target = Math.max(0, Math.min(next, limit));
    if (audioRef.current) audioRef.current.currentTime = target;
    setCurrentTime(target);
  }

  function seekFromPointer(event: PointerEvent<HTMLInputElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !visibleDuration) return;
    seekTo(((event.clientX - bounds.left) / bounds.width) * visibleDuration);
  }

  function beginScrub(event: PointerEvent<HTMLInputElement>) {
    if (!url || !visibleDuration) return;
    event.preventDefault();
    scrubbing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromPointer(event);
  }

  function endScrub(event: PointerEvent<HTMLInputElement>) {
    if (!scrubbing.current) return;
    seekFromPointer(event);
    scrubbing.current = false;
  }

  async function copyLyrics() {
    if (job.lyrics === null) return;
    try {
      await navigator.clipboard.writeText(job.lyrics);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* Clipboard access may be unavailable in the current browser context. */ }
  }

  const active = job.submission === "submitting" || (job.submission === "accepted" && job.status !== "completed" && job.status !== "failed");
  const visibleDuration = Number.isFinite(audioDuration) && audioDuration > 0 ? audioDuration : job.duration || 0;
  const activeBarCount = visibleDuration ? Math.ceil((currentTime / visibleDuration) * waveBars.length) : 0;
  const statusKey = job.submission === "accepted" ? job.status : job.submission;
  const stateLabel = t(`music.states.${statusKey}`);
  const facts = [
    ...(visibleDuration ? [{ key: "duration", label: formatTime(visibleDuration) }] : []),
    ...(job.lyrics === null ? [] : [{ key: "lyrics", label: t(job.lyrics ? "music.withLyrics" : "music.instrumental") }]),
    ...(job.model ? [{ key: "model", label: job.model, quiet: true }] : []),
  ];
  const copyLabel = copied ? copiedButtonLabel ?? t("home.response.copiedButton", { defaultValue: "Copied" }) : copyButtonLabel ?? t("home.response.copyButton", { defaultValue: "Copy" });

  return <article className={styles.card} aria-label={t("music.song")}>
    {showPrompt && <p className={styles.prompt}>{job.prompt}</p>}
    {!completed ? <section className={styles.placeholder}>
      <MusicGenerationPlaceholder label={stateLabel} active={active} />
      <div className={styles.generationContent}>
        <h2 className={styles.generationHeading}><FaMusic aria-hidden="true" /> {t("music.song")}</h2>
        <div className={styles.status} role="status" aria-live="polite">
          <span className={styles.srOnly}>{stateLabel}</span>
          {job.submission === "uncertain" && <p className={styles.notice}>{t("music.uncertainNotice")}</p>}
          {error && <p className={styles.error} role="alert"><FaExclamationTriangle aria-hidden="true" /> {t(`music.errors.${error}`, { defaultValue: t("music.error") })}</p>}
        </div>
        {(job.requestId || job.jobToken) && job.status !== "failed" && <button className={styles.refresh} type="button" onClick={onRefresh}><FaSyncAlt aria-hidden="true" /> {t("music.refresh")}</button>}
      </div>
    </section> : <>
      <section className={styles.player}>
        <header className={styles.playerHeading}>
          <h2><FaMusic aria-hidden="true" /> {t("music.song")}</h2>
          {facts.length > 0 && <p className={styles.facts}>{facts.map((fact, index) => <span key={fact.key} className={fact.quiet ? styles.factQuiet : undefined}>{index > 0 && <span className={styles.factSeparator} aria-hidden="true">·</span>}{fact.label}</span>)}</p>}
        </header>
        <button className={styles.play} type="button" onClick={() => void togglePlayback()} disabled={loading} aria-label={playing ? "Pause" : "Play"}>{playing ? <FaPause aria-hidden="true" /> : <FaPlay className={styles.playIcon} aria-hidden="true" />}</button>
        <div className={styles.waveformProgress}>
          <div className={styles.waveformControl}>
            <div className={styles.playbackWave} aria-hidden="true">{waveBars.map((bar) => <span key={bar} className={bar < activeBarCount ? styles.waveActive : undefined} style={waveformStyle(10 + (bar * 13) % 30)} />)}</div>
            <input className={styles.waveSeek} type="range" min="0" max={visibleDuration || 1} step="0.1" value={Math.min(currentTime, visibleDuration || 1)} onChange={(event) => seekTo(Number(event.target.value))} onPointerDown={beginScrub} onPointerMove={(event) => { if (scrubbing.current) seekFromPointer(event); }} onPointerUp={endScrub} onPointerCancel={() => { scrubbing.current = false; }} onLostPointerCapture={() => { scrubbing.current = false; }} aria-label="Audio progress" disabled={!url || !visibleDuration} />
          </div>
          <span className={styles.time}><span>{formatTime(currentTime)}</span><span>{formatTime(visibleDuration)}</span></span>
        </div>
        <button className={styles.volumeButton} type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <FaVolumeMute aria-hidden="true" /> : <FaVolumeUp aria-hidden="true" />}</button>
        <input className={styles.volume} type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" />
        <button className={styles.download} type="button" disabled={loading} aria-busy={loading} title={t("music.download")} onClick={() => void download()}>
          <span className={styles.downloadChip}>{loading ? <FaSyncAlt className={styles.spin} aria-hidden="true" /> : <FaDownload aria-hidden="true" />}<span className={styles.srOnly}>{t(loading ? "music.loading" : "music.download")} </span><span>FLAC</span></span>
        </button>
        {playbackError && <p className={`${styles.error} ${styles.playerError}`} role="alert"><FaExclamationTriangle aria-hidden="true" /> {t("music.playbackError")}</p>}
        <audio ref={audioRef} src={url ?? undefined} preload="metadata" onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)} onTimeUpdate={(event) => { if (!scrubbing.current) setCurrentTime(event.currentTarget.currentTime); }} onPlay={(event) => { setPlaying(true); startMusicPlayback(event.currentTarget); }} onPause={(event) => { setPlaying(false); stopMusicPlayback(event.currentTarget); }} onEnded={(event) => { setPlaying(false); stopMusicPlayback(event.currentTarget); }} onError={() => setPlaybackError(true)} />
      </section>
      {(job.priceCents !== null || job.lyrics !== null) && <section className={styles.musicDetails}>
        {job.priceCents !== null && <p className={styles.metadata}>{t("music.quote", { cents: job.priceCents })}</p>}
        {job.lyrics !== null && <details className={styles.lyrics} open><summary>{t("music.lyrics")}</summary><pre>{job.lyrics || t("music.instrumental")}</pre></details>}
      </section>}
      <footer className={styles.responseFooter}>
        {job.lyrics !== null && <button type="button" className={styles.copyLyrics} onClick={() => void copyLyrics()}>{copyLabel}</button>}
        {job.createdAt && formatTimestamp && <time dateTime={job.createdAt}>{formatTimestamp(job.createdAt)}</time>}
      </footer>
    </>}
  </article>;
}
