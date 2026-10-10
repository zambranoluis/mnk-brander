# Commercial preparation workflow

Use this workflow for an idea, an existing commercial record, supplied assets, or a request concerning one preparation step. [AGENTS.md](../../AGENTS.md) owns authorization, proportional handling, preservation, and common locations. [VERIFICATIONS.md](../docs/VERIFICATIONS.md) owns checks; the investigation, planning, and execution methods supply relevant grounding without requiring additional commercial paperwork.

The normal endpoint is a verified asset and prompt package ready for the user's production work in Higgsfield. A narrow request can stop at any step, including a prompt-only handoff. Preparing material does not mean it has been generated or tested externally.

## Enter at the needed step

Identify the requested outcome, existing material, settled choices, unresolved decisions, and stop boundary. Read the current commercial record when present and inspect supplied assets before reusing them. Gather only information needed for the requested stage. Do not impose a full brief questionnaire on a bounded prompt request.

Whenever a consequential creative decision remains open, read [CREATIVE-DEVELOPMENT.md](CREATIVE-DEVELOPMENT.md). It guides discovery, concept comparison, critique, recommendation, and development at the actual unresolved decision. The agent leads creative proposals; the user supplies business knowledge and reacts to concrete choices. Preserve supplied direction and settled selections rather than restarting exploration.

Ask when a consequential choice remains open, including competing authoritative references. Continue independent authorized work while the answer is pending. Label nonblocking assumptions; do not invent product capabilities, requirements, supplied files, or an answer needed for dependent work. Settled decisions remain valid until revised. Moving between stages does not introduce a new approval question.

## Five preparation steps

### 1. Brief — decide what the commercial must communicate

Establish the audience, message, intended response, platform, approximate duration, format or aspect ratio, and relevant constraints to the extent needed now. Record confirmed brand/product facts separately from proposed creative treatment and unverified claims. Establish the source of consequential product claims.

Resolve choices that affect dependent work. An example can illustrate a direction without defining mandatory genre, character, room, narration, or effects. Unknown inputs remain explicit with their decision maker and blocked work.

Use creative development to turn the audience opportunity into a concrete premise before dependent scripting when that premise is open. Record proposed strategy separately from confirmed facts and the user's selection. This connects the brief to the script within the same five steps.

### 2. Script — decide what happens

Develop the sequence of actions, product demonstrations, and ending. Add dialogue, voiceover, or displayed copy only when chosen; music, narration, captions, and effects are optional. Assign approximate timing and check that the sequence fits the intended duration. A bounded prompt request may need only a single action beat.

Develop the selected premise through its execution principles: visual direction, pacing, sound intentions, product role, and payoff. For later creative refinement, use only the unresolved part of creative development; keep approved direction and unrelated shots settled.

Show only confirmed product behavior using authoritative material where exact behavior matters. Creative staging may be proposed; invented dashboard states, functionality, or performance must not be represented as verified product behavior.

### 3. Storyboard — decide how it is shown

Give shots stable identifiers such as `S01` and `S02`; preserve identifiers when revising shots so dependencies and prompts stay traceable. A written table is sufficient initially:

| Shot | Approx. duration | Framing and composition | Action and state change | Camera | Sound/text cues | Transition | Required assets |
| --- | --- | --- | --- | --- | --- | --- | --- |

Fill only applicable details. Include camera movement when needed and distinguish movement of the camera from movement of objects. Note starting and ending states where later shots depend on them. Reconcile shot durations with the script; approximate timing is not proof of generated runtime.

Generate visual boards only when requested or needed to settle composition. Produce only views and shot frames that the storyboard requires. If visual inspection exposes an impossible view, changed geography, or conflicting prop, revise the storyboard or reference before downstream generation.

### 4. References and assets — establish and preserve visual decisions

Inspect actual supplied images, video frames, artwork, captures, and other material before selecting or reusing them. Record what each selected reference establishes: character identity, wardrobe, setting, important props, styling, lighting, product imagery, or brand artwork. Keep exploration candidates distinct from selected references; a generated image is not authoritative automatically.

