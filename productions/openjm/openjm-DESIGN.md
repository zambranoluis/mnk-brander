---
name: OpenJM
description: Calm Intelligence for readable dark workspaces, restrained controls and meaningful green signals.
colors:
  brand-green: "#52B583"
  action-mint: "#19D18C"
  action-hover: "#3CDDA0"
  action-pressed: "#19B87C"
  canvas: "#080B0A"
  panel: "#151A19"
  elevated: "#1A2226"
  field: "#1B2023"
  composer: "#131415"
  text-primary: "#F2F4F3"
  text-secondary: "#A9B5AF"
  text-muted: "#84928B"
  danger: "#F05257"
  warning: "#F0BE48"
  information: "#3E8BFF"
  contextual-violet: "#7B4AE2"
typography:
  body:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  input:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  control:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  metadata:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  section:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.2
  dialog:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.2
  page:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.2
  welcome-small:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.2
  welcome-desktop:
    fontFamily: "Roboto, Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  control: "8px"
  compact: "12px"
  panel: "16px"
  composer: "20px"
  pill: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.action-mint}"
    textColor: "{colors.canvas}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.canvas}"
  button-primary-pressed:
    backgroundColor: "{colors.action-pressed}"
    textColor: "{colors.canvas}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.canvas}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.text-primary}"
    typography: "{typography.input}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  navigation-selected:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.brand-green}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
  chip-selected:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.brand-green}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: "24px"
  dialog:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
  composer:
    backgroundColor: "{colors.composer}"
    textColor: "{colors.text-primary}"
    typography: "{typography.input}"
    rounded: "{rounded.composer}"
---

# Design System: OpenJM

## Overview

**Creative North Star: "Calm Intelligence"**

OpenJM is a readable dark workspace for thinking and doing. Content leads; restrained controls, meaningful green signals and recognizable hummingbird artwork provide identity without competing with the task. Working surfaces prioritize scanability, continuity and clear feedback.

This is the target design standard for correcting inconsistencies and creating coherent surfaces. Its specifications are requirements, not a claim that the application already conforms. The frontmatter defines the canonical color, type, spacing, geometry and component tokens; the guidance below defines their use and behavior.

**Key Characteristics:**

- Readable dark working surfaces with a clear tonal hierarchy.
- Roboto typography and compact, accessible controls.
- Green identity, mint actions and explicit status meaning.
- Recognizable artwork subordinate to conversation and account tasks.
- Responsive panels that preserve context and work in progress.

## Colors

### Identity, action and selection

Use `brand-green` for OpenJM identity, focus and selected navigation cues. Use `action-mint` for the primary action, with `action-hover` and `action-pressed` for its interaction states. Filled mint actions always use the dark `canvas` foreground, including icons. White or primary light text does not provide sufficient contrast for small labels on these fills.

Selection uses a green indicator plus a checkmark, underline, position or explicit selected state. Keep selection distinct from completion: a selected model is not a successful operation. Avoid filling every control with mint; secondary actions use neutral surfaces and primary text.

### Surfaces and text

| Token            | Role                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| `canvas`         | Application ground and dark foreground on bright action fills.                |
| `panel`          | Navigation, supporting panels and grouped working content.                    |
| `elevated`       | Dialogs, menus and surfaces above the working plane.                          |
| `field`          | Editable inputs and selectors.                                                |
| `composer`       | The dark conversation input surface.                                          |
| `text-primary`   | Main content, headings, input values and essential labels.                    |
| `text-secondary` | Supporting explanations and less prominent content.                           |
| `text-muted`     | Metadata and placeholders on dark surfaces; never the sole label for a field. |

### Status and contextual accents

Use `danger` for destructive actions and errors, `warning` for caution, and `information` for informational indicators or chart series. Success uses `brand-green` with a success icon and explicit wording. Destructive filled buttons use `danger` with a dark foreground. Do not use green for destructive actions.

Blue and `contextual-violet` remain contextual accents, such as differentiated chart series or a specific feature marker; they do not replace the brand or universal action color. Use primary light text for accompanying labels on dark surfaces. Violet may fill a badge with primary light text, but must not be used as small text on dark surfaces. Information blue is reserved for non-text indicators on dark surfaces, with separately readable labels.

Require at least 4.5:1 contrast for normal text, 3:1 for large text, and 3:1 for essential non-text boundaries and state cues against adjacent colors. Check actual compositing, including artwork and overlays. Tonal surface differences alone are too subtle to identify controls: use a visible boundary, label or other clear affordance. A `text-muted` border on a dark field is suitable for an essential boundary; decorative dividers can be quieter. Never convey state by color alone.

## Typography

