# Implementations

This document owns authorized execution, verification results, stops, completion, handoff, and resumption. [AGENTS.md](../../AGENTS.md) owns authorization, proportional handling, and [common record and workspace policy](../../AGENTS.md#workspace-handling). [INVESTIGATIONS.md](INVESTIGATIONS.md) owns grounding and evidence-dependent blockers; [PLANS.md](PLANS.md) owns proposed or agreed approaches. [VERIFICATIONS.md](VERIFICATIONS.md) supplies applicable checks; [README.md](../../README.md) supplies methods and prerequisites. [COMMERCIAL-WORKFLOW.md](../workflows/COMMERCIAL-WORKFLOW.md) owns commercial record content and handoff states.

## Execute and correct

Begin only within the user's authorization and the host's actual mode and write restrictions. Implementation may follow an agreed conversational approach without a saved plan. Use AGENTS's proportional handling; continue independent authorized work while a required decision blocks only dependent work.

Make the scoped change and coupled edits needed for correctness. Preserve unrelated work and earlier material. Update affected owning documents, commercial decisions, and dependencies. Follow VERIFICATIONS and the commercial workflow when applicable rather than copying their standards into an execution record.

Execute stages at meaningful outcome and verification boundaries. Report meaningful phase and stage transitions for substantial work; keep light work concise. A stage is complete only when its observable acceptance and required verification are met. Intent, a clean diff, or an unrelated passing check does not establish completion.

Record material discoveries when they occur. A new factual or capability gap returns to INVESTIGATIONS; a changed approach returns to PLANS. Resolve the needed decision before executing a material departure from a reviewed approach, while continuing unaffected authorized work. Routine corrections within that approach continue without a new approval gate.

## Review and verification

Review the complete scoped change against the request, applicable requirements, selected references, dependencies, and actual files. Correct findings and complete relevant checks under VERIFICATIONS. Re-run checks affected by corrections. Use documented methods and prerequisites; distinguish change-caused failures from directly verified pre-existing failures.

Record what actually ran, its outcome, evidence inspected, and its limits. Preserve relevant failed checks and corrections with the latest result clear. An unavailable required check remains unverified: state its blocker and exact remaining verification. Use INVESTIGATIONS's sufficiency test for missing observations; proceeding with sufficiently grounded implementation does not establish affected acceptance.

## Implementation record

For ordinary commercial work, save progress and verification in the [commercial record](../workflows/COMMERCIAL-WORKFLOW.md#one-working-record-per-commercial) when needed or requested. It is the primary commercial decision and resume record; no separate implementation file is required.

For system revisions or other work outside ordinary commercial preparation, save `workspace/<work-item>/implementation.md` when execution meets AGENTS's continuity test or the user requests it. Honor explicit requests for separate commercial artifacts, linking them from the commercial record without competing current-state copies. No investigation or plan file is required solely because an implementation record exists.

| Content | What belongs in it |
| --- | --- |
| Outcome and authorization | The current objective, permitted scope and requested stops; link the agreed approach when available. |
| Current state | The last verified result, current stage, immediate next action, and material blockers. |
| Progress | Actual work completed and remaining; use not started, in progress, blocked, or complete for independent stages when useful. |
| Verification results | What ran and what it established, evidence links, failures and corrections, unavailable checks and exact remaining work. |
| Discoveries or deviations | Material execution findings, decision effects, and resolved or unsettled changes to the approach. |
| Remaining work | Unfinished implementation or verification, deliberately deferred work and its owner or decision maker, and the next action. |

Keep bounded work compact; expand only when independent stages or resumption needs justify it. Include substantive state, not empty headings or a copy of these rules. Update current state and progress at meaningful boundaries and after failures; if only one update is possible before stopping, preserve the last verified state and next action. Apply AGENTS's common record-maintenance rules to all existing records.

## Stops, completion, and handoff

- A requested stop after a named stage or after every stage takes effect once that stage's actual result and resume point are recorded. If the user requests an immediate stop, end implementation immediately. When permitted, record the last verified state, unfinished work, and next action; do not perform further implementation to make the record appear complete.
- At handoff, describe actual changes, checks and limits, unfinished work, and the exact next action. Do not claim the requested outcome complete while its required work or checks remain. For commercials, distinguish asset-complete from prompt-only handoffs and list external generation or testing still needed. A complete prompt-only request does not imply complete assets or a rendered commercial.
- Before completion or handoff, reconcile existing records and owning documentation. Move settled lasting decisions to their project owners. Keep task deliverables and evidence under AGENTS's workspace policy; completion does not itself authorize cleanup of retained material.

## Resumption

For commercials, read the commercial record's current state, settled choices, shot dependencies, selected assets, prompts, checks, and next action. For other work, read the implementation record and its linked approach and evidence. If no record exists, recover the authorized objective and last known state from accessible conversation and sources; do not invent execution history. Check relevant file changes and prerequisite availability before relying on earlier results.

Record material drift, re-investigate stale facts, and revise the approach when needed. Resolve a material change to the reviewed approach before dependent execution; continue routine corrections and unaffected authorized work. External memory may help locate evidence but is not a required prerequisite for continuing.