For creative inspiration, apply [Learn from references](CREATIVE-DEVELOPMENT.md#learn-from-references): state the transferable principle, adaptation or rejection, and how this work differs. Distinguish observations from properties not inspected, especially video pacing and sound.

For a recurring setting, retain a selected master view and enough spatial notes or additional views to support planned shots. Describe relevant object relationships and camera positions; define unseen areas only when a planned shot needs them. Derive needed variants from selected references, inspect related views together, and correct drift before downstream use. A contradictory set cannot be called selected and continuity-verified.

Use supplied brand artwork, approved 3D assets, and verified product captures where exact appearance matters. Do not regenerate logos or invent dashboard behavior as substitutes for authoritative material. If a required authoritative input is unavailable, identify the dependency and use a clearly marked placeholder only in planning, never as a verified selected asset.

Use available image generation for suitable assets and edits, following the current installed skill. Retain selected output locally, assign a version and role, and inspect it. If generation must happen externally, provide the self-contained instructions below and label the input or output still missing.

### 5. Handoff — make the package usable elsewhere

Provide selected asset files, prompts linked to shots, explicit upload/reference assignments, applicable settings, and concise production instructions. Identify the current versions and reference roles so the user can choose the right files without relying on the conversation.

Stage candidate packages in workspace `output/` and promote selected material into `productions/commercials/<commercial-name>/` under [Production package](#production-package) and [Promotion and revisions](#promotion-and-revisions). Promotion can occur progressively at earlier steps; it is not a sixth preparation step. Check the copied result at its production location before handoff.

Check current official documentation for the selected Higgsfield model and mode. Record the model/mode, source URL, check date, relevant input support and settings, and anything not confirmed in the actual account. Do not impose permanent reference counts, duration caps, resolutions, or parameter names from another model. If access to documentation or the mode is missing, mark the dependent settings unverified and state how to resolve them.

Use these handoff states accurately:

- **Asset-complete handoff:** all assets required by the agreed scope are present, selected, inspected, and accessible; shot prompts and production instructions agree with them. External generation quality remains untested unless actually tested.
- **Prompt-only handoff:** the requested prompts/instructions are ready, but named assets still need supplying or external generation. List each missing input, its intended role, the generation order, and the inspection needed before use.

A prompt-only request can be complete within its scope while asset completeness remains open. Do not present either state as a finished commercial or successful Higgsfield generation. If rendering, uploading, or publishing is subsequently requested, establish that scope and capability separately.

## One working record per commercial

Use `workspace/<commercial-name>/<commercial-name>-commercial.md` when requested or when decisions and staged work need preservation. Simple brainstorming can remain conversational. This is the primary commercial decision, progress, and resume record; ordinary preparation does not also require separate plan, design, investigation, and implementation files. Honor explicitly requested separate artifacts and link them without duplicating current state.

Add content progressively; do not create empty sections or require completed earlier stages for a narrow task.

| Record content | Include when relevant |
| --- | --- |
| Brief | Purpose, audience, message, intended response, platform, duration, format, constraints, confirmed brand/product facts and sources. |
| Creative development | Relevant audience insight and evidence status; concept options, recommendation and tradeoffs; selected premise and selection basis; visual, pacing, and sound execution principles. Add only what the current decision needs. |
| Script | Current sequence, approximate timing, chosen spoken/displayed text, and ending. |
| Storyboard | Stable shot IDs, framing, action, states, camera, timing, cues, transitions, and asset dependencies. |
| Visual consistency | Selected references and their roles; fixed appearance, spatial relationships, permitted state changes, and unresolved conflicts. |
| Assets and prompts | Relative file links, versions, origins, reference roles, generation instructions, candidate/selected/rejected status, and shot assignments. |
| Current state | Completed work, requested stop, unresolved decisions and owners, missing inputs, actual checks and limits, handoff state, and exact next action. |

Use workspace `assets/` for retained references and generated material, `output/` for staged candidate production packages, and `local/` for disposable files. Keep exploration, rejected candidates, development history, and original sources in workspace. Additional development shot-prompt files are useful only when long text makes the main record unwieldy; link the current files from the record. Production documents and prompts are curated exports under the structure below, not additional working records.

On resumption, read the record and linked current assets/prompts, check availability and material changes, then continue from its next action. Preserve settled choices and the authorized scope. Recover missing facts from accessible evidence rather than inventing execution history. If a selected reference changes, reconcile dependent shots, variants, prompts, and checks before further use.

## Practical consistency rules

- **Fixed appearance versus changing state:** retain identity, colour, shape, materials, wardrobe, and other selected fixed details. A prop's lid, position, expression, or other state may change when the script calls for it; record the intended transition.
- **Physical position versus camera view:** keep room geography and object relationships fixed unless an action moves them. Screen-left or screen-right may change with viewpoint; describe the physical relation and the camera, not contradictory room layouts.
- **References versus instructions:** assign the actual supplied files their roles in each prompt. Repeating descriptive prose alone is not a consistency solution. Use the model/mode's documented reference mechanism; do not invent attachment syntax.
- **Exploration versus selected material:** candidates remain candidates until inspected and selected. A strong isolated frame does not prove continuity with the rest of the commercial.

When references conflict, identify the exact mismatch, its affected shots, and the decision needed. If an authoritative selected reference already resolves it, preserve that reference and correct the variant within authorized work. If selection is unsettled, ask which material governs and pause only dependent generation. Inspect corrected results together before using them downstream. Reusable references and explicit direction improve control but do not guarantee consistent generation.

## Self-contained generation prompts

For each shot or requested asset, provide enough information to execute outside this conversation:

- Shot/asset identifier, expected output type and format, and chosen or proposed model/mode.
- Exact current filenames or declared missing inputs, each reference role, upload assignment/order where applicable, and the documented mechanism for identifying them in the prompt.
- Starting composition, subject positions and physical relationships, action and intended state change, camera/framing, lighting/style, approximate duration, and applicable sound/text.
- Requested changes and details to preserve from the selected references; avoid conflicting instructions or relying on unuploaded material.
- Applicable settings, source and check date for model-specific assumptions, and uncertainties needing account confirmation.
- Generation dependencies and the specific output checks needed before selection or downstream use.

Include only applicable details. If files do not exist yet, label names as proposed outputs or missing inputs, not supplied references. For multi-step external generation, put the reference-building prompts before shot prompts and explain when a returned asset must be inspected and selected. Prompt text and assignments must agree with the storyboard and actual selected file versions.

## Reuse and preservation

Each commercial owns independent copies of reused assets. Record source commercial or supplied origin, original version, local destination, and selection role. Preserve original bytes unless an explicitly identified derived version is needed; keep the original and label the derivative.

Do not make a commercial depend on mutable asset paths in another commercial. Updates in one production cannot silently update another. Changes to shared-looking material require deliberate copies and reconciliation of the receiving commercial's decisions; they do not authorize edits to the earlier commercial.

Retain selected references, prior versions, finished packages, and cited evidence. Production packages must include every available file required for their declared scope; missing inputs or proposed outputs remain explicit under the prompt-only rules. A pointer to an external supplied file does not replace a production-local copy. Package-relative links and upload assignments must work at the intended destination, including within archives. Use VERIFICATIONS for the final package check.

## Production package

Use `productions/commercials/<commercial-name>/` for clean, usable selected material. Keep the latest material directly in that folder. Create only documents and directories that contain real material; a prompt-only package need not have a completed brief, script, storyboard, or asset directory.

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
├── deliverables/
└── archives/
    └── v001/
```

The commercial README identifies the current revision, available material and versions, missing inputs and generation dependencies, readiness, and production instructions. Brief, script, and storyboard export the selected direction. Scene documents describe shared setting and continuity. Shot documents describe action, timing, camera, sound, and exact asset/reference assignments, including starting and ending states when needed. Grouping shots into scenes must preserve existing shot IDs.

Store each asset at the narrowest shared level serving its uses: commercial-wide assets at the root, scene-wide assets in the scene, and shot-specific assets in the shot. Use descriptive prompt filenames that distinguish image generation, video generation, and other purposes when applicable, such as `setting-master-image.md` and `opening-pan-video.md`. Shared asset-generation prompts belong at the matching shared level. Every shot and prompt identifies the exact production-local asset path and reference role; make links relative to the containing document so they resolve within the package.

Production material must be usable without workspace access, personal paths, conversation history, or mutable files in another commercial. Include needed copies and executable instructions locally; supporting source citations may remain, but cannot substitute for required files or operative instructions. Exclude drafts, rejected variants, scratch, test evidence, and development history. Keep original sources and promotion provenance in the workspace commercial record: selected source/version, destination, selection basis or delegated authority, checks, current production revision, and handoff state.

A finished prompt can enter production before its output exists. Declare the proposed output path as missing, identify any missing inputs, their reference roles, generation order, and inspection/selection requirements, and reconcile this status in the README and affected shot documents. Do not link an absent file as an available asset or claim asset completeness. Production copies are independent retained files, not links back to workspace.

## Promotion and revisions

1. Prepare and revise material in workspace; use its `output/` to stage candidate packages.
2. Promote selected elements after the applicable factual, visual, continuity, and prompt checks in VERIFICATIONS. Existing selection or delegated authority is sufficient; do not add approval questions solely because material moves to production. An unsettled consequential selection still needs its decision maker.
3. Copy an explicit selection of files and every required available dependency. Never copy the whole workspace directory indiscriminately. Preserve source files and provenance in workspace.
4. Rewrite references and upload assignments to production-local paths. Inspect the actual production package and confirm its dependencies resolve inside it without workspace access; use an independent-copy check only when direct inspection is insufficient. Verify copied asset bytes against sources and document any intentional derivative. Declare it ready only for the scope actually checked.
5. Update affected production documents, prompts, asset versions, assignments, and readiness together. Reconcile the workspace record so production cannot mix incompatible decisions or versions; recheck affected dependencies before use or handoff.

Use revision labels such as `v001` in the production README and record the handed-off revision in workspace. Before changing a previously handed-off package, copy its complete current contents into the next unused `archives/vNNN/`, excluding only the package's top-level `archives/` directory. Do not overwrite an existing archive or include earlier archives recursively. Verify the full file inventory, bytes, and internal dependencies before editing current material, preserve the verified archive unchanged, and advance the current revision. The first archived handoff normally uses `archives/v001/`; record the snapshot's source revision if numbering differs.

Scope byte comparisons and inventories to the copied assets and actual archive whose identity must be preserved. These checks do not require repository-wide inventories or synthetic packages for a documentation revision; [VERIFICATIONS](../docs/VERIFICATIONS.md#production-promotion-and-archives) owns the applicable review method.

An archive must resolve its dependencies inside itself, without the current package or other archives. Keeping document-relative paths internal to the package allows the complete snapshot to retain its original bytes. If an existing handed-off package has an external dependency, preserve it and resolve the packaging gap before modifying current material; do not claim the archive self-contained or silently rewrite a historical handoff. Work not yet handed off can be revised in place while preserving retained sources and earlier productions.
