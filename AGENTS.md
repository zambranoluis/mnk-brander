# Working agreement

This is the entry point for work in `mnk-brander`, a workspace for preparing commercials for multiple brands. Read only the routed material relevant to the request. A link is a reading instruction, not proof that a host automatically loaded the linked file.

Start with [README.md](README.md). For commercial preparation, read [COMMERCIAL-WORKFLOW.md](AGENTS/workflows/COMMERCIAL-WORKFLOW.md) and the existing commercial record when present. [VERIFICATIONS.md](AGENTS/docs/VERIFICATIONS.md) owns applicable checks. Workspace purpose belongs in README; each commercial's product, brand, and visual decisions belong in its commercial record.

## How work proceeds

- Identify whether the request is an answer, review, investigation, plan, or implementation, whether saving is requested, and the authorized outcome and stop boundary.
- For commercial work, enter at the requested step and gather only information needed there. An idea, existing record, supplied assets, or a request for one stage are all valid starting points. Use the workflow's single-record policy.
- Check material factual premises through [INVESTIGATIONS.md](AGENTS/docs/INVESTIGATIONS.md). Separate verified product facts, proposed creative treatment, and unknowns.
- Invite input when a consequential preference or decision remains open. Explain feasible choices and whether an answer is invited or required. Continue independent authorized work while an answer is pending; do not invent an answer for dependent work. Settled decisions stay valid until revised; stages do not create repetitive approval questions.
- For a requested plan, read [PLANS.md](AGENTS/docs/PLANS.md). A review, investigation, or saved plan does not itself authorize implementation.
- For implementation, read [IMPLEMENTATIONS.md](AGENTS/docs/IMPLEMENTATIONS.md). It owns execution, correction, stops, completion, and resumption; the commercial workflow owns commercial record content.

### Proportional handling

| Work | Handling |
| --- | --- |
| Light: one clear outcome and verification boundary, no expected handoff | Complete directly with relevant verification; conversation can be sufficient. |
| Medium: bounded outcome needing investigation or dependent stages | Give a short approach and continue authorized work unless a material decision remains open. Preserve useful findings and state. |
| Heavy: independent mechanisms, substantial risk, or likely resumption | Present an approach before dependent execution, resolve material choices, and preserve a precise resume point. Split unrelated objectives. |

Honor explicit artifacts and stops at every size. File count, record creation, or a routine failed check does not alone increase work size.

## Routing

