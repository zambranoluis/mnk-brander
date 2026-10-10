# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

OpenJM makes versatile AI accessible for everyday and professional work. It helps people move from initial exploration to useful results, develop familiarity through use, and discover advanced capabilities as their needs grow. Users retain judgment and control over their work.

This document establishes the product standard for evaluating and correcting the experience. Requirements and aspirations do not certify that every surface or deployment already meets them.

## Users

OpenJM serves people and organizations building familiarity with AI, including newcomers, professionals and entrepreneurs introducing it into their work. Their needs include starting with an ordinary-language request, understanding available choices, working with their own material, and returning to previous work.

Adoption barriers include unfamiliar terminology, uncertainty about what to ask, unclear progress or limits, fear of losing work, and difficulty judging an answer. Explain capabilities in the context of the user's task. Do not assume technical expertise, a particular profession, organization size or demographic. Organizational use does not imply organization administration features.

## Positioning

OpenJM combines approachable conversation with progressively discoverable tools for deeper work. Accessibility, versatility and learning through use guide the product. Explain useful outcomes before technical configuration; avoid claims of universal model superiority or guaranteed results.

## Success Criteria

Evaluate the experience by whether users can:

- Begin without specialist knowledge and understand how to submit a request.
- Obtain a useful result and assess it in relation to their task.
- Understand whether work is waiting, processing, partial, interrupted or complete.
- Recognize relevant capability, account and usage limits before making a consequential choice.
- Recover from failures while retaining useful work and recoverable drafts.
- Return to saved work and distinguish conversation history from memory.
- Discover advanced capabilities when relevant without being required to configure them first.

These are evaluation criteria, not measured adoption, accuracy or productivity outcomes.

## Operating Context

Conversation is the primary working surface. Account, configuration and app tools support that work through the following journeys.

| Journey                                | Product requirements                                                                                                                                                                                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anonymous conversation                 | Let visitors start with a request, read progressive results and use attachments or generation only when available. Explain anonymous limits and the consequences of clearing or leaving the conversation. Do not promise saved history or automatic transfer into an account without confirmed support.        |
| Authentication and recovery            | Support sign-in, registration, verification, profile completion, password recovery and session recovery. Explain the next step, retain safe entered values on recoverable errors, and give field-specific feedback. Request an additional security challenge only when the operation requires it.              |
| Authenticated conversation and history | Let users start and revisit persisted conversations, organize them in groups, and choose available models or modes. Keep the active conversation and draft coherent when navigating, reconnecting or changing screen size. Explain deletion scope before confirmation.                                         |
| Files and generation                   | Show attachment selection, upload readiness, validation, progress and failure separately. Present supported generated files, images, audio or video with their actual processing state and available viewing or download actions. A submitted job is not a completed result.                                   |
| Profile, credits, billing and usage    | Let users manage personal details, profile image, security and supported account export or deletion. Show authoritative balances, plans, billing outcomes and usage with units and relevant dates. Explain purchase terms before commitment and confirm payment only after an authoritative completed outcome. |
| Memory and search preferences          | Explain how memory preferences and deletion affect reusable context. Treat web-search preferences as preferences within available capabilities, not a guarantee that every response searches the web. Keep memory deletion distinct from conversation deletion.                                                |
| Domains and API keys                   | Let users manage supported domain verification and API access. Explain verification steps, key creation and revocation consequences. Reveal sensitive values only in the intended flow; never place secrets in general feedback or diagnostic copy.                                                            |
| Apps and connections                   | Show available apps, installation and removal, configuration and connection status. Explain supported connection actions, including Obsidian bridge operations when available. Distinguish installation, enabled state, connection health and completed import or export.                                      |

For every journey, show loading while status is unresolved, empty only after confirmed absence, error when a request fails, unavailable when an action is not supported or permitted, interrupted when work stops before completion, and success only after the relevant operation completes. Preserve unaffected content and provide the next valid action.

## Capabilities and Constraints

### Exposed functionality

The product exposes anonymous conversation, authentication and recovery, authenticated conversations and history, file and generation flows, profile and account tools, configuration, and app management. This identifies product surfaces; each operation still depends on its authoritative availability and result.

### Conditional availability

Available models, modes, quotas, credits, plans, prices, integrations, file types and generation options come from the responsible service. Domain facts of this kind are the OpenJM API's decision: the product presents the authoritative state and never recreates the decision locally — [CODE.md](AGENTS/CODE.md) holds the layer map. Account state, permissions and deployment capabilities may affect the choices offered. Do not hardcode a daily allowance, a price, a model list or an integration promise into product guidance. A visible control, route, logo or media asset does not establish support.

Distinguish unavailable functionality from a failure to load its availability. An unknown balance is not zero; a failed history request is not an empty history; an unconfirmed installation is not connected. Explain a restriction using the known reason and offer only supported next steps. Do not infer a reset time, retry outcome or entitlement.

A capability the responsible service does not support is not presented as available or forthcoming, and speculative functionality is not introduced. Which specific capabilities are absent is recorded by the surface that would host them, under `.impeccable/surfaces`, not here.

## Product Principles

