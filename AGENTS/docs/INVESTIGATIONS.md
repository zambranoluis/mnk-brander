# Investigations

This document owns how a task is grounded and what counts as evidence. [AGENTS.md](../../AGENTS.md) owns authorization, proportional handling, and common workspace policy; investigation identifies the work within that boundary. [README.md](../../README.md) supplies workspace context, available methods, and prerequisites. [COMMERCIAL-WORKFLOW.md](../workflows/COMMERCIAL-WORKFLOW.md) supplies commercial stages and the single-record policy.

## Sufficiency test

Start with the current user request and material corrections. Distinguish intent from factual premises. Establish outcome, scope, authorization, provisional acceptance, assumptions, and unknowns. Read only sources that can affect the outcome.

1. **Owner:** Identify the source or decision maker that owns each affected claim or choice: workspace guidance, the commercial record, supplied brand/product material, or an external provider's capabilities.
2. **Requirements:** Find the requested stage, settled brand/product facts, visual decisions, constraints, and stop boundary in the commercial record and supplied evidence. Use README for operating methods and the commercial workflow for preparation requirements. A missing source is an open fact or decision, not permission to invent a requirement.
3. **Dependencies:** Trace affected shots, reference files, variants, prompts, and handoff instructions far enough to establish the effect of a change. For scripts or integrations, inspect actual inputs, outputs, consumers, and contracts. Do not explore unrelated systems.
4. **Evidence:** Open supplied assets when appearance matters, read authoritative product sources when behavior matters, and consult current official model/mode documentation when capability matters. File names and summaries do not establish their contents.
5. **Verification:** Apply [VERIFICATIONS.md](VERIFICATIONS.md#common-verification) to the requested outcome and stage. Identify required checks from that outcome or applicable rules, available methods, accessible prerequisites, and material evidence limits. Do not invent additional acceptance gates. Use its escalation criteria when direct review is insufficient, and check whether the needed inspection or execution can run now.
6. **Capabilities:** Check material tools, skills, permissions, and modes exposed to the active session. Reuse known capability information; refresh only the relevant parts when availability, permissions, configuration, requirements, or a failure reveals a material change. Distinguish documented support from actual access. Use a capable available equivalent where appropriate; if a missing capability changes the result, explain the limit and feasible choices.

Before settling an approach, resolve material factual gaps with evidence. Ask the user about unresolved intent, preferences, or tradeoffs when the answer could materially change the result. An invited answer does not suspend independent work; a required decision blocks only work that depends on it.

Before revising supplied or selected material, inspect its relevant current state when accessible. Record the discrepancy and affected dependencies; an observed generated result is not automatically the intended creative decision or a verified product fact.

When a needed inspection or execution cannot run, use a suitable equivalent or identify remaining verification. If missing observations are necessary to settle correctness or material direction, pause dependent work and identify the observation needed; continue independent authorized work. Sufficiently grounded scoped work may continue with explicit limits. A required completion check remains unverified until satisfied. A prompt-only task may still finish with missing assets declared; it cannot claim inspected assets or successful external generation.

## Evidence and boundaries

- Read actual source material and owning documents rather than infer contents from filenames, old plans, or summaries. Prefer the narrowest source that answers the question.
- For instruction review, research external capabilities, provider behavior, and changing technical constraints when they are material factual premises. Local organizational choices can be evaluated from user intent and repository evidence without external research.
- Observed assets and implementation establish current results, not automatically intended creative decisions or approved requirements. Resolve material disagreement between the commercial record, authoritative sources, and supplied assets with the responsible owner before dependent changes. Do not require unrelated remediation.
- Distinguish user intent, documented behavior, direct observation, inference, and unknowns. Give the evidence and its limit for every material finding.
- A successful check supports only what it checks. A written storyboard is not visual verification; an inspected still is not video continuity; documentation is not tested account access; a prompt is not generated output.
- Other repositories and services are conditional sources. Their absence blocks only work needing that leg. Reading them does not authorize modifying them.
- Correct provisional grounding when evidence or user direction changes it. Explain material scope or acceptance effects and reconcile saved records.
- If a request cannot be satisfied as stated, report the contradiction with evidence, supported alternatives, and the decision or blocker. Do not fabricate a success path.

## Investigation record

[AGENTS.md](../../AGENTS.md#workspace-handling) owns record decisions, location, and shared maintenance. Ordinary commercial findings belong in the [commercial record](../workflows/COMMERCIAL-WORKFLOW.md#one-working-record-per-commercial), without requiring a separate investigation file. For system work or an explicitly requested separate investigation, use `workspace/<work-item>/investigation.md` when saving is requested or findings are worth preserving.

When asked to prepare an investigation, present findings and honor the requested stop. When saving, report its path, conclusion, and blockers. Preserve the request and boundaries, grounding and assumptions, material findings with sources and limits, decision effects, corrections, and open questions with their decision maker and dependent work. An evidence-supported recommendation does not itself authorize implementation. [PLANS.md](PLANS.md) owns a proposed or agreed approach; [IMPLEMENTATIONS.md](IMPLEMENTATIONS.md) owns execution and resumption.

## Evidence-dependent stops

Continue past non-material unknowns. Investigate material factual gaps; ask for a user decision when intent or a tradeoff determines the approach. Continue independent authorized work while awaiting an answer. Do not execute dependent work on an invented answer.