| Decision | Owner |
| --- | --- |
| Workspace purpose, layout, available methods, prerequisites, commands, sharing, and documentation map | [README.md](README.md) |
| Brief, script, storyboard, visual references, prompts, commercial record, and production handoff | [COMMERCIAL-WORKFLOW.md](AGENTS/workflows/COMMERCIAL-WORKFLOW.md) |
| Discovering, comparing, recommending, and developing ideas when a consequential creative decision is open | [CREATIVE-DEVELOPMENT.md](AGENTS/workflows/CREATIVE-DEVELOPMENT.md) |
| Document, asset, continuity, prompt, handoff, and conditional script checks | [VERIFICATIONS.md](AGENTS/docs/VERIFICATIONS.md) |
| Investigation, evidence, capability sufficiency, and unresolved facts | [INVESTIGATIONS.md](AGENTS/docs/INVESTIGATIONS.md) |
| Instruction-system evaluation, design, and revision | [INSTRUCTIONS_MAKER.md](AGENTS/docs/INSTRUCTIONS_MAKER.md), only when judging or changing instructions |
| Proposed or agreed approach and requested separate plan | [PLANS.md](AGENTS/docs/PLANS.md) |
| Authorized execution, stops, completion, and resumption | [IMPLEMENTATIONS.md](AGENTS/docs/IMPLEMENTATIONS.md) |
| Common record maintenance, preservation, locations, and cleanup | [Workspace handling](#workspace-handling) below |

## Workspace handling

Resolve paths from the repository root. Create only needed records and directories.

```text
workspace/<commercial-name>/
├── <commercial-name>-commercial.md  # decisions and current preparation state
├── assets/                         # independent retained references and assets
├── output/                         # staged candidate production packages
└── local/                          # disposable working files

productions/commercials/<commercial-name>/
├── README.md                       # current revision, readiness, and production instructions
├── brief.md, script.md, storyboard.md  # curated selected direction, when available
├── assets/, prompts/               # commercial-wide shared material
├── scenes/SC01/                    # scene.md, shared assets/prompts, shots/S01/shot.md
├── deliverables/                   # finished outputs, when available
└── archives/v001/                  # independent earlier handoff

workspace/<work-item>/               # system revisions or requested separate artifacts
├── investigation.md                # findings, when worth retaining or requested
├── plan.md                         # approach, when worth retaining or requested
├── implementation.md               # execution and resume state, when needed
├── records/                        # substantial supporting evidence
├── assets/
├── output/
└── local/

tests/runs/<run-id>/                 # generated test evidence, when tests are involved
```

### Record decisions and maintenance

Use [one commercial record](AGENTS/workflows/COMMERCIAL-WORKFLOW.md#one-working-record-per-commercial) when requested or when commercial decisions and staged work need preservation. Ordinary commercial work does not also require separate investigation, plan, design, and implementation records. Simple brainstorming may stay conversational. Explicit requests for separate artifacts are honored.

Keep development decisions and original sources in workspace. Production documents are curated exports of selected material, not competing development records. Follow the workflow's [production package](AGENTS/workflows/COMMERCIAL-WORKFLOW.md#production-package) and [promotion and revisions](AGENTS/workflows/COMMERCIAL-WORKFLOW.md#promotion-and-revisions) rules when copying material into production or revising a handoff. Create only populated commercial folders and sections; preserve existing shot IDs when grouping them into scenes.

For system changes or other work outside commercial preparation, save findings costly to reconstruct, an approach worth preserving, or execution state needed for resumption. Each record is independently optional. [INVESTIGATIONS](AGENTS/docs/INVESTIGATIONS.md#investigation-record), [PLANS](AGENTS/docs/PLANS.md#plan-structure), and [IMPLEMENTATIONS](AGENTS/docs/IMPLEMENTATIONS.md#implementation-record) own their respective records. Without a saved record, report substantive state in conversation.

Keep the primary record concise and current. After a material change, reconcile affected decisions, dependencies, prompts, selected assets, verification limits, unresolved choices, authorization, and next action. Preserve actual failures and corrections; remove superseded choices unless they explain the current result. Before handoff, read the existing record and its linked prerequisites together and correct contradictions.

Lasting workspace rules belong in their canonical owners, not task history. Commercial-specific decisions remain with their commercial. The canonical chain must state each adopted rule's operative criteria, scope, and material exceptions without depending on work records, memory, personal files, previous conversations, or external references. Internal routing and supporting citations are allowed. Live evidence may still be needed for current facts.

Inherited historical records describe earlier template work. Preserve them and their evidence; do not treat their old requirements, external paths, or checks as current project policy.

### Assets, evidence, sharing, and cleanup

- Retain selected generated images and supplied references in the commercial's `assets/`; copy retained output out of provider-managed locations when needed. Follow the workflow's [independent-copy rule](AGENTS/workflows/COMMERCIAL-WORKFLOW.md#reuse-and-preservation).
- For commercials, use workspace `output/` to stage candidate packages and `productions/commercials/<commercial-name>/` for selected production material. Keep disposable drafts and intermediates in `local/` and substantial system-review evidence in `records/`. Noncommercial work-item deliverables remain in their `output/`. Additional development prompt files are useful only when their length makes the commercial record unwieldy; production prompts follow the workflow's descriptive file and assignment rules.
- Keep generated diagnostic output and automated or manual test evidence under `tests/runs/<run-id>/` with separate run IDs. Test sources and fixtures retain their established locations. Preserve native tool-required outputs and copy retained evidence into governed roots when necessary. These locations do not require artifact creation. Retain new detailed diagnostics when requested, useful for resumption, costly to reconstruct, or needed to explain a material unresolved failure; otherwise a concise result can suffice. Preserve existing evidence and deliverables.
- Inspect actual tracking and access before claiming that a collaborator can use a record or package. Where sharing policy is absent, recommend sharing durable text and necessary permitted assets, with bulky evidence and machine-local output excluded; this grants no staging or committing permission. Keep secrets and private authentication state out of shared records.
- Retain records, selected assets, finished deliverables, cited evidence, and earlier productions. Clean only task-owned disposable scratch when permitted, safe, and no longer needed. Completion does not authorize automatic deletion.

## Authority and scope

- Implementation authorizes scoped edits, coupled documentation, and verification. A review or plan request authorizes findings or its requested record, not production edits.
- Do not revise the instruction system during unrelated commercial work. A request specifically to revise it authorizes that revision.
- Record only verified facts and decisions already authorized within scope. Observed output, starter text, or a supplied example does not establish approved requirements. Keep unresolved material choices explicit with the decision maker and dependent work.
- Reading another repository or service does not authorize editing it. Establish its owner and obtain explicit authorization before crossing the project boundary.
- Do not stage, commit, push, deploy, publish, change access, or alter provider or multi-agent settings unless requested.
- Preserve unrelated user changes, user-managed processes, existing media, and earlier evidence. Reuse compatible services when useful and manage only resources created by this work.
- System, platform, and explicit user instructions govern over repository guidance. Prose links do not create host instruction priority or expand authorization.

## Tools and reporting

At task entry, check material capabilities exposed to the active session under [INVESTIGATIONS's sufficiency test](AGENTS/docs/INVESTIGATIONS.md#sufficiency-test). Recommend a capability when it would materially improve the result; verify access before depending on it. Follow the installed skill's current instructions when used. An unavailable optional capability does not block work an available equivalent can complete.

For suitable image generation and editing, use the available image-generation skill. External generation follows the commercial workflow's self-contained prompt and reference assignments. Preparing a Higgsfield package does not imply account access, tested generation, or permission to upload, spend credits, or publish.

Report the actual changes, checks, inspected evidence, failures, remaining generation or testing, and exact next action. Do not simulate an outcome. Communicate in the user's language; current repository guidance is written in English.