Unexpected application failures have a surface-specific display extension: light Roboto at 44–88px (40–60px mobile), 1.04 line height and -0.035em tracking. Its broad lower-left heading balances the suspended bird-and-ribbon sculpture above it. Supporting copy is 18px on larger screens and 16px on mobile; recovery labels are 15px, with discreet secondary artwork controls and instructions at 13–14px. These scales do not apply to working panels. The detector's frontmatter-only ramp check reports these intentional surface exceptions as advisory.

Use Roboto with Arial and sans-serif fallbacks; provide suitable glyph fallbacks for supported scripts. Body and inputs are 16px, controls 14px and metadata 12px. Section headings are 20px, dialog titles 24px and page headings 28px. Body line-height is 1.6, controls and inputs 1.4, and headings 1.2. Use normal letter spacing and sentence case.

Welcome typography is a contextual exception: 32px on smaller and intermediate screens, 40px on desktop. Do not carry welcome sizing into working panels. Use regular body text and medium headings or controls; bold emphasizes a meaningful distinction rather than every label.

Keep prose within a 65–75 character measure where space allows, inside the conversation width cap. Let narrower screens wrap naturally. Preserve readable code, math, lists and quotations; use a monospace face for code and tabular numerals where values are compared. Avoid forced heading breaks, truncated instructions and fixed-height text boxes. Metadata must not carry an essential instruction that deserves body-size text.

## Layout

Use a fluid application shell and the 4px spacing base with 8, 12, 16, 20, 24, 32, 40 and 48px steps. Prefer 8–12px within a control group, 16–24px within a working section and 32–48px between substantial sections. Working-area gutters are 16px on mobile, 24px at intermediate widths and 32px on desktop. Do not impose 80px gutters on working panels.

| Range                    | Shell and navigation                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Mobile: below 768px      | Single primary surface with history, drawer and explicit back navigation. Supporting response details open as a dialog.       |
| Intermediate: 768–1023px | Keep the compact history/drawer/back model; use the extra width for readable content rather than squeezing in desktop panels. |
| Desktop: from 1024px     | Navigation, history and content may coexist; supporting details may use a side panel. Keep the active task visually primary.  |

Cap the conversation and composer at 800px, including their container padding, while keeping prose readable within that width. Supporting panels must not force the primary task offscreen. Across resizing, preserve the active conversation, draft, attachments, relevant selection and ongoing operation; maintain a meaningful focus destination when a panel changes form.

Reflow controls before truncating essential labels. Use wrapping toolbars or accessible overflow menus for secondary actions. Long titles and localized text may wrap; if a compact history row is truncated, make its complete name accessible. Confine necessary horizontal scrolling to code, tables or media regions, not the entire page.

Account for safe areas and mobile keyboards. Keep the focused input, composer actions and validation reachable with the keyboard open; allow scrolling within tall dialogs and avoid covering content with fixed controls. Support zoom without lost actions or two-dimensional page scrolling.

## Elevation & Depth

Build depth through canvas, panel and elevated tones. Use borders to establish necessary boundaries and restrained shadows only when a menu, dialog or floating surface needs separation. Avoid decorative stacks of nested panels, green glows around ordinary controls and shadows on every row.

Dialog backdrops dim the underlying task without making the dialog itself translucent. Blur is optional atmosphere, never the only separator or readability mechanism. Authentication may use a more immersive photographic backdrop, with a stable dark form surface and adequate contrast throughout loading and validation.

Preserve supplied hummingbird and lockup assets, background artwork and the animated chat form. Keep logos uncropped and undistorted. Crop backgrounds to retain their focal subject at each viewport; place overlays behind text as needed. Preserve generated media's aspect ratio and provide a full view when a thumbnail crops it. Decorative images receive empty alternative text; meaningful imagery receives useful descriptions. Third-party marks retain their identity and do not imply availability, endorsement or connection.

## Shapes

Use 8px corners for controls, 12px for compact containers, 16px for panels and dialogs, and 20px for expanded composers. Pills suit compact chips and mode controls; circular icon buttons suit isolated icon actions. Choose geometry by role and reuse it consistently.

Every interactive target must be at least 44×44px, including icon buttons, menu items, switches, chips and inline actions. A smaller visible icon or switch track may sit within that target; target padding must not overlap neighboring controls. Do not shrink targets to fit a dense toolbar.

## Components

### Shared states and accessibility

Apply each relevant state to the component families below. A static container needs readable content and data states; it does not need a fake hover action.

