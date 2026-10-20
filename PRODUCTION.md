# Studio production

Use for Brander's brand/product development and selected design packages. [Studio requirements](STUDIO.md) selects the deliverable workflow. New film work goes to Filmmaker; [COMMERCIAL](COMMERCIAL.md) preserves contracts for existing Brander films and their recorded editing associations. There is no studio-wide aesthetic or product claim set.

## Brief and proposal

Record audience, problem, offering, intended response, constraints, stage, deliverables and acceptance in the selected task or production brief. With no supplied concept, reason from those facts to a positioning and creative proposal. Label assumptions, proposed claims and missing evidence. Make the recommendation assessable through a composition, prototype, logo application or other study suited to the open decision. The agent owns routine creative choices; unresolved choices that materially change identity, purpose, commitments, cost or acceptance need their decision owner. Make reviewable work concrete first and honor explicit review stops.

Distinguish supplied direction from incidental defects. An approved identity application starts at its affected medium; do not repeat strategy or invent new approval requirements for routine corrections. Preserve independent brands' decisions and scope.

## Selected directions and assets

Keep candidates, agent-selected direction, user approval and delivered state distinct. Record the selected premise and rationale, authoritative copy/artwork, source versions, reference roles, rights/usage limits and unresolved decisions. A supplied asset's presence is not proof of redistribution rights. Label derivatives and retain their originals. Within a production, share unchanged assets and reusable tools; do not copy them into each revision or task. A separate production or requested independent handoff includes its required copies; changes cannot silently propagate through mutable paths in another production.

## Revisions and records

Select one explicit task. Its single authoritative `task.md` owns current state, inputs, decisions, editable entry points, retained versions, dependencies, checks, actual review status and next action. Continue that task through revisions; a revision label does not create a new task. Substantial research, scripts, storyboards or evidence may have separate documents, linked from the record without competing current-state authority.

The task/session supplies the selected central project workspace location. If it is not yet identified, resolve that location before dependent writes; do not infer it from the repository path or start a parallel repository workspace. New records live at `<workspace>/<task-name>/task.md` with YAML frontmatter `layout: flat-v1`. Research, drafts, working tools, editable studies, task records and necessary working revisions stay in that task workspace. Originals, authoritative assets and selected production material stay in this repository. Create directories only when used:

- `work/`: one maintained editable baseline and required native structure; implementation source stays in its repository.
- `local/`: disposable previews, captures, intermediates, build state and caches. Evidence cited for an unresolved failure or meaningful retained result must remain recoverable; it is not disposable merely because of its path.
- `versions/<version>/`: necessary material for a meaningful retained revision when the production has no sufficient existing preservation mechanism.
- `work/delivery/`: requested exports. An existing production delivery destination may serve the same purpose.
- `archive/<delivery-id>/`: explicitly requested selected archives only.

Existing records without the flat marker keep their `current/` prefix. Established productions keep sufficient native layouts and their actual editing entry points, identified in task.md; do not create a second working copy or migrate history to fit this layout. Do not select the newest folder implicitly.

Before destructive revision, preserve meaningful versions presented for review, delivered results, explicit checkpoints, costly unique inputs and useful alternatives that would otherwise be lost. A minor preview, capture or intermediate edit does not automatically become a retained version. Record the revision's identity, reason, relationship to current work, dependencies and actual review status. Keep current and historical evidence distinct; technical reproduction and an agent's review do not imply user approval.

Use one sufficient preservation mechanism per production. Reuse an existing recoverable version, immutable repository/object identity or verified frozen package when it covers the exact result, required uncommitted material and dependencies. Otherwise retain necessary files in `versions/`. Do not preserve the same revision simultaneously in task versions, production snapshots and ZIPs. Retained material may reference unchanged production-local immutable assets/tools when their exact identity and continued availability are recorded; it must not depend on mutable current work or disposable scratch. Freeze or preserve affected dependencies before changing them. Only an independent handoff requires every dependency locally in its own package.

Named revision folders, production snapshots and existing `output/` paths may continue as the selected production's sufficient mechanism or native tool layout. They are not additional stores or required steps for new work. For new tasks, stage disposable candidates in `local/` and maintain editable material in `work/`. Successful checks, review previews, completed edits and product approval do not trigger packaging, archiving or clearing current work.

Archive only after an explicit request or acceptance of a concrete offer naming the selection. Keep editable work and retained versions intact. Cleanup candidates are reported separately; do not delete or relocate existing files, production histories or unknown material under ordinary revision scope.

## Delivery and handoff

Create an export package only for a requested delivery need. Copy material into `productions/` only for the requested selection or existing delegated selection authority, after applicable checks; a completed draft, successful check or review preview does not request promotion. Preserve workspace sources and record source/version, destination, selection basis, dependencies and readiness in task.md. Promote only selected files and their required dependencies, excluding drafts, scratch and development history; verify their bytes and references at the destination. An independent package identifies its purpose, scope, current revision, editable entry points, formats, every required local dependency, provenance, build/use instructions, missing inputs and review status. Check its dependencies at the destination without mutable workspace or other-production access. A proposal, concept, prompt-only package, working prototype and implemented product have different completion criteria. Label simulated persistence, fictional claims and unimplemented interfaces directly on review artifacts when relevant. A handoff copy is a delivery artifact, not a second editable baseline; reuse it for preservation when sufficient rather than making another snapshot of the same revision.

Before delivery, inspect the actual output in its medium, correct material defects within scope and verify selected dependencies at the destination. Report technical checks, visual/interaction judgment, user approval and audience effectiveness separately. Product implementation handoff carries selected decisions, authoritative assets, contracts and open questions into the dedicated repository; it does not claim the concept has been implemented. Publishing, deployment and provider changes need their own authorization.
