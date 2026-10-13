"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui";
import type {
  ComposerActionSurfacesController,
  ComposerMenuAction,
  ComposerMode,
} from "@/features/chat/hooks/useComposerActionSurfaces";
import styles from "@/features/chat/styles/ComposerActionSurfaces.module.css";

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';

const subscribeToPortalReady = () => () => undefined;
const getPortalReadySnapshot = () => true;
const getPortalReadyServerSnapshot = () => false;

type ComposerActionSurfacesProps = {
  controller: ComposerActionSurfacesController;
  surfacesRef: (node: HTMLDivElement | null) => void;
  isMobile: boolean;
  menuId: string;
  menuLabel: string;
  actions: readonly ComposerMenuAction[];
  modes: readonly ComposerMode[];
};

// Renders the composer's actions menu and the settings window of the selected
// mode. Desktop surfaces sit inside the composer, above it; mobile surfaces are
// bottom sheets over a backdrop.
export default function ComposerActionSurfaces({
  controller,
  surfacesRef,
  isMobile,
  menuId,
  menuLabel,
  actions,
  modes,
}: ComposerActionSurfacesProps) {
  const isPortalReady = useSyncExternalStore(
    subscribeToPortalReady,
    getPortalReadySnapshot,
    getPortalReadyServerSnapshot,
  );

  const surfaces = (
    <>
      <ComposerActionsMenu
        id={menuId}
        label={menuLabel}
        isOpen={controller.isMenuOpen}
        initialFocus={controller.menuInitialFocus}
        actions={actions}
        modes={modes}
        onSelectAction={controller.selectAction}
        onSelectMode={controller.selectMode}
      />
      {controller.settingsMode ? (
        <ComposerSettingsWindow
          mode={controller.settingsMode}
          isOpen={controller.isSettingsOpen}
          isModal={isMobile}
          onClose={() => controller.closeSettings(true)}
          onTurnOff={controller.turnOffSettingsMode}
        />
      ) : null}
    </>
  );

  if (!isMobile) {
    return (
      <DesktopSurfaceLayer
        onElement={surfacesRef}
        isActive={controller.isAnyOpen}
      >
        {surfaces}
      </DesktopSurfaceLayer>
    );
  }

  if (!isPortalReady) {
    return null;
  }

  return createPortal(
    <div
      ref={surfacesRef}
      className={`${styles.mobileRoot} ${
        controller.isAnyOpen ? styles.mobileRootOpen : ""
      }`.trim()}
    >
      <button
        className={styles.backdrop}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => controller.closeAll(true)}
      />
      {surfaces}
    </div>,
    document.body,
  );
}

function DesktopSurfaceLayer({
  onElement,
  isActive,
  children,
}: {
  onElement: (node: HTMLDivElement | null) => void;
  isActive: boolean;
  children: ReactNode;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const setLayerElement = useCallback(
    (node: HTMLDivElement | null) => {
      layerRef.current = node;
      onElement(node);
    },
    [onElement],
  );

  // The window may use the space between the composer and the top of the chat
  // frame, below any page chrome marked as a ceiling. It is measured when that
  // space can change, not on every frame.
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!isActive || !layer) {
      return;
    }

    const bounds =
      layer.closest<HTMLElement>("[data-chat-actions-bounds]") ??
      document.documentElement;
    const anchor = layer.parentElement ?? layer;
    const ceiling = document.querySelector<HTMLElement>(
      "[data-chat-actions-ceiling]",
    );

    const measure = () => {
      const inset = Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize,
      );
      const top = Math.max(
        bounds.getBoundingClientRect().top,
        ceiling?.getBoundingClientRect().bottom ?? -Infinity,
      );
      const available =
        layer.getBoundingClientRect().bottom -
        top -
        (Number.isFinite(inset) ? inset : 16);
      layer.style.setProperty(
        "--composer-surface-max-height",
        `${Math.max(0, Math.floor(available))}px`,
      );
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(bounds);
    resizeObserver.observe(anchor);
    if (ceiling) {
      resizeObserver.observe(ceiling);
    }
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isActive]);

  return (
    <div ref={setLayerElement} className={styles.desktopLayer}>
      {children}
    </div>
  );
}

