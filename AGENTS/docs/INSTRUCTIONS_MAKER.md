# Instructions Maker

This document owns evaluating, designing, and revising model-facing instructions and instruction systems, including agent rules, roles, skills, and workflows. Read it when judging their quality or deciding what guidance to add, change, move, or remove; ordinary work that merely follows instructions uses its relevant owners.

[AGENTS.md](../../AGENTS.md) owns authorization, routing, and common record policy. [INVESTIGATIONS.md](INVESTIGATIONS.md) owns grounding and evidence; [PLANS.md](PLANS.md) owns proposed approaches; [IMPLEMENTATIONS.md](IMPLEMENTATIONS.md) owns authorized execution and results. Apply [document verification](VERIFICATIONS.md#documents-and-instructions) to the affected instruction chain. This method is repository-owned guidance and does not require a global skill installation.

Evaluate and improve instructions that steer a model's behavior, regardless of the artifact's name or format. The central task is to understand the broader behavioral idea behind a user's situation or example before proposing any rule. This includes reviewing a whole instruction system without creating anything. A creation tool for one provider or artifact type may help with its format, but this method's quality judgment must work without it.

Produce the smallest justified change, which may be no change. An example, correction, or requested wording is evidence of intent or a possible failure mode; it is not, by itself, a general rule. Evaluate the idea before choosing any text or artifact. Do not treat ordinary project facts, runtime implementation, or a document that agents may read as normative instructions solely because it appears near them.

## Establish the decision

- Identify whether the request is to evaluate, design, or change an instruction artifact or a whole system. Establish the intended audience, behavior, scope, and decision the work should support. Preserve authorization; evaluation and planning do not authorize editing their subjects.
- Read the relevant instruction chain and sources that own its claims. Identify actual coverage, overlaps, conflicts, and rules whose original reason may no longer apply. Do not infer content, loading, or authority from a filename or summary.
- Separate user intent, documented host behavior, observed behavior, and inference. If a premise is unsupported or contradicted, say so and determine whether it changes the proposed instruction.
- Before recommending a material behavioral change to instructions, consult current official documentation and relevant documented best practices to assess the request's factual premises, proposed approach, and applicability to the intended agents and environment. Seek evidence that supports or challenges the change. Match provider-specific claims to the applicable host and version; record source links and the version or retrieval date. Wording-only edits that preserve behavior do not require fresh research.
- For work meant to cross Claude Code, Codex, GitHub Copilot, and OpenCode, check each relevant host; for narrower work, check only the providers and mechanisms involved. Do not treat a documented feature as proof that it is enabled, loaded, or effective in the target session.
- Use official documentation to establish capabilities, loading, scope, and constraints. Documented best practices inform judgment without becoming mandatory local policy. Do not present a provider's illustrative example or general advice as a requirement for the user's system. Where documentation is silent, label the design judgment.
- Research does not establish that an instruction will work. Validate the proposed behavior against representative cases under [Draft and validate](#draft-and-validate). When relevant evidence is unavailable or inconclusive, state the limitation and leave dependent conclusions unverified.

## Evaluate an existing system

- Map the instructions an intended agent can actually encounter: entry points, conditional loading, references, scope, and host priority. Separate the system's claimed authority from the host's real instruction hierarchy. Note unverified paths rather than treating them as loaded.
- Trace representative tasks through the complete chain. Check whether the right guidance is available at the decision point, whether owners and boundaries are clear, and whether interacting rules produce the intended behavior. Inspect both omissions and instructions that add noise, duplicate another rule, or constrain unrelated work.
- Assess the strength of each material rule: supported need, justified breadth, clear trigger and consequence, consistency with higher authority, feasible capability, and a way to evaluate its effect. Do not demand a mechanical rule for work that requires judgment.
- Report findings by consequence and evidence. Recommend retain, clarify, consolidate, relocate, remove, or add only where each action solves a demonstrated problem. Distinguish a document-quality issue from a host-activation issue and from an untested behavioral hypothesis.

## Abstract the behavior before drafting

Treat examples introduced to illustrate an idea as cases to reason from, not wording to encode. Identify which details are incidental, what behavior the user wants across analogous situations, and where that behavior should stop applying. Explain the interpreted principle when it affects the proposed direction; resolve material uncertainty about the user's intent before fixing it as policy.

For each material proposed instruction change, determine:

1. What failure or decision is the change meant to address? What happens if no rule is added?
2. What condition makes the behavior necessary, and what consequence follows? Express the governing criterion before drafting examples or wording.
3. Does the criterion hold for materially different cases? Identify a case it should cover and one it should not. Narrow or discard it if it reaches too far.
4. Is the criterion already covered? Prefer a focused correction, clarification, removal, or relocation over a parallel rule. Add nothing when existing guidance and the available evidence suffice.
5. How broad is the justified scope? Keep a local convention local. Promote it only when the same reason and consequence apply throughout the wider scope.

Do not convert a user's illustrative case, an isolated agent mistake, a workaround, or a pleasing but unverified approach into standing policy. Do not abstract so far that the resulting rule cannot decide an action. When evidence does not establish a general rule, state the limit rather than inventing one.

## Choose the instruction surface

- When designing a system, define the minimum useful artifacts and their responsibilities, scope, loading paths, and relationships before distributing rules. Specify conflict behavior only where the target host permits it; do not manufacture an authority hierarchy with prose alone.
- Use standing instructions for behavior needed across their whole scope; scoped rules for narrower recurring behavior; a skill or procedure for a task-specific workflow; references for facts and examples; and the current task prompt for one-time direction. Create another artifact only when it changes applicability, maintainability, or execution.
- Distinguish the owner of a subject from the host's instruction priority and loading behavior. Do not claim inheritance, precedence, discovery, permissions, or enforcement that the host does not provide. Keep provider-specific mechanics out of provider-neutral rules unless necessary to make them work.
- Put a rule where its full scope is valid and where the intended agents can actually encounter it. Check whether local, ignored, linked, or external files are available to each target environment. Do not rely on a link to supply instructions when that environment does not follow links.
- Keep stable behavior separate from changing project facts, temporary execution state, and illustrative material. Avoid copying a broad rule into several surfaces unless independent loading requires it; in that case, keep the copies consistent and state their scope.
- When the selected artifact has a provider-specific format, apply its current schema, creator, or validator if available. Keep the decision about the instruction's need, scope, and quality independent of that helper. Do not require a Codex-only tool to evaluate or author instructions for another provider.

## Keep the system self-contained

The canonical system consists of its entry point, routed rule documents, and owning project decision documents. These documents must contain each adopted rule's operative criteria, scope, and material exceptions. Applying a standing rule must not depend on work records, previous conversations, memory, personal files, or external references. When a lasting decision is authorized, place its complete operative content in its canonical owner rather than linking to the source as a substitute for the rule.

Routing between canonical documents within the system is allowed. Keep one owner for each rule and make its reading path explicit; self-containment does not require duplicating every rule in every file. The routed owner must be available in the intended installation. A link to an unavailable owner is a gap, not evidence that the system contains the rule.

Supporting citations may explain evidence or provenance, but the local owner must state the adopted decision fully. External documentation can establish current facts and constraints without becoming local policy automatically. This requirement concerns standing decision rules; it does not eliminate live evidence gathering or task-specific prerequisites, or alter host instruction priority and the authority of explicit user direction.

Preserve evidence limits and unresolved choices when promoting a decision. If its scope or a material exception is unsettled, identify the unknown, responsible owner, and dependent work instead of inventing policy. Work records can retain history and temporary execution state, but must not be the sole source of a standing requirement.

## Draft and validate

- Write direct language that states the trigger and behavior. Include authority, exceptions, completion, or escalation only when omitting them would change a material decision. Use judgment criteria where judgment is needed; do not script every possible case.
- Remove generic competence reminders, repeated policy, speculative safeguards, unnecessary taxonomy, and process steps that do not affect outcomes. Do not trade a clear operational rule for a slogan or a renamed abstraction.
- Test the complete instruction set against realistic cases inside and outside the intended scope, including a case where no new instruction should be created. For system audits, use representative tasks that exercise interactions between artifacts. Check for contradictions, missed loading, accidental authorization, and behavior the host cannot perform. Use the host's format and discovery checks when the change depends on them; assess behavior separately from Markdown validity.
- Review the canonical chain with temporary records, prior conversation, memory, personal resources, and external reference content unavailable. Check whether a fresh agent can find and apply each standing rule, including its material exceptions, through internal routing alone. Identify missing decision criteria and, within authorized edits, correct them in their canonical owners while preserving evidence limits and unresolved choices. This tests rule completeness, not the availability of live research or execution prerequisites, and does not prove actual host loading.
- Report the resulting decision, what evidence and checks support it, and what remains unverified. For a review-only request, give findings and a concrete recommendation without editing. For an authorized edit, make the scoped change and verify the affected instruction path.
