# Commercial preparation workflow

Use this workflow for an idea, an existing commercial record, supplied assets, or a request concerning one preparation step. [AGENTS.md](../../AGENTS.md) owns authorization, proportional handling, preservation, and common locations. [VERIFICATIONS.md](../docs/VERIFICATIONS.md) owns checks; the investigation, planning, and execution methods supply relevant grounding without requiring additional commercial paperwork.

The normal endpoint is a verified asset and prompt package ready for the user's production work in Higgsfield. A narrow request can stop at any step, including a prompt-only handoff. Preparing material does not mean it has been generated or tested externally.

## Enter at the needed step

Identify the requested outcome, existing material, settled choices, unresolved decisions, and stop boundary. Read the current commercial record when present and inspect supplied assets before reusing them. Gather only information needed for the requested stage. Do not impose a full brief questionnaire on a bounded prompt request.

Ask when a consequential choice remains open, including competing authoritative references. Continue independent authorized work while the answer is pending. Label nonblocking assumptions; do not invent product capabilities, requirements, supplied files, or an answer needed for dependent work. Settled decisions remain valid until revised. Moving between stages does not introduce a new approval question.

## Five preparation steps

### 1. Brief — decide what the commercial must communicate

Establish the audience, message, intended response, platform, approximate duration, format or aspect ratio, and relevant constraints to the extent needed now. Record confirmed brand/product facts separately from proposed creative treatment and unverified claims. Establish the source of consequential product claims.

Resolve choices that affect dependent work. An example can illustrate a direction without defining mandatory genre, character, room, narration, or effects. Unknown inputs remain explicit with their decision maker and blocked work.

### 2. Script — decide what happens

Develop the sequence of actions, product demonstrations, and ending. Add dialogue, voiceover, or displayed copy only when chosen; music, narration, captions, and effects are optional. Assign approximate timing and check that the sequence fits the intended duration. A bounded prompt request may need only a single action beat.

Show only confirmed product behavior using authoritative material where exact behavior matters. Creative staging may be proposed; invented dashboard states, functionality, or performance must not be represented as verified product behavior.

### 3. Storyboard — decide how it is shown

Give shots stable identifiers such as `S01` and `S02`; preserve identifiers when revising shots so dependencies and prompts stay traceable. A written table is sufficient initially:

| Shot | Approx. duration | Framing and composition | Action and state change | Camera | Sound/text cues | Transition | Required assets |
| --- | --- | --- | --- | --- | --- | --- | --- |

Fill only applicable details. Include camera movement when needed and distinguish movement of the camera from movement of objects. Note starting and ending states where later shots depend on them. Reconcile shot durations with the script; approximate timing is not proof of generated runtime.

Generate visual boards only when requested or needed to settle composition. Produce only views and shot frames that the storyboard requires. If visual inspection exposes an impossible view, changed geography, or conflicting prop, revise the storyboard or reference before downstream generation.

### 4. References and assets — establish and preserve visual decisions

Inspect actual supplied images, video frames, artwork, captures, and other material before selecting or reusing them. Record what each selected reference establishes: character identity, wardrobe, setting, important props, styling, lighting, product imagery, or brand artwork. Keep exploration candidates distinct from selected references; a generated image is not authoritative automatically.

For a recurring setting, retain a selected master view and enough spatial notes or additional views to support planned shots. Describe relevant object relationships and camera positions; define unseen areas only when a planned shot needs them. Derive needed variants from selected references, inspect related views together, and correct drift before downstream use. A contradictory set cannot be called selected and continuity-verified.

Use supplied brand artwork, approved 3D assets, and verified product captures where exact appearance matters. Do not regenerate logos or invent dashboard behavior as substitutes for authoritative material. If a required authoritative input is unavailable, identify the dependency and use a clearly marked placeholder only in planning, never as a verified selected asset.

Use available image generation for suitable assets and edits, following the current installed skill. Retain selected output locally, assign a version and role, and inspect it. If generation must happen externally, provide the self-contained instructions below and label the input or output still missing.

### 5. Handoff — make the package usable elsewhere

Provide selected asset files, prompts linked to shots, explicit upload/reference assignments, applicable settings, and concise production instructions. Identify the current versions and reference roles so the user can choose the right files without relying on the conversation.

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
| Script | Current sequence, approximate timing, chosen spoken/displayed text, and ending. |
| Storyboard | Stable shot IDs, framing, action, states, camera, timing, cues, transitions, and asset dependencies. |
| Visual consistency | Selected references and their roles; fixed appearance, spatial relationships, permitted state changes, and unresolved conflicts. |
| Assets and prompts | Relative file links, versions, origins, reference roles, generation instructions, candidate/selected/rejected status, and shot assignments. |
| Current state | Completed work, requested stop, unresolved decisions and owners, missing inputs, actual checks and limits, handoff state, and exact next action. |

Use `assets/` for retained references and generated material, `output/` for finished packages, and `local/` for disposable files. Additional shot-prompt files are useful only when long text makes the main record unwieldy; link the current files from the record.

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

Retain selected references, prior versions, finished packages, and cited evidence. Handoff packages must include necessary files or clearly identify accessible supplied dependencies; archive-relative links and upload assignments must work at the intended destination. Use VERIFICATIONS for the final package check.
