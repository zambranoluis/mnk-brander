# Verification standard

This document owns proportionate checks for instructions, commercial assets, continuity, prompts, handoffs, and scripts when involved. [README.md](../../README.md) supplies available methods and prerequisites; [COMMERCIAL-WORKFLOW.md](../workflows/COMMERCIAL-WORKFLOW.md) owns commercial decisions and handoff states. [AGENTS.md](../../AGENTS.md) owns authorization and preservation. Apply only checks relevant to the requested outcome.

## Common verification

Apply this baseline only to criteria relevant to the current stage:

- Review the scoped result against the requested outcome, applicable requirements, and settled decisions.
- Resolve consequential contradictions among the result, its owning sources, and affected dependencies.
- Check relevant factual claims against their sources; keep proposed treatment and unknowns distinct.
- Inspect selected material that exists using a method suited to the property being judged.
- Confirm required files, versions, links, and assignments; declare missing inputs.
- Report the result and material unknowns honestly, including what still needs generation or inspection.

A required check must follow from the current outcome or an applicable rule. Do not invent acceptance gates. Correct findings and repeat only checks affected by corrections. A failed or unavailable required check remains explicit with its blocker and next check.

Use an additional check when direct review cannot resolve a consequential uncertainty, a failure exposes a gap, or the requested deliverable requires it. Choose the smallest adequate method. Tool availability, record creation, or a document edit does not independently justify more verification. Do not create synthetic packages, comparison outputs, verification interfaces, or test videos merely to demonstrate rule coverage.

