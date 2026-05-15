# Halosight Prototype Agent Guide

This workspace is a product prototype and handoff spec for Halosight. Treat it as a living, executable product design document: the Next.js app shows the intended experience, the docs explain the product and architecture, and the knowledge wiki supplies source-of-truth context for messaging and strategy.

## Product North Star

Halosight is an AI-powered execution intelligence platform for field and outside sales teams.

The prototype should reinforce this idea:

> Halosight turns every field rep visit into structured customer intelligence: automatically captured, synced to Salesforce, and visible to management.

Do not frame the product as a generic note-taking app, transcription tool, meeting summarizer, CRM replacement, or broad AI productivity app. The product is for outside reps in motion and the managers who need trustworthy field visibility.

## Primary User Workflow

Every prototype decision should support one of these moments:

1. Before the visit: help the rep understand account history, prior commitments, and useful conversation context quickly.
2. During or after the visit: let the rep capture a voice debrief with minimal friction.
3. After capture: turn the visit into structured summaries, commitments, risks, opportunities, follow-ups, and Salesforce updates.
4. For management: make field activity inspectable and reliable without asking reps to do extra reporting work.

If a feature adds steps without removing more steps, rethink it.

## Repository Shape

- `app/` contains the runnable Next.js prototype.
- `app/app/` contains routes and screens.
- `app/components/` contains reusable React components.
- `app/lib/types/` contains TypeScript domain types that map to future Flutter entities.
- `app/lib/mock-data/` contains prototype data.
- `app/app/design-system/` is a browser-only design-system reference page.
- `docs/` contains product, design, architecture, data-model, and Flutter handoff guidance.
- `Halosight Knowledge Wiki/` contains product strategy, positioning, sales methodology, AI-agent concepts, and source evidence.
- `agents/` contains role-specific guidance files for product/design/prototype work.

## App Technology

The active prototype is a Next.js app using React, TypeScript, Tailwind CSS, and local design tokens.

Work inside `app/` unless the task specifically asks for docs, wiki content, or repo-level instructions. The root instructions may mention production Flutter patterns, but this repository is not the production Flutter application.

The nested `app/AGENTS.md` notes that this Next.js version may differ from older conventions. Before making non-trivial framework changes, inspect the local Next.js docs under `app/node_modules/next/dist/docs/` if available.

## Prototype Standards

- Build the actual mobile experience, not a marketing page.
- Preserve the phone-frame prototype format for app screens unless the page is explicitly a browser reference tool.
- Use realistic field-sales language and concrete account/workflow details.
- Keep the UI fast, lightweight, operational, and trustworthy.
- AI outputs must feel inspectable: include confidence, source snippets, editable/reviewable states, or clear provenance when the flow calls for it.
- Prefer simple local state for prototype interactions. Do not add global state libraries unless there is a clear prototype need.
- Keep mock data coherent with Salesforce-style entities and the field-sales workflow.

## Architecture Mapping

The prototype intentionally mirrors the future clean Flutter architecture:

| Prototype | Production Flutter Equivalent |
|---|---|
| `app/app/[route]/page.tsx` | View/page |
| React component | Widget |
| `useState` or derived values | ViewModel/BLoC state |
| `app/lib/types/index.ts` | Entity layer |
| `app/lib/mock-data/` | Adapter/repository implementation |
| Data transformation in a page | Future use case or ViewModel behavior |

When adding or changing screens, keep the handoff clear enough that a Flutter engineer can translate it into View, ViewModel, Use Case, Entity, and Adapter layers later.

## Flutter Handoff Comments

Every route or reusable component should include a concise handoff comment near the top when practical:

```tsx
/**
 * FLUTTER HANDOFF: ComponentName
 * Route: /example
 * Widget: StatelessWidget | StatefulWidget
 * State: describe local state
 * Data: describe mock/use-case source
 * Flutter equivalent: suggested_file_name.dart
 * Tokens: list key design tokens
 */
```

Keep these comments useful and current. They should describe behavior and translation intent, not restate obvious JSX.

## Screens And Components

- Put routes in `app/app/`.
- Put reusable components in `app/components/`.
- Put feature-specific components in folders such as `app/components/accounts/` or `app/components/capture/`.
- Put generic primitives in `app/components/ui/` when they become truly reusable.
- Reuse existing components before creating a new one.
- Avoid one-off page-specific widgets when the pattern is likely to recur.
- Keep component props typed and domain names explicit.

