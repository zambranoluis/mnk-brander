# Commercial contracts

This owner is retained for existing Brander productions and their recorded editing associations. New videos of every type go through Filmmaker (`mnk-filmmaker`, alias `filmmaker`) and its source STUDIO/PRODUCTION owners. Creation of that studio does not move these films, assets or histories. Resume the exact existing task and baseline under its recorded owner; applying brand decisions or reading product facts does not transfer production ownership.

General studio behavior, task layout, retention and export conditions are owned by [PRODUCTION](PRODUCTION.md). These contracts add film requirements. Base-led work uses the selected base's filmmaking, creative and verification methods; independent work uses the repository's commercial, creative and verification guidance routed by the home [Studio requirements](STUDIO.md). Neither route requires a particular base installation. Brand facts come from the independent owners routed there.

## Records and locations

Use the single task and editable baseline under [production records](PRODUCTION.md#revisions-and-records). Carry brief, selected premise, script/storyboard, fixed appearance and allowed state changes, provenance, asset/prompt assignments, current checks and next action as needed. Separate documents support substantial material without becoming competing state records.

Existing commercials retain their sufficient source layout and editing entry points. The current retained OpenJM files are under `productions/openjm/boy-homework/`; the earlier `workspace/openjm-boy-homework/` editable package is unavailable here. Preserve sources, cited evidence, earlier packages and actual entry points. Missing records remain unknowns, not permission to select the latest revision.

## Selective delivery versioning

Apply [PRODUCTION](PRODUCTION.md#revisions-and-records) to meaningful review versions, delivered results and checkpoints. Record picture/audio identities, selected formats, dependencies and actual visual/listening review status. A film revision continues the selected task; it does not automatically create a named folder, snapshot or ZIP.

## Stage and handoff states

Brief, script, storyboard, references/assets and handoff are the retained preparation sequence; enter at the requested step and stop at the requested outcome. Higgsfield asset/prompt preparation is a supported endpoint, not a universal renderer or requirement for identity/design work. Stable shot IDs survive grouping and revisions. Exact product behavior and brand artwork require authoritative sources; proposals and controlled staging remain labeled.

An asset-complete handoff has all agreed assets present, selected, inspected and accessible with matching prompts. A prompt-only handoff declares missing files, intended roles, generation order and inspection before use. Either can meet its requested scope; neither proves completed generation, a rendered film or audience effectiveness. Model/mode documentation and actual account access are separate evidence. Maintain current revision, dependencies, missing inputs and exact production instructions in a handed-off package README.

## Reference continuity and generation

For recurring settings, retain a selected master view and enough spatial notes or additional views for the planned shots. Describe object relationships and camera positions; define unseen areas only when needed. Inspect related variants together and resolve drift before downstream generation. Screen-left or screen-right can change with viewpoint without changing the physical geography. Fixed identity, wardrobe and prop appearance remain stable; scripted lid, position, expression or other state changes remain explicit.

Assign actual selected files and reference roles to every prompt using the chosen model/mode's documented mechanism. Repeated descriptive prose is not a substitute for reference assignments. If references conflict, identify the exact mismatch and affected shots. Preserve an already authoritative reference and correct the variant within scope; when selection remains unsettled, resolve it with the decision maker before dependent generation. Inspect corrected views together before use.

For an actual external handoff, record model/mode, official source URL and check date, documented input support/settings and unconfirmed account limits. Put reference-building prompts before dependent shot prompts. Proposed filenames are not supplied files; label missing outputs and the inspection/selection required when they arrive. Documentation support does not prove tested generation or account access.

## Reuse and preservation

Apply [production retention](PRODUCTION.md#revisions-and-records) once per meaningful revision. The requirements below govern commercial dependencies and affected build stages.

Each commercial owns independent copies of reused assets. Record source commercial or supplied origin, original version, local destination, and selection role. Preserve original bytes unless an explicitly identified derived version is needed; keep the original and label the derivative.

Do not make a commercial depend on mutable asset paths in another commercial. Updates in one production cannot silently update another. Changes to shared-looking material require deliberate copies and reconciliation of the receiving commercial's decisions; they do not authorize edits to the earlier commercial.

Within one commercial, share common inputs, reusable build/capture/audio/verification/package tools and editable picture/UI sources. Identify these locations and explicit target formats in the selected task; new work uses its maintained `work/` structure, while established commercial-level locations remain valid. Reference unchanged dependencies directly; do not copy tools, picture/UI sources, scene asset folders or installed environments into each revision. Keep distinct format layouts, camera settings and endings separate; applying a change to another format requires an explicit target. Timing may be shared where identical, with explicit format-specific derivatives when changed.

Freeze or preserve the exact shared dependencies of a retained result before changing them, as required by PRODUCTION. Named revision folders may remain an established production's sole preservation mechanism when sufficient; they are not a requirement for new revisions. Rebuild only stages affected by changed inputs, settings or tools; reuse unchanged prepared audio, rendered scenes and picture. An audio-only correction retains picture identity, timing and target formats, changes the active mix/settings, and checks picture reuse and the resulting sound. It does not duplicate picture/UI sources or environments.

Disposable build state must detect missing/stale results, support a dry run and explicit forced stages, and never serve as a version archive. Generated writes stay task-owned; delivered media and package writes refuse existing names. The shared installed environment and pinned toolchain remain outside revision folders. Package only for requested delivery needs, selecting requested targets and required dependencies in an independent relative layout.

Retain selected references, meaningful prior results, finished packages, and cited evidence under PRODUCTION. Production packages must include every available file required for their declared scope; missing inputs or proposed outputs remain explicit under the prompt-only rules. A pointer to an external supplied file does not replace a production-local copy. Package-relative links and upload assignments must work at the intended destination, including within archives. Use the commercial verification sections below for the final package check.

## Production package

When a requested independent handoff or separate production needs a package, use `productions/<brand>/<commercial-name>/` or the agreed delivery destination; preserve existing paths. This is a delivery copy, not a second editable baseline. Create only documents and directories containing required material; the structure below is illustrative. A prompt-only handoff need not have a completed brief, script, storyboard or asset directory. A review preview or completed edit does not itself request promotion.

```text
<commercial-name>/
├── README.md
├── brief.md
├── script.md
├── storyboard.md
├── assets/
├── prompts/
├── scenes/
│   └── SC01/
│       ├── scene.md
│       ├── assets/
│       ├── prompts/
│       └── shots/
│           └── S01/
│               ├── shot.md
│               ├── assets/
│               └── prompts/
└── deliverables/
```

The commercial README identifies the current revision, available material and versions, missing inputs and generation dependencies, readiness, and production instructions. Brief, script, and storyboard export the selected direction. Scene documents describe shared setting and continuity. Shot documents describe action, timing, camera, sound, and exact asset/reference assignments, including starting and ending states when needed. Grouping shots into scenes must preserve existing shot IDs.

Store each asset at the narrowest shared level serving its uses: commercial-wide assets at the root, scene-wide assets in the scene, and shot-specific assets in the shot. Use descriptive prompt filenames that distinguish image generation, video generation, and other purposes when applicable, such as `setting-master-image.md` and `opening-pan-video.md`. Shared asset-generation prompts belong at the matching shared level. Every shot and prompt identifies the exact production-local asset path and reference role; make links relative to the containing document so they resolve within the package.

Production material must be usable without workspace access, personal paths, conversation history, or mutable files in another commercial. Include needed copies and executable instructions locally; supporting source citations may remain, but cannot substitute for required files or operative instructions. Exclude drafts, rejected variants, scratch, test evidence, and development history. Keep original sources and promotion provenance in the workspace commercial record: selected source/version, destination, selection basis or delegated authority, checks, current production revision, and handoff state.

A finished prompt can enter production before its output exists. Declare the proposed output path as missing, identify any missing inputs, their reference roles, generation order, and inspection/selection requirements, and reconcile this status in the README and affected shot documents. Do not link an absent file as an available asset or claim asset completeness. Production copies are independent retained files, not links back to workspace.

## Promotion and revisions

1. Continue editing the baseline identified in task.md. For new work, use `local/` for disposable candidates and `work/delivery/` for requested exports. Retain an existing `output/` only when it is part of the sufficient native tool layout.
2. Promote selected elements after the applicable factual, visual, continuity, and prompt checks under [commercial verification](#commercial-verification). Existing selection or delegated authority is sufficient; do not add approval questions solely because material moves to production. An unsettled consequential selection still needs its decision maker.
3. Copy an explicit selection of files and every required available dependency. Never copy the whole workspace directory indiscriminately. Preserve source files and provenance in workspace.
4. Rewrite references and upload assignments to production-local paths. Inspect the actual production package and confirm its dependencies resolve inside it without workspace access; use an independent-copy check only when direct inspection is insufficient. Verify copied asset bytes against sources and document any intentional derivative. Declare it ready only for the scope actually checked.
5. Update affected production documents, prompts, asset versions, assignments, and readiness together. Reconcile the workspace record so production cannot mix incompatible decisions or versions; recheck affected dependencies before use or handoff.

Record the selected revision and delivery relationship in task.md and the package README. Before changing a meaningful review or handed-off result, use the one sufficient preservation mechanism selected under [PRODUCTION](PRODUCTION.md#revisions-and-records). Reuse an existing verified frozen result when sufficient. A full production snapshot or ZIP is appropriate only when that is the selected mechanism needed to preserve the result and dependencies; do not also create a task version of the same revision. Exclude earlier archives to avoid recursive copies. Keep retained files unchanged, identify source revision and restoration instructions, and verify the affected file set and dependencies. An export requested for handoff can serve as preservation when sufficient; no extra archive follows automatically.

Scope byte comparisons and inventories to the copied assets and actual archive whose identity must be preserved. These checks do not require repository-wide inventories or synthetic packages for a documentation revision; [commercial verification](#production-promotion-and-archives) owns the applicable review method.

A restored handoff or exported archive must resolve its dependencies inside its package, without the current package or other archives. Shared commercial inputs must be copied into the exported package. Keeping document-relative paths internal allows the restored snapshot to retain its original bytes. If an existing handed-off package has an external dependency, preserve its actual contents and record the gap and required relative layout; do not claim it self-contained or silently rewrite history. Resolve the gap in a new portable export before declaring that export complete. Work not yet handed off can be revised in its active task while preserving retained sources and earlier versions.

## Commercial verification

Apply the selected base's verification/review methods for base-led work, or the repository's verification guidance for independent work, proportionately to the affected deliverable. The checks below concern actual commercial assets and packages.

## Selected assets

Open actual selected files before reuse, selection, or final handoff. Check readability, intended file type, dimensions/aspect ratio and other required format details, appearance, composition, and correspondence to the storyboard. Inspect video/3D material with a suitable available method when its relevant property cannot be established from a still frame.

Check each asset's version, origin, role, and candidate/selected/rejected status. Required exact brand artwork and product material must come from authoritative supplied or verified sources; generated lookalikes do not establish accuracy. Note any access or usage constraint affecting handoff.

## Continuity

Compare related selected views together using the master references, spatial notes, and shot requirements:

- Character identity, wardrobe, styling, and lighting remain consistent where selected as fixed.
- Important props retain fixed appearance while their action-dependent states change as scripted.
- Setting geography, furniture relationships, and product placement remain physically coherent across camera views.
- Starting and ending states connect across shots or have an intentional transition.

Identify conflicts by asset and shot, resolve the governing reference when unsettled, and inspect corrections before downstream generation. An individually attractive asset does not establish continuity.

## Prompts

Reconcile shot identifiers, actions, timing, framing, camera, sound/text, preserved details, and intended state changes with the current storyboard. Check assignments against actual current filenames and reference roles; missing inputs must be clearly labeled.

Verify reference upload support, settings, and relevant limits for the chosen model/mode from current official documentation. Distinguish documented support from tested account availability. A different model's syntax or reference count is not evidence for this one.

Prompts intended for external execution must be self-contained, including output expectations, reference assignments, dependencies, and inspection criteria. Repeated descriptions without actual reference assignments cannot count as verified continuity control.

## Handoff

For artifact revisions and requested checkpoints, apply [selective delivery versioning](#selective-delivery-versioning): confirm the delivery or checkpoint remains recoverable, earlier deliveries remain unchanged, outputs are directly accessible, and continuation instructions identify the current editing baseline. Check the mechanism actually used; an intermediate edit or routine project fix does not require a separate snapshot or archive verification. When an independent editable package is requested, check its required dependencies at the exported location.

Open the final deliverables from their intended handoff location. Confirm required files are accessible, links resolve, versions and upload assignments are unambiguous, and concise production instructions match the agreed scope. If distributing an archive, inspect or extract it and check its internal paths rather than relying on the working directory.

Check asset completeness separately from prompt readiness. Explicitly list missing inputs, external generation, unchecked settings, and remaining output inspection. A prompt-only request may be complete without claiming asset completeness. An asset-complete package does not prove a rendered commercial or successful Higgsfield generation.

For reused assets, confirm the receiving commercial has independent copies and origin/version records. Check that preparing the new commercial has not modified the earlier commercial's selected assets or deliverables.

## Production promotion and archives

Apply these checks to the selected scope under the workflow's [production package](#production-package) and [promotion and revisions](#promotion-and-revisions) rules:

- Compare the explicit selection and dependency inventory with copied files. Verify copied asset bytes against workspace sources, using hashes or direct byte comparison; label intentional derivatives. Confirm drafts, rejected candidates, scratch, evidence, and development history were excluded and sources were preserved.
- Open production documents, prompts, and available assets from the production folder. Check file links, exact upload/reference assignments, versions, scene continuity, stable shot IDs, and the narrowest shared asset location. A shared file should serve its assigned shots without hidden workspace or other-commercial dependencies.
- Inspect required paths and assignments as well as Markdown links. Every available dependency must exist inside the package. Confirm that dependencies resolve internally, including links or shortcuts; reject personal paths and escapes to workspace, current or other packages. Use an independent-copy check when direct inspection cannot establish independence. Supporting source citations do not establish local asset availability.
- For partial or prompt-only promotion, check that the README and affected documents explicitly identify absent inputs/outputs, roles, generation order, settings uncertainties, and inspection requirements. Declare absent paths as missing or proposed, not working asset links. Check prompt readiness, asset completeness, and rendered-commercial status separately.
- When an asset or decision changes, trace every affected shot, variant, prompt, assignment, and instruction. Reconcile their versions and readiness together and re-run applicable factual, visual, continuity, and prompt checks before handoff.
- When retention uses a frozen package or archive, confirm its delivered file set, bytes and dependency limits, excluding earlier archives. For a new or unverified archive, extract or inspect members and compare paths/bytes; reuse established verification when unchanged. Check after revision that earlier retained files remain unchanged. A sufficient task version or immutable shared identity does not require another package snapshot. An externally dependent historical snapshot is not a verified portable handoff.

Cleanup is governed by PRODUCTION and separate explicit scope. Report potential duplicates or obsolete copies as candidates without deleting, relocating or repairing historical material.

For reusable commercial builds, exercise unchanged inputs, audio-only and one-scene changes, target-format isolation, missing dependencies, stale build state/results, protected write paths and overwrite refusal. Check actual scene loading and bounded capture when source paths or shared assets change; compare framing with retained baselines. Verify picture packets, timing and retained delivery hashes when reusing picture for an audio change. Test on-demand exports independently of the source task, including required inputs and applicable rebuild commands. Confirm packages select only requested targets and dependencies, and audio tasks do not duplicate picture/UI sources or installed environments. Technical reproduction and sampled framing checks do not establish human listening or full creative approval.

Byte comparisons apply to copied assets or archives whose identity matters. Scope inventories to the affected selection or actual archive; do not create repository-wide inventories for ordinary review.

Optional examples for reviewing packaging rules include partial prompt-only promotion, a shared asset used by multiple shots, a missing dependency, an updated asset with dependent prompts, and revision of a handed-off package. Discuss relevant cases when useful; changing these rules does not require synthetic packages or retained fixtures. Apply the operational checks above to actual material and handoffs.