Summarize what ran or was inspected, its result, and material limits in conversation or the existing commercial/work-item record as appropriate. Detailed diagnostics follow [AGENTS's evidence policy](../../AGENTS.md#assets-evidence-sharing-and-cleanup). A metadata pass cannot establish appearance; document review cannot prove host loading or generated quality.

## Task-specific and reusable methods

Keep task-specific checks with the commercial or work item. A successful probe does not automatically become standing policy. Adopt a reusable method into its canonical owner only within an authorized instruction revision when actual work establishes the need; state its trigger, scope, and what it demonstrates. Real footage may warrant playback inspection to judge pacing or sound. A prompt-only task requires review of the prompt and declared dependencies, without generating footage to prove it.

## Documents and instructions

- Read the final relevant chain together, confirm consistent responsibilities and facts, and check local file links, heading anchors, formatting, and referenced versions.
- For instruction revisions, follow [INSTRUCTIONS_MAKER's validation method](INSTRUCTIONS_MAKER.md#draft-and-validate). Review reading paths affected by behavioral changes through their relevant owners. All standing criteria and exceptions must be present locally; direct review is sufficient without creating an isolated copy of the system.
- Check source claims against their owners. Use current official documentation for changing model/mode capabilities; record the source, check date, and actual-access limits.
- For affected canonical documentation, run the checker documented in README. Run its focused tests when its implementation or tested contract changes, not for ordinary documentation revisions. Historical template records retain their original evidence and may have obsolete links; they are not current validation inputs. Do not rewrite them to fabricate a passing project history.
- Confirm that narrow requests, requested stops, saved-plan boundaries, and missing capabilities produce proportionate behavior without accidental implementation or repetitive approval gates.

Optional reading-path examples include idea-only entry, a prompt-only request, inconsistent supplied assets, a resumed commercial, and reuse across independent commercials. Choose only cases that clarify an affected decision. A conversational walkthrough assesses the rules; it does not establish actual agent execution.

## Creative work

Use [CREATIVE-DEVELOPMENT's quality criteria](../workflows/CREATIVE-DEVELOPMENT.md#quality-criteria) for the relevant concept, script, storyboard, or correction. Identify specific strengths, weaknesses, and tradeoffs in the actual proposal or sequence. Correct weak ideas before presentation; a list of attractive style words is insufficient evidence. Confirm meaningful alternatives and a reasoned recommendation when direction is open, and direct scoped development when the choice is settled. Check that factual claims, proposed strategy, metaphor, and unknowns remain distinguishable.

Review whether execution carries the selected premise through visual choices, pacing, sound intentions, and ending. Verify reference observations against what was actually inspected, with explicit adaptation and difference. Written intentions establish neither rendered timing nor audible sound quality. Preserve the existing asset, continuity, prompt, and handoff checks below.

Optional examples for reviewing changed creative rules include a product with no direction, a restrained luxury brand, a factual software demonstration, a supplied reference, an already selected concept, and a single-shot correction. They are not a required suite. Use only examples needed to assess the change; authored briefs, sample responses, and before/after comparisons are not required. If evaluation outputs are useful, identify how they were produced and their limits. An authored walkthrough is not an independent agent trial or proof of audience effectiveness.

## Selected assets

Open actual selected files before reuse, selection, or final handoff. Check readability, intended file type, dimensions/aspect ratio and other required format details, appearance, composition, and correspondence to the storyboard. Inspect video/3D material with a suitable available method when its relevant property cannot be established from a still frame.

Check each asset's version, origin, role, and candidate/selected/rejected status. Required exact brand artwork and product material must come from authoritative supplied or verified sources; generated lookalikes do not establish accuracy. Note any access or usage constraint affecting handoff.

## Continuity

Compare related selected views together using the master references, spatial notes, and shot requirements:

- Character identity, wardrobe, styling, and lighting remain consistent where selected as fixed.
- Important props retain fixed appearance while their action-dependent states change as scripted.
- Setting geography, furniture relationships, and product placement remain physically coherent across camera views.
- Starting and ending states connect across shots or have an intentional transition.

Identify conflicts by asset and shot, resolve the governing reference when unsettled, and inspect corrections before downstream generation. An individually attractive asset does not establish continuity.

## Prompts

Reconcile shot identifiers, actions, timing, framing, camera, sound/text, preserved details, and intended state changes with the current storyboard. Check assignments against actual current filenames and reference roles; missing inputs must be clearly labeled.

Verify reference upload support, settings, and relevant limits for the chosen model/mode from current official documentation. Distinguish documented support from tested account availability. A different model's syntax or reference count is not evidence for this one.

Prompts intended for external execution must be self-contained, including output expectations, reference assignments, dependencies, and inspection criteria. Repeated descriptions without actual reference assignments cannot count as verified continuity control.

## Handoff

Open the final deliverables from their intended handoff location. Confirm required files are accessible, links resolve, versions and upload assignments are unambiguous, and concise production instructions match the agreed scope. If distributing an archive, inspect or extract it and check its internal paths rather than relying on the working directory.

Check asset completeness separately from prompt readiness. Explicitly list missing inputs, external generation, unchecked settings, and remaining output inspection. A prompt-only request may be complete without claiming asset completeness. An asset-complete package does not prove a rendered commercial or successful Higgsfield generation.

For reused assets, confirm the receiving commercial has independent copies and origin/version records. Check that preparing the new commercial has not modified the earlier commercial's selected assets or deliverables.

## Production promotion and archives

Apply these checks to the selected scope under the workflow's [production package](../workflows/COMMERCIAL-WORKFLOW.md#production-package) and [promotion and revisions](../workflows/COMMERCIAL-WORKFLOW.md#promotion-and-revisions) rules:

- Compare the explicit selection and dependency inventory with copied files. Verify copied asset bytes against workspace sources, using hashes or direct byte comparison; label intentional derivatives. Confirm drafts, rejected candidates, scratch, evidence, and development history were excluded and sources were preserved.
- Open production documents, prompts, and available assets from the production folder. Check file links, exact upload/reference assignments, versions, scene continuity, stable shot IDs, and the narrowest shared asset location. A shared file should serve its assigned shots without hidden workspace or other-commercial dependencies.
- Inspect required paths and assignments as well as Markdown links. Every available dependency must exist inside the package. Confirm that dependencies resolve internally, including links or shortcuts; reject personal paths and escapes to workspace, current or other packages. Use an independent-copy check when direct inspection cannot establish independence. Supporting source citations do not establish local asset availability.
- For partial or prompt-only promotion, check that the README and affected documents explicitly identify absent inputs/outputs, roles, generation order, settings uncertainties, and inspection requirements. Declare absent paths as missing or proposed, not working asset links. Check prompt readiness, asset completeness, and rendered-commercial status separately.
- When an asset or decision changes, trace every affected shot, variant, prompt, assignment, and instruction. Reconcile their versions and readiness together and re-run applicable factual, visual, continuity, and prompt checks before handoff.
- Before revising a handed-off package, compare its complete pre-change file set and bytes with the next archive, excluding only the top-level archives directory. Verify that dependencies resolve inside the archive; use an independent-copy check if direct inspection is insufficient. Record its source revision and verification; check after current revisions that archived files remain unchanged. An incomplete or externally dependent snapshot is a packaging gap, not a verified archive.

Byte comparisons apply to copied assets or archives whose identity matters. Scope inventories to the affected selection or actual archive; do not create repository-wide inventories for ordinary review.

Optional examples for reviewing packaging rules include partial prompt-only promotion, a shared asset used by multiple shots, a missing dependency, an updated asset with dependent prompts, and revision of a handed-off package. Discuss relevant cases when useful; changing these rules does not require synthetic packages or retained fixtures. Apply the operational checks above to actual material and handoffs.

## Scripts, only when involved

There is no mandatory application or browser test suite for commercial preparation yet. For a script change, inspect its inputs, outputs, consumers, and failure behavior; preserve established contracts and avoid unrelated restructuring. Use existing platform capabilities where suitable and do not install dependencies merely to satisfy a generic gate.

Run syntax/compile checks and focused executions that exercise its actual responsibility, including relevant failures. A document checker should detect missing targets and anchors rather than merely pass the authored documents. Verify runner discovery if a test runner is involved. Do not substitute invented data or an unrelated pass for the changed behavior.

Keep secrets and private authentication data out of scripts, diagnostics, and artifacts. Validate external inputs at the boundary using them. Protected or external operations require their actual contracts, access, and relevant checks; this section does not assert any integration is configured.

Review the scoped diff and whitespace. Because Git may omit untracked content, inspect or check those files directly. Preserve actual failures and corrections; report checks that could not run and the exact remaining verification.