| State    | Required treatment                                                                                                                                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default  | Clear label, readable foreground, identifiable control boundary and stable geometry.                                                                                                                                                                                                |
| Hover    | A perceptible fill, border or text change; essential actions remain discoverable without hover.                                                                                                                                                                                     |
| Pressed  | Visible feedback during activation; primary mint uses its pressed token. Avoid shifting surrounding layout.                                                                                                                                                                         |
| Focus    | A 3px solid brand-green outline with 3px offset on dark surfaces. Preserve it alongside hover, pressed or selected state. Use a contrasting two-color treatment, such as a dark separator and green outer ring, when the adjacent fill or artwork obscures it. Never clip the ring. |
| Selected | Persistent indicator plus a semantic selected, checked or current state; do not rely on color alone.                                                                                                                                                                                |
| Disabled | Prevent activation, mute emphasis while keeping the label legible, and explain the relevant restriction nearby. Do not require hovering a disabled control to learn why.                                                                                                            |
| Loading  | Name the pending operation and expose busy status. Preserve dimensions, prevent duplicate effects and keep unrelated work usable.                                                                                                                                                   |
| Error    | Identify the affected action or field, show useful recovery and preserve valid input. Use danger plus an icon or text; never raw diagnostics.                                                                                                                                       |
| Success  | Confirm only the completed action using explicit text and, where useful, a success icon. Keep feedback available long enough to perceive.                                                                                                                                           |

All controls support keyboard operation and accessible names. Menus and selectors use appropriate arrow-key behavior; Escape closes dismissible overlays. Dialogs have an accessible title, intentional initial focus, contained keyboard focus and focus restoration to the trigger or a meaningful successor. Keep background interaction inactive while modal. Associate field errors with fields and announce status changes without reading every streamed token. Tooltips supplement labels and open on focus as well as hover.

Use one consistent interface icon family with matching optical size and stroke weight. Align icons with their labels and retain the same symbol for the same action across surfaces. Third-party marks remain distinct from interface icons. Decorative icons do not repeat the accessible label; icon-only controls always have a specific accessible name.

### Motion

The unexpected-error surface is a sanctioned cinematic brand expression: approximately 1.6 seconds of arrival and ribbon unfolding, followed by restrained hovering, pointer attraction, traced flight paths and a fading wake. Explicit pause and keyboard/touch exploration accompany it. Recovery begins immediately and owns its result independently of the visual departure. Reduced motion uses composed static frames; hidden pages stop rendering. The static identity and all recovery controls are visible before assets load. This exception does not change the dashboard loader, the 404, or ordinary control timings.

Use 180ms control transitions, 220ms surface transitions and up to 300ms structural transitions with a consistent ease. Prefer opacity and transform for movement; avoid layout churn. Preserve the animated chat form as a brand expression, but never delay typing, submission or navigation for its intro. Every launch screen (the dashboard loading overlay, the public intro cover and the fullscreen loading view) paints the static brand logo first. The dashboard's 3D hummingbird loader is the second sanctioned brand expression: the bird replaces the logo once its scene is ready, if that happens within 4.0 s of the overlay becoming eligible, and otherwise the logo stays. Its fixed flight hold of 5.0 s from the start of the flight and the launch screen's 1.0 s minimum are the product's only intentional delays: Esc ends the flight hold once the bird has settled after its entrance, Esc while the scene loads keeps the logo for the rest of the minimum, the hold never outlasts itself once the workspace is ready, the dashboard is usable from the first frame of its exit, and reduced motion, an unavailable renderer or a scene that misses the 4.0 s cap keeps the static logo with no wait beyond the minimum. The bird is seen only in profile or three-quarter view, never facing the viewer. Animation must not carry information alone.

Respect reduced motion with static equivalents and immediate state changes where movement is unnecessary. Replace continuous animated artwork and shimmer with static treatments; pause continuous animation when hidden or offscreen. Keep progress readable without animation and do not fabricate progress from elapsed animation time; the loader's flight is not progress. Its status line, "Preparing your workspace…", appears once the bird has settled at the center and slowly pulses between full and dim opacity until the exit; it also appears if the hold ends before the data.

### Buttons, fields and selection controls

- **Buttons:** reserve filled mint for the primary action in its local task. Secondary and quiet actions use neutral surfaces; destructive confirmation uses red. Include specific labels, accessible icon names and visible loading text. Filled destructive hover and pressed states retain danger meaning, using a visible outline or inset boundary without reducing text contrast.
- **Fields:** use the field surface, primary input text, a persistent visible label and associated help or validation. Show required and optional meaning clearly. Retain input on recoverable errors and keep password visibility and clear actions keyboard-accessible. Focus supplements the field boundary; error messages remain visible during focus.
- **Selectors and chips:** show the current model, mode or filter clearly. Use selected semantics and a check or indicator. Distinguish loading choices, no choices and failed availability; preserve the current valid selection. Interactive chips retain full target size even when their visible pill is compact.
- **Switches:** pair a clear label with on/off state and a positional cue. Explain pending saves and failures; do not imply a changed preference is saved before confirmation. Disabled preferences retain a readable explanation.