function ComposerActionsMenu({
  id,
  label,
  isOpen,
  initialFocus,
  actions,
  modes,
  onSelectAction,
  onSelectMode,
}: {
  id: string;
  label: string;
  isOpen: boolean;
  initialFocus: "first" | "last";
  actions: readonly ComposerMenuAction[];
  modes: readonly ComposerMode[];
  onSelectAction: (action: ComposerMenuAction) => void;
  onSelectMode: (mode: ComposerMode) => void;
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = actions.length + modes.length;

  useEffect(() => {
    if (!isOpen || itemCount === 0) {
      return;
    }

    itemRefs.current[initialFocus === "last" ? itemCount - 1 : 0]?.focus({
      preventScroll: true,
    });
  }, [initialFocus, isOpen, itemCount]);

  const focusItem = (index: number) => {
    itemRefs.current[((index % itemCount) + itemCount) % itemCount]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextIndex =
      event.key === "ArrowDown"
        ? activeIndex + 1
        : event.key === "ArrowUp"
          ? activeIndex - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? itemCount - 1
              : null;
    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    focusItem(nextIndex);
  };

  const itemProps = (index: number) => ({
    ref: (node: HTMLButtonElement | null) => {
      itemRefs.current[index] = node;
    },
    className: styles.menuItem,
    type: "button" as const,
    tabIndex: activeIndex === index ? 0 : -1,
    onFocus: () => setActiveIndex(index),
  });

  return (
    <div
      id={id}
      className={`${styles.surface} ${styles.menu} scrollbar ${
        isOpen ? styles.surfaceOpen : ""
      }`.trim()}
      role="menu"
      aria-label={label}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      data-pw="composer-actions-menu"
      onKeyDown={handleKeyDown}
    >
      {actions.map((action, index) => (
        <button
          key={action.id}
          {...itemProps(index)}
          role="menuitem"
          onClick={() => onSelectAction(action)}
        >
          <span className={styles.menuItemIcon} aria-hidden="true">
            {action.icon}
          </span>
          <span className={styles.menuItemLabel}>{action.label}</span>
        </button>
      ))}

      {actions.length > 0 && modes.length > 0 ? (
        <div className={styles.menuSeparator} role="separator" />
      ) : null}

      {modes.map((mode, modeIndex) => (
        <button
          key={mode.id}
          {...itemProps(actions.length + modeIndex)}
          role="menuitemcheckbox"
          aria-checked={mode.isActive}
          aria-disabled={mode.isDisabled ? true : undefined}
          aria-haspopup={mode.settings ? "dialog" : undefined}
          onClick={() => onSelectMode(mode)}
        >
          <span className={styles.menuItemIcon} aria-hidden="true">
            {mode.icon}
          </span>
          <span className={styles.menuItemLabel}>{mode.label}</span>
          <Icon
            name="check"
            className={styles.menuItemCheck}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

function ComposerSettingsWindow({
  mode,
  isOpen,
  isModal,
  onClose,
  onTurnOff,
}: {
  mode: ComposerMode;
  isOpen: boolean;
  isModal: boolean;
  onClose: () => void;
  onTurnOff: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = useId();
  const windowRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const settings = mode.settings;

  // Desktop starts on the selected option so arrow keys work at once; the
  // mobile sheet starts on Close so no field raises the on-screen keyboard.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    bodyRef.current?.scrollTo({ top: 0 });
    const selectedOption = isModal
      ? null
      : bodyRef.current?.querySelector<HTMLElement>(
          '[role="radio"][aria-checked="true"]:not(:disabled)',
        );
    (selectedOption ?? closeButtonRef.current)?.focus({ preventScroll: true });
  }, [isModal, isOpen, mode.id]);

  if (!settings) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isModal || event.key !== "Tab" || !windowRef.current) {
      return;
    }

    const focusable = Array.from(
      windowRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={windowRef}
      className={`${styles.surface} ${styles.window} ${
        isOpen ? styles.surfaceOpen : ""
      }`.trim()}
      role="dialog"
      aria-modal={isModal ? true : undefined}
      aria-label={settings.dialogLabel}
      aria-labelledby={settings.dialogLabel ? undefined : titleId}
      aria-describedby={settings.description ? descriptionId : undefined}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      data-pw="composer-settings-window"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.windowHeader}>
        <div className={styles.windowTitles}>
          <h2 id={titleId} className={styles.windowTitle}>
            {settings.title}
          </h2>
          {settings.description ? (
            <p id={descriptionId} className={styles.windowDescription}>
              {settings.description}
            </p>
          ) : null}
        </div>
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          aria-label={t("home.composer.settingsClose")}
          onClick={onClose}
        >
          <Icon name="exit" className={styles.closeIcon} aria-hidden="true" />
        </button>
      </div>

      <div ref={bodyRef} className={`${styles.windowBody} scrollbar`}>
        {settings.content}
      </div>

      <div className={styles.windowFooter}>
        <button className={styles.quietButton} type="button" onClick={onTurnOff}>
          {t("home.composer.settingsTurnOff", { mode: mode.label })}
        </button>
        <button className={styles.primaryButton} type="button" onClick={onClose}>
          {t("home.composer.settingsDone")}
        </button>
      </div>
    </div>
  );
}
