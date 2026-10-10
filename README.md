# mnk-brander

A workspace for preparing commercials for multiple brands. Its normal endpoint is a verified asset and prompt package ready for the user's production work in Higgsfield. It also supports idea development, a single preparation step, and prompt-only handoffs.

The five preparation steps are **brief → script → storyboard → references and assets → handoff**. Enter where the request and existing material require; a narrow request can stop at any step. Music, narration, captions, and effects are creative choices.

## Start here

Read [AGENTS.md](AGENTS.md) for boundaries and [COMMERCIAL-WORKFLOW.md](COMMERCIAL-WORKFLOW.md) for commercial preparation. Resume from the commercial's current record when one exists. Use [VERIFICATIONS.md](AGENTS/docs/VERIFICATIONS.md) for checks.

Workspace purpose and operating methods live here. Each commercial owns its brand/product facts, creative decisions, and visual direction in `workspace/<commercial-name>/<commercial-name>-commercial.md`. The system does not require root PRODUCT or DESIGN documents.

## Locations and boundaries

```text
COMMERCIAL-WORKFLOW.md
AGENTS.md
AGENTS/docs/                         # investigation, plan, execution, instruction review, verification
scripts/check_docs.py                # dependency-free canonical document checker
workspace/<commercial-name>/
  <commercial-name>-commercial.md
  assets/                           # retained copies, including reused references
  output/                           # finished packages and production instructions
  local/                            # disposable drafts
workspace/<work-item>/               # optional records for system work or separately requested artifacts
playwright/runs/<run-id>/            # test evidence only when applicable
```

Choose a distinct commercial name, inspect existing contents before writing, and preserve earlier versions. There is no mandatory per-brand hierarchy. Each commercial owns independent copies of reused assets and records their origin; another commercial's mutable files cannot be its production dependencies.

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

Run from the repository root with Python 3.10 or newer, using only its standard library:

```powershell
python scripts/check_docs.py
```

The checker validates the eight canonical Markdown documents' local targets and heading anchors, formatting, absence of retired routing, and independence from task records and machine-local references. It does not fetch external URLs, validate all historical records, prove host loading, inspect assets, or evaluate creative quality. Documentation review and the commercial checks in VERIFICATIONS remain necessary.

For a system revision, also check its current records and the checker's focused tests:

```powershell
python scripts/check_docs.py --record workspace/commercial-preparation-system
python -m unittest discover -s tests -p test_check_docs.py
```

`--record` accepts an existing repository-local workspace directory and checks its Markdown as current task evidence without making it a canonical dependency. The tests use disposable fixtures to exercise missing files/anchors, retired routing, noncanonical dependencies, formatting, and machine-local links. They do not inspect historical records or commercial assets.

```powershell
git diff --check
git status --short
```

These inspect tracked changes and tracking state. A clean diff check cannot validate untracked file contents; the Python checker reads canonical files directly. No command stages or commits anything. If Python is unavailable, manually review the same files and links and state the missing automated check.

For a system revision, test representative reading paths against the current canonical chain. For commercial preparation, open selected assets, compare related views, reconcile prompts and actual file roles, and open the final package in its intended handoff location. Record what was inspected and what still needs generation or testing.

## Documentation map

| Document | Responsibility |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Working boundaries, routing, preservation, and common record policy. |
| [COMMERCIAL-WORKFLOW.md](COMMERCIAL-WORKFLOW.md) | Five preparation steps, one commercial record, references, continuity, prompts, and handoff. |
| [VERIFICATIONS.md](AGENTS/docs/VERIFICATIONS.md) | Document, asset, continuity, prompt, handoff, and conditional script checks. |
| [INVESTIGATIONS.md](AGENTS/docs/INVESTIGATIONS.md) | Evidence, factual premises, capability sufficiency, and blockers. |
| [PLANS.md](AGENTS/docs/PLANS.md) | Requested proposed/agreed approaches and separate planning artifacts. |
| [IMPLEMENTATIONS.md](AGENTS/docs/IMPLEMENTATIONS.md) | Authorized execution, completion, stops, and resumption. |
| [INSTRUCTIONS_MAKER.md](AGENTS/docs/INSTRUCTIONS_MAKER.md) | Instruction-system evaluation and revision; a global skill is not required. |

## Records, sharing, and privacy

Use [AGENTS workspace handling](AGENTS.md#workspace-handling). Ordinary commercial work uses one progressive record; extra records or empty directories are not required.

At the 2026-10-10 repository check, only `.gitattributes` was tracked; instructions, inherited records, and provider configuration were untracked. Local presence does not guarantee availability after a clone. Recheck tracking before a collaboration handoff. Recommend selectively sharing durable text and necessary permitted assets while excluding bulky generated evidence, disposable files, secrets, and machine-local configuration. A repository ignore policy has not been established; this recommendation is not staging, committing, or access authorization.

Do not save credentials, private authentication state, or unnecessary personal data in records or assets. Record inaccessible prerequisites and the work they block. Retain earlier deliverables and evidence; cleanup is limited to safe, permitted task-owned scratch.

## Supporting guidance

Official Higgsfield [consistency guidance](https://higgsfield.ai/blog/consistent-characters-locations) and [prompting guidance](https://higgsfield.ai/blog/seedance-2-5-prompting-guide) were checked on 2026-10-10. They support reusable visual references and explicit shot direction. These techniques improve control but do not guarantee consistency; inspect generated results. Check documentation again for the model and mode selected for an actual handoff rather than treating this review as verified account capability or permanent model limits.
