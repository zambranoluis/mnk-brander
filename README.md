# mnk-brander

A workspace for preparing commercials for multiple brands. Its normal endpoint is a verified asset and prompt package ready for the user's production work in Higgsfield. It also supports idea development, a single preparation step, and prompt-only handoffs.

The user supplies business knowledge and reacts to concrete proposals; the agent leads creative direction, compares meaningful concepts, recommends the strongest fit, and develops the selection. Inventiveness can take many forms, including restrained observation and factual demonstration.

The five preparation steps are **brief → script → storyboard → references and assets → handoff**. Enter where the request and existing material require; a narrow request can stop at any step. Music, narration, captions, and effects are creative choices.

## Start here

Read [AGENTS.md](AGENTS.md) for boundaries and [COMMERCIAL-WORKFLOW.md](AGENTS/workflows/COMMERCIAL-WORKFLOW.md) for commercial preparation. Resume from the commercial's current record when one exists. Use [VERIFICATIONS.md](AGENTS/docs/VERIFICATIONS.md) for checks.

When a consequential creative decision remains open, read [CREATIVE-DEVELOPMENT.md](AGENTS/workflows/CREATIVE-DEVELOPMENT.md). It connects the brief to the script and supports later refinement without restarting settled choices or adding a preparation step.

Workspace purpose and operating methods live here. Each commercial owns its brand/product facts, creative decisions, and visual direction in `workspace/<commercial-name>/<commercial-name>-commercial.md`. The system does not require root PRODUCT or DESIGN documents.

## Locations and boundaries

```text
AGENTS/workflows/COMMERCIAL-WORKFLOW.md
AGENTS/workflows/CREATIVE-DEVELOPMENT.md
AGENTS.md
AGENTS/docs/                         # investigation, plan, execution, instruction review, verification
scripts/check_docs.py                # dependency-free canonical document checker
workspace/<commercial-name>/
  <commercial-name>-commercial.md
  assets/                           # retained copies, including reused references
  revisions/<task-name>/            # task-owned settings, changes and generated files
  sources/                          # shared editable picture/UI sources, when used
  tools/                            # reusable commercial build/capture/audio/package tools
  archives/                         # ordinary preserved history, when used
  output/                           # shallow, uniquely versioned rendered deliverables
    packages/                       # standalone handoffs generated on demand
  local/                            # disposable drafts
productions/commercials/<commercial-name>/
  README.md                         # current revision, readiness, and production instructions
  brief.md                          # selected direction, when available
  script.md
  storyboard.md
  assets/                           # commercial-wide selected assets
  prompts/                          # shared asset-generation prompts
  scenes/SC01/
    scene.md                        # shared setting and continuity
    assets/
    prompts/
    shots/S01/
      shot.md                       # action, timing, camera, sound, and asset assignments
      assets/
      prompts/
  deliverables/                     # finished outputs, when available
  archives/v001/                    # independent snapshot of a previous handoff
workspace/<work-item>/               # optional records for system work or separately requested artifacts
tests/runs/<run-id>/                 # test evidence only when applicable
```

