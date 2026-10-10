# Production separation implementation

## Outcome and authorization

Implement the user's supplied plan: keep development in workspace and establish `productions/commercials/` for curated, independently usable commercial material. Scoped edits cover README, AGENTS, the commercial workflow, verification guidance, and the empty production root. Verification uses the existing documentation checker, all six existing tests, diff checks, and five disposable packaging examples. No runtime, provider configuration, automated promotion command, migration, staging, commit, or publishing is included.

## Current state

Implementation and verification are complete. The production root contains only `.gitkeep`; inspected workspace contents contain system records and evidence, with no actual commercial packages to migrate. Earlier edits and records were preserved. Next action: prepare a real selected commercial package when requested, following the current canonical workflow. There is no remaining implementation work or required external generation for this system change.

## Changes

- README establishes the two locations and selected-material layout; AGENTS routes promotion and revision handling to the commercial workflow and distinguishes commercial staging from noncommercial outputs.
- The commercial workflow retains five preparation steps and one workspace decision record. It defines curated exports, scene/shot ownership, stable shot IDs, descriptive prompts, narrowest shared asset placement, explicit selection and local dependency copying, missing-output status, coupled revisions, and independent archives before modifying handed-off packages.
- Verification guidance adds source-byte, dependency, isolation, exclusion, partial-readiness, and archive-preservation checks. No existing checker or test source was changed by this work.

## Verification and evidence

Evidence is in `tests/runs/2026-10-10-production-separation/`:

- [Canonical check](../../tests/runs/2026-10-10-production-separation/canonical.log): nine canonical documents and 87 local links/anchors pass formatting and canonical independence checks.
- [Existing tests](../../tests/runs/2026-10-10-production-separation/tests.log): all six pass. Python bytecode writes were disabled to preserve the tracked cache files.
- [Packaging examples](../../tests/runs/2026-10-10-production-separation/package-checks-final.log) and [inventories and outcomes](../../tests/runs/2026-10-10-production-separation/cases-final-results.json): prompt-only promotion, one shared scene asset used by stable S07/S12 IDs, expected rejection of missing and escaping dependencies, updated asset with reconciled dependent prompts, and complete archive preservation before revision all pass. The initial execution is retained separately; the final run uses an explicit selected-file list and a fresh fixture directory.
- [Reading-path review](../../tests/runs/2026-10-10-production-separation/reading-path-review.md): current canonical owners cover the supplied plan without requiring history, external rules, new approval gates, or extra preparation records.
- [Preservation check](../../tests/runs/2026-10-10-production-separation/preservation.log): original sources, earlier evidence, existing checker/tests/cache files, and unrelated material match the pre-edit hash inventory; only the four authorized documents changed among pre-existing files.
- [Record check](../../tests/runs/2026-10-10-production-separation/records.log) and [diff check](../../tests/runs/2026-10-10-production-separation/diff-check.log): pass. New files were checked directly because ordinary Git diff omits untracked content.
- [Supplemental check](../../tests/runs/2026-10-10-production-separation/supplemental.log): an independent copy of all nine canonical documents passes without external rule files. New Markdown links/formatting and fixture Python syntax/whitespace pass. The [initial harness failure](../../tests/runs/2026-10-10-production-separation/supplemental-initial-failure.log) mistakenly parsed Python fixture strings as Markdown links; corrected by checking code as code and applying Markdown link validation only to Markdown documents.

The fixtures and their exercise script are retained test evidence, not an installed promotion tool. Their Markdown is inspected against independent package roots so workspace escapes are rejected even when source files exist outside those roots. Available assets are compared with source bytes. Missing outputs are declared without broken available-asset links. Archives are verified separately and remain byte-identical after current edits. These synthetic fixtures establish packaging mechanics and authored rule coverage, not visual acceptance, actual commercial selection, independent agent execution, Higgsfield generation, or rendered-commercial quality.

The missing-dependency fixture intentionally fails package validation; the exercise passes only when both the absent asset and the existing out-of-package dependency are rejected. The supplemental harness failure above was corrected and its affected checks pass; all required checks pass. Git's line-ending warnings do not indicate diff-check failure.

## Grounding and limits

The production layout is the user's chosen local convention; no provider loading or reference capability was changed or inferred. Current official [Python copying documentation](https://docs.python.org/3/library/shutil.html) and [path resolution documentation](https://docs.python.org/3/library/pathlib.html) were consulted on 2026-10-10 for the fixture's file-copy and isolation checks. Copying files does not promise preservation of all filesystem metadata; acceptance here compares file inventories and content hashes, not ACLs or alternate data streams. Python 3.13.2 was available locally and the actual executions above establish the tested behavior.

The new production root, implementation record, and run evidence are local and untracked at completion. Durable documentation includes the operative rules; it does not depend on this record or its evidence to apply them. Sharing still requires the repository's normal tracking/access checks and explicit authorization for staging or publishing.
