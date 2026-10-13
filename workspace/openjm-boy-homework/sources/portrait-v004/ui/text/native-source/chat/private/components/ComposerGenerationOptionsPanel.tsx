"use client";

import {
  useId,
  type CSSProperties,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import NegativePromptField from "@/features/chat/components/NegativePromptField";
import type { ConversationReasoningIntensity } from "@/features/chat/private/hooks/conversations/useConversationReasoningPreference";
import {
  imageGenerationParametersForIntensity,
  type ImageGenerationParameterOverrides,
} from "@/features/chat/private/services/images";
import { VIDEO_GENERATION_AVAILABLE, type VideoGenerationOptions } from "@/features/chat/private/services/videos";
import styles from "@/features/chat/private/styles/ComposerGenerationOptionsPanel.module.css";

export type ImageGenerationOptions = ImageGenerationParameterOverrides & {
  size: string;
};

export const DEFAULT_IMAGE_GENERATION_OPTIONS: ImageGenerationOptions = {
  size: "1080x1080",
  steps: null,
  seed: null,
};

const IMAGE_SIZE_OPTIONS = [
  { value: "1080x1080", label: "Social post", format: "1:1", description: "Instagram, Facebook", previewWidth: "2.25rem", previewHeight: "2.25rem" },
  { value: "1024x1280", label: "Social feed", format: "4:5", description: "Instagram feed", previewWidth: "1.8rem", previewHeight: "2.25rem" },
  { value: "1080x1440", label: "Social portrait", format: "3:4", description: "Social campaigns", previewWidth: "1.69rem", previewHeight: "2.25rem" },
  { value: "1528x800", label: "Link preview", format: "1.91:1", description: "Facebook, LinkedIn, X", previewWidth: "2.7rem", previewHeight: "1.41rem" },
  { value: "864x1536", label: "Stories & Reels", format: "9:16", description: "Instagram, TikTok, YouTube", previewWidth: "1.27rem", previewHeight: "2.25rem" },
  { value: "1536x864", label: "Wallpaper & video", format: "16:9", description: "Desktop, video, slides", previewWidth: "2.7rem", previewHeight: "1.52rem" },
] as const;

const VIDEO_ASPECT_RATIO_OPTIONS = [
  { value: "16:9", label: "Landscape", format: "16:9", description: "Desktop, video, slides", previewWidth: "2.7rem", previewHeight: "1.52rem" },
  { value: "9:16", label: "Portrait", format: "9:16", description: "Stories, reels, mobile", previewWidth: "1.27rem", previewHeight: "2.25rem" },
  { value: "1:1", label: "Square", format: "1:1", description: "Social posts and feeds", previewWidth: "2.25rem", previewHeight: "2.25rem" },
] as const;

const VIDEO_QUALITY_OPTIONS = [
  { value: "fast", label: "Fast", description: "Prioritize render speed" },
  { value: "quality", label: "Quality", description: "Balanced detail and speed" },
  { value: "cinema", label: "Cinema", description: "Prioritize visual fidelity" },
] as const;

const VIDEO_MODE_OPTIONS = [
  { value: "clip", label: "Clip", description: "One continuous take" },
  { value: "film", label: "Film", description: "Planned shots" },
] as const;

type ComposerGenerationOptionsPanelProps =
  | {
      mode: "image";
      disabled?: boolean;
      imageOptions: ImageGenerationOptions;
      onImageOptionsChange: (options: ImageGenerationOptions) => void;
      intensity: ConversationReasoningIntensity;
      showAdvancedOptions?: boolean;
      negativePrompt: string;
      onNegativePromptChange: (value: string) => void;
    }
  | {
      mode: "video";
      disabled?: boolean;
      videoOptions: VideoGenerationOptions;
      onVideoOptionsChange: (options: VideoGenerationOptions) => void;
    };

export const GENERATION_MODE_COPY = {
  image: {
    title: "Image generation",
    description: "Generate an image from your prompt.",
  },
  video: {
    title: "Video generation",
    description: "Video generation is coming soon.",
  },
} as const;

export function describeImageGenerationOptions(options: ImageGenerationOptions) {
  const size = IMAGE_SIZE_OPTIONS.find((option) => option.value === options.size);
  return size ? `${size.label} ${size.format}` : options.size;
}

export function describeVideoGenerationOptions(options: VideoGenerationOptions) {
  return `${options.aspectRatio} · ${options.duration} s`;
}

function isValidStepCount(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 100;
}

function isValidSeed(value: number) {
  return Number.isSafeInteger(value);
}

export default function ComposerGenerationOptionsPanel(
  props: ComposerGenerationOptionsPanelProps,
) {
  const numericFieldsHelpId = useId();
  const isImageMode = props.mode === "image";
  const isVideoMode = props.mode === "video";
  const intelligenceParameters = isImageMode
    ? imageGenerationParametersForIntensity(props.intensity)
    : null;
  const imageOptions = isImageMode ? props.imageOptions : null;
  const defaultSteps = intelligenceParameters?.steps ?? "";
  const defaultSeed = intelligenceParameters?.seed ?? "";
  const effectiveSteps = imageOptions?.steps ?? defaultSteps;
  const effectiveSeed = imageOptions?.seed ?? defaultSeed;
  const selectedVideoAspectRatioOption = props.mode === "video"
    ? VIDEO_ASPECT_RATIO_OPTIONS.find(
        (option) => option.value === props.videoOptions.aspectRatio,
      ) ?? VIDEO_ASPECT_RATIO_OPTIONS[0]
    : VIDEO_ASPECT_RATIO_OPTIONS[0];
  const handleStepsChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isImageMode) {
      return;
    }

    const rawValue = event.target.value.trim();
    if (rawValue.length === 0) return;

    const value = Number(rawValue);
    if (isValidStepCount(value)) {
      props.onImageOptionsChange({ ...props.imageOptions, steps: value });
    }
  };

  const handleStepsBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!isImageMode) return;

    const rawValue = event.target.value.trim();
    if (rawValue.length === 0 || !isValidStepCount(Number(rawValue))) {
      props.onImageOptionsChange({ ...props.imageOptions, steps: null });
      event.currentTarget.value = String(defaultSteps);
    }
  };

  const handleSeedChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isImageMode) {
      return;
    }

    const rawValue = event.target.value.trim();
    if (rawValue.length === 0) return;

    const value = Number(rawValue);
    if (isValidSeed(value)) {
      props.onImageOptionsChange({ ...props.imageOptions, seed: value });
    }
  };

  const handleSeedBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!isImageMode) return;

    const rawValue = event.target.value.trim();
    if (rawValue.length === 0 || !isValidSeed(Number(rawValue))) {
      props.onImageOptionsChange({ ...props.imageOptions, seed: null });
      event.currentTarget.value = String(defaultSeed);
    }
  };

  const updateVideo = (next: Partial<VideoGenerationOptions>) => {
    if (isVideoMode) props.onVideoOptionsChange({ ...props.videoOptions, ...next });
  };

  return (
    <div className={styles.panel}>
      {isImageMode ? (
        <div className={styles.imageSettings}>
          <div>
            <p className={styles.sectionLabel}>Image size</p>
            <div
              className={styles.imageSizeOptions}
              role="radiogroup"
              aria-label="Image size"
            >
              {IMAGE_SIZE_OPTIONS.map((option) => {
                const isSelected = props.imageOptions.size === option.value;
                return (
                  <button
                    key={option.value}
                    className={`${styles.imageSizeOption} ${
                      isSelected ? styles.imageSizeOptionSelected : ""
                    }`.trim()}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={props.disabled}
                    onClick={() =>
                      props.onImageOptionsChange({
                        ...props.imageOptions,
                        size: option.value,
                      })
                    }
                  >
                    <span
                      className={styles.imageSizePreview}
                      aria-hidden="true"
                    >
                      <span
                        className={styles.imageSizePreviewFrame}
                        style={
                          {
                            "--image-size-preview-width": option.previewWidth,
                            "--image-size-preview-height": option.previewHeight,
                          } as CSSProperties
                        }
                      />
                    </span>
                    <span className={styles.imageSizeOptionLabel}>{option.label}</span>
                    <span className={styles.imageSizeOptionFormat}>{option.format}</span>
                    <span className={styles.screenReaderOnly}>{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {props.showAdvancedOptions !== false ? <div className={styles.numericFields}>
            <label className={styles.field}>
              <span>Steps</span>
              <input
                key={`steps-${props.intensity}`}
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                step={1}
                defaultValue={effectiveSteps}
                disabled={props.disabled}
                onChange={handleStepsChange}
                onBlur={handleStepsBlur}
                aria-describedby={numericFieldsHelpId}
              />
            </label>

            <label className={styles.field}>
              <span>Seed</span>
              <input
                key={`seed-${props.intensity}`}
                type="number"
                inputMode="numeric"
                step={1}
                defaultValue={effectiveSeed}
                placeholder="Random"
                disabled={props.disabled}
                onChange={handleSeedChange}
                onBlur={handleSeedBlur}
                aria-describedby={numericFieldsHelpId}
              />
            </label>
            <small id={numericFieldsHelpId} className={styles.numericFieldsHelp}>
              Intelligence level sets these values by default. Typing custom values overrides default values.
            </small>
          </div> : null}

          <NegativePromptField
            value={props.negativePrompt}
            onChange={props.onNegativePromptChange}
            disabled={props.disabled}
          />
        </div>
      ) : null}

      {isVideoMode ? (
        <div className={styles.videoSettings}>
          <div className={styles.numericFields}>
            <label className={styles.field}>
              <span>Duration (seconds)</span>
              <input type="number" inputMode="decimal" min={1} max={170} step={1} value={props.videoOptions.duration} disabled={props.disabled || !VIDEO_GENERATION_AVAILABLE} onChange={(event) => {
                const duration = Number(event.target.value);
                if (Number.isFinite(duration)) updateVideo({ duration: Math.min(170, Math.max(1, duration)) });
              }} />
            </label>
            <label className={styles.field}>
              <span>Seed</span>
              <input type="number" inputMode="numeric" step={1} value={props.videoOptions.seed ?? ""} placeholder="Random" disabled={props.disabled || !VIDEO_GENERATION_AVAILABLE} onChange={(event) => {
                const raw = event.target.value.trim();
                updateVideo({ seed: raw === "" ? null : (isValidSeed(Number(raw)) ? Number(raw) : props.videoOptions.seed) });
              }} />
            </label>
          </div>
          <div className={styles.selectField}>
            <span>Aspect ratio</span>
            <div className={styles.videoAspectRatioOptions} role="radiogroup" aria-label="Aspect ratio">
              {VIDEO_ASPECT_RATIO_OPTIONS.map((option) => {
                const isSelected = props.videoOptions.aspectRatio === option.value;
                return <button key={option.value} className={`${styles.videoAspectRatioOption} ${isSelected ? styles.videoOptionSelected : ""}`.trim()} type="button" role="radio" aria-checked={isSelected} disabled={props.disabled || !VIDEO_GENERATION_AVAILABLE} onClick={() => updateVideo({ aspectRatio: option.value })}>
                  <span className={styles.videoAspectRatioPreview} aria-hidden="true"><span className={styles.videoAspectRatioPreviewFrame} style={{ "--video-aspect-preview-width": option.previewWidth, "--video-aspect-preview-height": option.previewHeight } as CSSProperties} /></span>
                  <span className={styles.videoAspectRatioOptionLabel}>{option.label}</span>
                  <span className={styles.videoAspectRatioOptionFormat}>{option.format}</span>
                  <span className={styles.screenReaderOnly}>{option.description}</span>
                </button>;
              })}
            </div>
            <p className={styles.videoAspectRatioSummary}>{selectedVideoAspectRatioOption.description}</p>
          </div>
          <div className={styles.selectField}>
            <span>Quality</span>
            <div className={styles.videoOptionGrid} role="radiogroup" aria-label="Quality">
              {VIDEO_QUALITY_OPTIONS.map((option) => {
                const isSelected = props.videoOptions.quality === option.value;
                return <button key={option.value} className={`${styles.videoOption} ${isSelected ? styles.videoOptionSelected : ""}`.trim()} type="button" role="radio" aria-checked={isSelected} disabled={props.disabled || !VIDEO_GENERATION_AVAILABLE} onClick={() => updateVideo({ quality: option.value })}><span>{option.label}</span><small>{option.description}</small></button>;
              })}
            </div>
          </div>
          <div className={styles.selectField}>
            <span>Mode</span>
            <div className={styles.videoOptionGrid} role="radiogroup" aria-label="Mode">
              {VIDEO_MODE_OPTIONS.map((option) => {
                const isSelected = props.videoOptions.mode === option.value;
                return <button key={option.value} className={`${styles.videoOption} ${isSelected ? styles.videoOptionSelected : ""}`.trim()} type="button" role="radio" aria-checked={isSelected} disabled={props.disabled || !VIDEO_GENERATION_AVAILABLE} onClick={() => updateVideo({ mode: option.value })}><span>{option.label}</span><small>{option.description}</small></button>;
              })}
            </div>
          </div>
          <label className={styles.audioField}>
            <input type="checkbox" checked={props.videoOptions.audio} disabled={props.disabled || !VIDEO_GENERATION_AVAILABLE} onChange={(event) => updateVideo({ audio: event.target.checked })} />
            <span>Generate audio when available</span>
          </label>
          <small className={styles.numericFieldsHelp}>OpenJM selects the model and render settings. Audio or film may be unavailable for this account.</small>
        </div>
      ) : null}
    </div>
  );
}