Current important components include:

- `app/components/layout/PhoneFrame.tsx` for the browser phone viewport.
- `app/components/layout/BottomNav.tsx` for mobile navigation.
- `app/components/accounts/AccountListItem.tsx` for account rows.
- `app/components/accounts/AccountTypeIcon.tsx` for account hierarchy icons.
- `app/components/accounts/SortMenu.tsx` for account sorting.

When adding a reusable component, update `docs/component-architecture.md` if it changes the component system in a meaningful way.

## Design System

- Use the design tokens in `app/app/globals.css`.
- Preserve the dark operational visual language unless the user explicitly asks for a new direction.
- Primary action color is coral. Secondary/info accent is blue.
- Use Barlow as the primary UI typeface.
- Keep the experience calm, dense enough for working users, and easy to scan.
- Do not make the app feel like a traditional CRM form interface.
- Avoid decorative UI that does not help the field-sales workflow.
- Do not hardcode new colors casually. Add or reuse tokens when a color has a real semantic role.

The design-system reference page lives at `app/app/design-system/page.tsx`. Keep it aligned with any meaningful token or component additions.

## Data Model

Domain types live in `app/lib/types/index.ts`. Mock data lives in `app/lib/mock-data/`.

Important concepts:

- `Account`: Salesforce Account-like record.
- `AccountDetail`: account plus AI-generated visit prep.
- `ActivityItem`: visit/call/email/task history.
- `Interaction`: capture session state.
- `TranscriptSegment`: speech-to-text segment.
- `AISummary`: structured AI output.
- `Commitment`, `Risk`, `Opportunity`, `FollowUp`, `CrmUpdate`: reviewable extracted objects.

When adding mock data, make it plausible for outside sales in distribution, industrial, automotive aftermarket, construction, or similar field-heavy businesses.

## Planned Product Areas

The current prototype has login, account browsing, account detail, and design-system pages. The next major planned area is the capture meeting workflow:

- recording state
- paused/resumed recording state
- processing/analyzing state
- transcript review
- AI summary review
- commitments, risks, opportunities, follow-ups, and CRM update review
- follow-up email drafting

Use `docs/prototype-scenarios.md`, `docs/data-model.md`, and `docs/product-principles.md` as the first references before building these flows.

## Coding Standards

- Use TypeScript for app code.
- Prefer clear, typed props and small components.
- Use relative simplicity over architectural ceremony in the prototype.
- Keep names domain-specific and readable.
- Component files use PascalCase, such as `AccountListItem.tsx`.
- Route files follow Next.js conventions, such as `page.tsx`.
- Utility files may use camelCase, such as `utils.ts`.
- Avoid the non-null assertion operator. Check for nullish values and provide sensible fallback UI.
- Prefer derived values and helper functions when they make screen code easier to read.
- Keep imports consistent with the existing app style.
- Do not edit generated files.

## Testing And Verification

There is not currently a mature automated test suite for the prototype. When changing app behavior:

- Run lint or build when practical.
- Start the local app and inspect the affected flow for visual and interaction regressions.
- For UI changes, verify the phone-frame layout does not clip, overlap, or create unreadable text.
- For new data transformations, consider adding lightweight unit coverage if a test setup exists or the logic becomes non-trivial.

Production Flutter test standards may live elsewhere, but do not force Dart test conventions onto this Next.js prototype.

## Documentation Updates

Update docs when the work changes product behavior, data shape, handoff expectations, or reusable components:

- Update `docs/prototype-scenarios.md` when a scenario is added or materially changed.
- Update `docs/data-model.md` when domain types or mock-data semantics change.
- Update `docs/component-architecture.md` when reusable component patterns change.
- Update `docs/design-system.md` or the design-system page when tokens or visual primitives change.
- Use the knowledge wiki as context, but do not rewrite broad strategy documents unless asked.

## Git And Branching

If this workspace is connected to Git, use feature branches named after the Jira ticket when one is provided, for example:

`DELIVERY-218-short-description`

Do not revert user changes unless explicitly asked. If unrelated files are dirty, leave them alone.

## How To Work In This Repo

Before implementing, quickly identify whether the request is about:

- product strategy or messaging
- prototype UI
- data model or mock data
- design system
- Flutter handoff
- documentation

Then use the closest existing artifact as the source of truth. This repo is most useful when the prototype, docs, and product narrative stay in sync.