1. **Start with the task.** Keep the initial path simple and reveal models, modes and advanced settings when relevant. Explain unfamiliar terms where users encounter them.
2. **Make state understandable.** Distinguish submission, acceptance, processing, partial output and completion. Show supplied progress without inventing percentages, timings or activity. Partial results remain identifiable as partial.
3. **Preserve work and support recovery.** Retain drafts and useful partial output through recoverable errors, resizing and navigation. Explain what interruption affected; offer resume or retry only when supported. Avoid duplicate submissions and purchases. Do not promise persistence beyond confirmed storage behavior.
4. **Make consequences explicit.** Before deletion, revocation, removal or purchase, identify the affected item, scope, cost where relevant, and known reversibility. Use specific action labels and give a clear cancellation path. Do not imply that disabling a preference deletes stored information.
5. **Confirm facts accurately.** Report saved, copied, deleted, connected, purchased or completed only after that action succeeds. Errors state what happened, its effect and a valid next step without blame, invented causes or internal diagnostics.

## Terminology

| Term         | Meaning and distinction                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conversation | An exchange of user requests and assistant responses with its associated context. Use this term consistently for the working thread.                                                                                               |
| History      | The list of saved conversations available to revisit. It is not a complete record of all account data or memory.                                                                                                                   |
| Group        | A way to organize conversations in history. It is not a team, permission boundary or shared workspace.                                                                                                                             |
| Memory       | Reusable context managed separately from conversation history under the available memory controls. Deleting a conversation does not by itself confirm deletion of memory; deleting memory does not by itself delete conversations. |
| Attachment   | A user-selected file associated with a request. Selection, upload and readiness for processing are separate states.                                                                                                                |
| Model        | An available AI model used to process a request. Its capabilities and availability are authoritative service data.                                                                                                                 |
| Mode         | A supported way of handling a request, such as an available complex-task workflow. It is distinct from the selected model and does not guarantee a better result.                                                                  |
| Thinking     | Supplied response details about the processing of a request, shown when available. It is not the final answer, proof of correctness or a promise of access to all internal reasoning. Never fabricate it when absent.              |
| References   | Sources or excerpts supplied with a response. Keep their provenance and associated links intact; their presence is not independent verification of every claim. Do not invent references to fill an empty panel.                   |
| App          | An available integration that can be installed and configured for supported operations. A listed app is not necessarily installed or connected.                                                                                    |
| Connection   | The operational relationship between an installation and its external service or tool. Report actual connection status separately from installation and enabled state.                                                             |
| API key      | A credential for supported programmatic access. It is sensitive, distinct from a password, and subject to its actual permissions and revocation behavior.                                                                          |
| Credits      | The service's account balance or charging unit. Display authoritative amounts and applicable purchase terms; do not infer a currency or token conversion.                                                                          |
| Tokens       | Units used in model processing and usage accounting. They are not words or credits; do not imply a fixed conversion without authoritative terms.                                                                                   |

## Brand Commitments

OpenJM leads as the product brand. CrimsonTide AI provides backing. Use the attribution **Powered by CrimsonTide.AI**. Preserve the recognizable hummingbird, supplied lockups and background artwork as the product's visual assets.

Jamaica is OpenJM's origin, with international relevance. Do not reduce the audience to one region or turn origin into a required decorative motif.

### Voice and copy

Use clear, respectful sentence-case language and specific action verbs. Warmth belongs in welcoming guidance and helpful recovery; keep billing, security and destructive actions precise. Avoid blame, promotional repetition, unnecessary jargon and exaggerated certainty. Model responses may adapt to the user's language, task and requested style without repeating brand slogans.

The examples below establish wording patterns. Use a factual clause only when the corresponding state or consequence is confirmed.

| Context               | Example                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Onboarding            | "What would you like help with? Describe your task or add a file." Offer the file option only when available.                                                            |
| Recoverable error     | "Your message could not be sent. Your draft is still here." Action: "Try again" when safe retry is available.                                                            |
| Limit                 | "You've reached the available limit for this action." Add a reset time or account option only when supplied.                                                             |
| Empty history         | "No conversations yet. Start a conversation to begin." Action: "New conversation".                                                                                       |
| Interrupted response  | "The response stopped before it finished." Retain available output and offer the supported recovery action.                                                              |
| Conversation deletion | "Delete this conversation?" Describe the affected history and known recovery behavior. Actions: "Cancel" and "Delete conversation". Do not imply memory deletion.        |
| Memory deletion       | "Delete saved memory?" State the selected scope and known effect on future context. Actions: "Cancel" and "Delete memory".                                               |
| Purchase              | "Review purchase" before commitment. Show the actual amount, currency, credits or plan, and applicable recurring terms; use "Purchase complete" only after confirmation. |

## Accessibility & Inclusion

English is the default language. Preserve support for English, Spanish, Portuguese, Hindi, Chinese and Russian. Translate naturally and consistently, including validation, loading and recovery text. Allow readable text expansion and appropriate script fallbacks. Format numbers, dates and currencies for the selected locale while retaining their actual meaning and units.

Provide readable labels, keyboard operation, visible focus, screen-reader-compatible names and status feedback, field-associated errors, and non-color state cues. Support zoom, smaller screens, touch and reduced motion. Essential instructions and consequences must remain available without hover, animation or visual interpretation alone.

## Claims Discipline

Separate product aspirations from delivered capabilities and confirmed results. Do not invent customer demographics, testimonials, benchmarks or adoption metrics. Avoid unsupported promises about accuracy, privacy, retention, security, availability, pricing, savings or productivity. Explain relevant limits without implying that model output is automatically correct. Confirmation language must reflect the actual action and outcome, including partial or unresolved results.