### Navigation, disclosures, menus and dialogs

- **Navigation:** show the current destination and active conversation. Keep history groups distinguishable from conversations. Provide coherent drawer dismissal and back navigation on compact screens, with focus restoration and preserved drafts.
- **Disclosures:** use a clear title, expanded state and keyboard-operable trigger. Response details and advanced preferences may collapse; essential errors and consequential terms must remain visible at the decision point.
- **Menus:** group related actions, identify destructive options in red with text, and keep labels readable. Bound height and allow scrolling on small screens. Close predictably on selection or dismissal.
- **Dialogs:** use elevated surfaces and panel corners, with a visible close or cancellation action when dismissal is allowed. Keep title and action hierarchy stable; long content scrolls without hiding the final actions. Consequential dialogs name the item, scope and known reversibility or cost before a specific confirmation action.

### Feedback and data states

Use skeletons only for predictable pending content and labeled progress for operations. Empty states identify confirmed absence and give a relevant next step. Failed loading uses an error with retry when safe; unavailable states explain the known restriction. Interrupted operations retain useful partial content and identify supported recovery. Success feedback describes the actual result, including any partial outcome.

Use inline feedback near the affected work. Toasts suit short confirmations but must not be the sole location of critical failures or instructions. Avoid turning errors into empty panels or showing a decorative success check while persistence remains unresolved.

### Conversation, composer and response details

Distinguish authored requests, assistant output and response details through labels, alignment and spacing rather than a separate card around every paragraph. Render markdown, code, math and references legibly. Keep copy and other message actions discoverable and accessible without hover. Auto-follow incoming content only while the user is following the latest output; preserve their reading position when they scroll away.

The composer retains its dark surface and grows to accommodate input without consuming the entire reading area. Keep attachment readiness and submission state visible. Separate preparing, processing, streaming, interrupted and completed states; retain partial output on interruption. Offer stop, resume or retry only where supported, with accurate labels and no duplicated request effects.

Thinking and references are secondary details, presented in a desktop supporting panel or compact-screen dialog. Show supplied content and provenance only. Distinguish absent, pending and unavailable details; never fill missing details with invented reasoning or sources.

### Attachments and generated media

Show filename, type when known, readiness, progress, error and removal separately. Long filenames may wrap or truncate only when the full name remains accessible. Do not mark selected files as uploaded or supported before validation. Keep progress and recovery associated with the affected file.

Generated media distinguishes queued, processing, partial, failed, interrupted, unavailable and ready states when supplied. Preserve aspect ratio, label controls, avoid autoplay that interrupts work, and provide supported download or full-view actions. Do not show a broken preview as a successful generation or a placeholder as the finished artifact.

### Account data, tables and charts

Use clear field groups for profile, security and preferences. Keep balances, credits, prices and tokens labeled with their actual units. Separate account export, conversation deletion, memory deletion and account deletion; their confirmations must not imply the same scope.

Tables align comparable numbers and preserve headers, row meaning and action access. Reflow suitable records on mobile or use a labeled horizontal scroll region when comparison requires a table. Charts include labeled axes, units, time ranges and textual values or an accessible table. Distinguish missing or failed data from zero, and use patterns, symbols or labels alongside color. Loading must not temporarily present a zero balance or empty usage as fact.

### Integration states

App entries show identity and actual capabilities without implying that a logo proves support. Display available, not installed, installing, installed, enabled, disabled, connected, disconnected, unavailable and failed states only when meaningful and confirmed. Installation and connection health remain separate. Show partial imports and pending exports accurately; provide supported retry or configuration recovery. Removal and credential rotation explain consequences before confirmation, and sensitive values stay out of general status feedback.

## Do's and Don'ts

### Do

- Do prioritize readable content, clear task state and recovery across all screen sizes.
- Do use green for identity and selection, mint for primary actions, and red for destructive meaning.
- Do keep dark text on filled mint actions and verify contrast in every applicable state.
- Do preserve recognizable artwork, draft continuity, keyboard focus and supported localization.
- Do treat loading, empty, unavailable, interrupted, failed and successful outcomes as distinct states.
- Do provide static equivalents for motion and meaningful labels for controls, data and status.

### Don't

- Don't promote implementation inconsistencies into design requirements.
- Don't use marketing-scale headings or oversized gutters in working panels.
- Don't encode meaning through color, motion, hover or an unlabeled icon alone.
- Don't fabricate Thinking, references, progress, balances, capabilities or successful outcomes.
- Don't crop brand lockups, distort media or let background artwork compete with task content.
- Don't collapse controls below their target size or truncate essential localized instructions.