Choose a distinct commercial name, inspect existing contents before writing, and follow [selective delivery versioning](AGENTS.md#selective-delivery-versioning) for deliveries and checkpoints. The layout above supplies locations when needed; it does not require an archive for every edit or ordinary project fix. There is no mandatory per-brand hierarchy. Each commercial owns independent copies of reused assets and records their origin; another commercial's mutable files cannot be its production dependencies.

`workspace/` holds exploration, drafts, rejected candidates, development records, original sources, and staged packages. `productions/commercials/` holds clean, usable selected material copied progressively after applicable checks. Create commercial folders and sections only when they contain real selected material; the empty production root is retained with `.gitkeep` until then. System records, evaluation samples, and historical evidence stay in their existing locations.

Production brief, script, storyboard, scene, and shot documents are curated exports, not additional development records or preparation steps. The workspace commercial record remains the decision and resume owner. Keep current material directly under the production commercial folder, preserving previous handoffs as independent ordinary folders or archives. Follow the workflow's [production package](AGENTS/workflows/COMMERCIAL-WORKFLOW.md#production-package) and [promotion and revisions](AGENTS/workflows/COMMERCIAL-WORKFLOW.md#promotion-and-revisions) rules. A portable package must work without workspace files, personal paths, or mutable dependencies on another commercial. Prompt readiness, asset completeness, and a rendered commercial are separate states.

For rendered work, the commercial README identifies current videos and review states, the active named task, ordinary historical archives, and build/preview/package commands. Tasks reference common inputs in commercial `assets/` and shared editable sources through relative paths. Install development dependencies once per commercial; keep environments and caches out of task contents. Keep versioned videos and retained masters directly accessible in `output/`; generate standalone editable packages in `output/packages/` only when needed. The commercial workflow owns shared-input preservation and package independence. Existing projects retain their normal editing conventions for ordinary fixes.

No application runtime, server, package manager, rendering pipeline, or commercial asset library has been selected. No application install/build/start command is required for ordinary preparation. Another repository may supply verified product material when accessible; reading it does not authorize edits there.

The inherited `workspace/base-reorganization/`, `workspace/self-contained-instructions/`, and `workspace/frontend-design-workflow/` directories preserve historical template records. Their old links, status, source assumptions, and `check_docs.py` describe the original template, not this project's current checks. They remain unchanged and are excluded from current canonical-link validation.

## Tools and prerequisites

Capabilities vary by agent session. Verify relevant access at task entry; this list describes methods, not guaranteed installed tools or permissions.

| Need | Method and boundary |
| --- | --- |
| Read records, manage files, check format and packaging | Active filesystem/shell tools; preserve original files and use repository-local output. |
| Inspect images | Open the actual files with an available image viewer before selection, reuse, or editing. Metadata checks alone do not establish appearance. |
| Generate or edit suitable visual assets | Available image-generation skill and tool, following its current instructions; retain selected results locally and inspect them. |
| Research Higgsfield modes and reference support | Current official documentation for the selected model and mode; record source and check date in the commercial. |
| Produce assets externally | Self-contained prompts and explicit file/reference assignments. User account access and generation are separate prerequisites. |
| Exact product, logo, or 3D appearance | Supplied authoritative artwork, approved 3D assets, or verified product captures; access and permission must be established. |

Image generation and web research were exposed to the implementation session on 2026-10-10. They were not used to generate commercial assets or test a Higgsfield account. The Python command below was verified locally; a future agent must confirm its own executable access. Python is only needed for that checker, not for brainstorming or drafting a commercial.

## Commands and verified operating methods

For affected canonical documentation, run from the repository root with Python 3.10 or newer, using only its standard library:

```powershell
python scripts/check_docs.py
```

The checker validates the nine canonical Markdown documents' local targets and heading anchors, formatting, absence of retired routing, and independence from task records and machine-local references. It does not fetch external URLs, validate all historical records, prove host loading, inspect assets, or evaluate creative quality. Documentation review and the commercial checks in VERIFICATIONS remain necessary.

Run the checker's focused tests when its implementation or tested contract changes:

```powershell
python -m unittest discover -s tests -p test_check_docs.py
```

For current task records whose links or formatting need checking, optionally add `--record workspace/<work-item>` to the checker command, substituting an existing repository-local directory. It checks that directory's Markdown without making it a canonical dependency. Neither creating a record nor editing documentation requires checker tests. The tests use disposable fixtures to exercise missing files/anchors, retired routing, noncanonical dependencies, formatting, and machine-local links. They do not inspect historical records or commercial assets.

```powershell
git diff --check
git status --short
```

These inspect tracked changes and tracking state. A clean diff check cannot validate untracked file contents; the Python checker reads canonical files directly. No command stages or commits anything. If Python is unavailable, manually review the same files and links and state the missing automated check.

Review reading paths affected by a behavioral change against the current canonical chain; an isolated copy of the whole system is not required. For commercial preparation, apply only the checks relevant to the requested stage and actual material: inspect selected assets, compare related views, reconcile prompts and file roles, and inspect a package at its intended handoff location when handing one off. Use [VERIFICATIONS](AGENTS/docs/VERIFICATIONS.md#common-verification) to decide whether additional checks are needed. A concise result can suffice; artifact locations do not require creating artifacts.

## Documentation map

| Document | Responsibility |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Working boundaries, routing, preservation, and common record policy. |
| [COMMERCIAL-WORKFLOW.md](AGENTS/workflows/COMMERCIAL-WORKFLOW.md) | Five preparation steps, one commercial record, references, continuity, prompts, and handoff. |
| [CREATIVE-DEVELOPMENT.md](AGENTS/workflows/CREATIVE-DEVELOPMENT.md) | Audience opportunity, concepts, critique, recommendation, selected idea development, and creative quality criteria. |
| [VERIFICATIONS.md](AGENTS/docs/VERIFICATIONS.md) | Document, asset, continuity, prompt, handoff, and conditional script checks. |
| [INVESTIGATIONS.md](AGENTS/docs/INVESTIGATIONS.md) | Evidence, factual premises, capability sufficiency, and blockers. |
| [PLANS.md](AGENTS/docs/PLANS.md) | Requested proposed/agreed approaches and separate planning artifacts. |
| [IMPLEMENTATIONS.md](AGENTS/docs/IMPLEMENTATIONS.md) | Authorized execution, completion, stops, and resumption. |
| [INSTRUCTIONS_MAKER.md](AGENTS/docs/INSTRUCTIONS_MAKER.md) | Instruction-system evaluation and revision; a global skill is not required. |

## Records, sharing, and privacy

Use [AGENTS workspace handling](AGENTS.md#workspace-handling). Ordinary commercial work uses one progressive record; extra records or empty directories are not required.

At the 2026-10-10 implementation check, the existing instructions, checker, and tests were tracked; newly created guidance, task records, and test evidence require a fresh tracking check before sharing. Local presence does not guarantee availability after a clone. Recommend selectively sharing durable text and necessary permitted assets while excluding bulky generated evidence, disposable files, secrets, and machine-local configuration. A repository ignore policy has not been established; this recommendation is not staging, committing, or access authorization.

Do not save credentials, private authentication state, or unnecessary personal data in records or assets. Record inaccessible prerequisites and the work they block. Retain earlier deliverables and evidence; cleanup is limited to safe, permitted task-owned scratch.

## Supporting guidance

Official Higgsfield [consistency guidance](https://higgsfield.ai/blog/consistent-characters-locations) and [prompting guidance](https://higgsfield.ai/blog/seedance-2-5-prompting-guide) were checked on 2026-10-10. They support reusable visual references and explicit shot direction. These techniques improve control but do not guarantee consistency; inspect generated results. Check documentation again for the model and mode selected for an actual handoff rather than treating this review as verified account capability or permanent model limits.
