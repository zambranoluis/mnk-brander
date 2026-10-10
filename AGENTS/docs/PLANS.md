# Plans

This document owns preparing, presenting, saving, and revising a proposed or agreed approach. A conversational plan is a reviewable artifact even when unsaved. Ordinary commercial planning belongs in the [commercial record](../workflows/COMMERCIAL-WORKFLOW.md#one-working-record-per-commercial); it does not require a separate plan. For system work or an explicitly requested separate artifact, a saved `plan.md` preserves the approach and its approval status. [IMPLEMENTATIONS.md](IMPLEMENTATIONS.md) owns execution methods; current commercial state remains in the commercial record.

[AGENTS.md](../../AGENTS.md) owns authorization, proportional handling, and [common record and workspace policy](../../AGENTS.md#workspace-handling). [INVESTIGATIONS.md](INVESTIGATIONS.md) owns grounding; [VERIFICATIONS.md](VERIFICATIONS.md) supplies required checks, with methods and prerequisites through [README.md](../../README.md).

## Preparing and presenting

When the user requests a plan or active Plan mode requires one, investigate enough to support a decision-complete approach proportionate to the work. Check material capabilities under INVESTIGATIONS. Present the first plan even when the user also asks to save it. Carry material findings and evidence limits into the plan; display the full investigation only when requested. An implementation request may need only a short approach under AGENTS's proportional handling unless a material choice requires review.

Before presenting or saving a plan, confirm that it preserves the chosen approach, scope and authorization, material dependencies and accessible prerequisites, unresolved decisions and blocked work, observable acceptance, and applicable checks. Another agent must be able to implement it without inventing a material requirement, choosing an unsettled approach, or guessing how success is checked. If this test fails, investigate a factual gap or obtain the needed user decision. An artifact describing unresolved choices may be useful, but must not be called ready for execution.

Use actual host Plan mode when active. If the host exposes a mode-switch capability, use it for requested planning. Otherwise plan to the same substantive standard in conversation and state that Plan mode was not activated; do not claim an unavailable tool was called. Follow actual write restrictions. If only a designated planning artifact is writable, use it as permitted; if no writes are permitted, present the plan and needed unsaved state in conversation. Neither planning nor plan saving expands implementation authorization.

## Plan structure

Keep a compact plan for a bounded approach; expand to ordered stages when independent mechanisms, substantial risk, or dependencies make that necessary. Include the following information at the detail needed to implement safely, without empty sections that add no useful state:

| Content | What belongs in it |
| --- | --- |
| Objective and boundaries | What done means, authorized scope, constraints, and explicit exclusions that affect implementation. |
| Approach and decisions | The chosen approach and rationale, whether proposed or approved, material choices, and any unresolved decision with the work it blocks. |
| Context and dependencies | Owners, contracts, accessible prerequisites, and material findings with their evidence limits; link investigation details when present. |
| Stages and acceptance | Ordered outcomes at meaningful verification boundaries, observable acceptance, and applicable VERIFICATIONS checks. Distinguish prompt readiness, asset completeness, and untested external production. |

Use `workspace/<work-item>/plan.md` under AGENTS's workspace policy when the approach needs a saved record. Link implementation.md when it exists instead of duplicating progress or verification results. A plan prepared or saved before execution has no fabricated execution outcomes.

## Corrections and saving

Treat each correction as a revision of the last complete plan. Carry forward the original objective, unaffected approach, dependencies, constraints, acceptance, authorization, and accepted earlier corrections. A new objective is an explicit rescope or separate work item. If the prior complete plan is unavailable, recover it from accessible records and conversation; re-investigate missing material facts rather than reconstructing it from the latest comment alone.

During feedback, explain the interpreted change and its material effects, and settle remaining factual or user decisions before dependent work. Do not repost the full plan after every comment unless the host requires it. Once direction is settled, reconcile the complete plan and existing records under [AGENTS's maintenance policy](../../AGENTS.md#record-decisions-and-maintenance). Present the complete revised plan when a material approach changed; for routine wording changes, summarize and incorporate them. If a saved plan exists, update it and point to it instead of reprinting it unless requested or required by the host. Mark a materially revised approach as proposed until the needed decision is settled; existing authorization remains valid for unaffected work.

A request to save authorizes writing the complete corrected plan when the host permits it, but not implementation. Compare it with the presented plan and user corrections before saving; read it back afterward to confirm that no material decision, authorization, or acceptance was lost. Record proposed or approved status from what the user actually decided. Report the saved path without reprinting the plan unless requested.

If writing is prohibited, defer saving until the host permits it; a prior save request remains valid and needs no second approval. When saving becomes possible, use accessible evidence and re-investigate missing or stale material facts. A user request to execute a conversational plan follows the current authorization and host mode without requiring a save first; execution and any durable execution record follow IMPLEMENTATIONS.
