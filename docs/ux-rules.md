# UX Rules

> Binding decisions about how the Halosight app behaves, interacts, and communicates. Every new screen and feature must be defensible against these rules.

---

## Core Principles

### 1. Design workflows, not screens
Every screen exists to move the rep through a task, not to display information. Ask: "What does the rep do next?" before asking "What does the rep see?"

### 2. Reduce cognitive load aggressively
Field reps are in motion, often in noisy or time-pressured environments. Every element that isn't load-bearing must be removed.

### 3. Favor momentum and action-taking
Default to moving forward. Don't ask for confirmation unless the action is irreversible. Don't interrupt the flow.

### 4. AI must assist, not confuse
Every AI output must be:
- Inspectable (the rep can see what it's based on)
- Editable (the rep can change it)
- Rejectable (the rep can dismiss it without consequence)
- Labeled with confidence (not presented as absolute truth)

### 5. Progressive disclosure
Show only what's needed for the current moment. Details are one tap away, not always visible. Avoid information overload on primary screens.

### 6. Intelligent defaults
The app should pre-select the most likely correct answer. Make it easier to accept than to reject. Make it easier to accept than to start from scratch.

### 7. Support ambiguity and recovery
Reps make mistakes. Connections drop. Recordings fail. Every flow must have a graceful fallback state that preserves the rep's work.

---

## Navigation Rules

- **Bottom nav** has exactly two tabs: Home and Accounts. Nothing else unless product strategy changes significantly.
- **Back navigation** is always available on detail screens. Never trap a user.
- **Modals and overlays** are used only for transient, contextual interactions (sort menu, confirm dialogs). Not for full workflows.
- **Deep linking**: Every account and interaction should be addressable by URL/route for sharability.

---

## Content & Copy Rules

| Pattern | Do | Don't |
|---|---|---|
| Buttons | Verb-first: "Capture Meeting", "Accept", "Edit" | Noun-first: "Meeting Capture", "Acceptance" |
| Empty states | Explain what to do next | Just say "No data" |
| Error messages | Say what happened + what to do | Technical codes or vague "Something went wrong" |
| AI output labels | "AI Summary", "Suggested follow-up" | "Summary", "Follow-up" (hide AI attribution) |
| Timestamps | "Visited 3 days ago", "Visited Today" | Exact dates on list items |
| Distances | "13.5 mi", "0.75 mi" | "13,520 ft" |

---

## Interaction States

Every interactive element must have all four states defined:

1. **Default** — resting state
2. **Hover / pressed** — active feedback (opacity 80% on mobile)
3. **Disabled** — visually muted, not interactive, no cursor change on web
4. **Loading** — skeleton or shimmer, never a blank screen

---

## Mobile-First Rules

This is a field app. It is used one-handed, in motion, often outdoors.

- Tap targets: minimum 44×44px
- Primary CTAs: always at the bottom of the screen within thumb reach
- No hover-dependent interactions (hover doesn't exist on mobile)
- No horizontal scroll (unless it's a deliberate carousel)
- Text must be legible in bright sunlight: minimum contrast ratio 4.5:1
- Loading states must appear within 100ms of interaction

---

## AI Trust & Transparency Rules

These are non-negotiable for any AI output surface:

1. **Always label AI outputs** — never present AI-generated content as if it were raw data
2. **Always show confidence** — a bar, percentage, or qualitative label (High / Medium / Low)
3. **Always allow editing** — no AI output is read-only
4. **Always allow rejection** — dismissing an AI suggestion has no penalty
5. **No fabrication** — AI must never make up customer information. It can only work from captured evidence.
6. **Source traceability** — for key outputs, show which part of the transcript/recording it came from

---

## Screen Density Rules

- List items: max 2 lines of secondary content visible without tap
- Account detail overview: max 2 sections visible above the fold
- AI summary card: max 3–4 sentences before "Show more"
- Bullet lists: max 5 items before grouping or truncating

---

## Animation & Transition Rules

- Screen transitions: slide from right (push), slide right (pop) — matches native iOS/Android feel
- Modal: slide up from bottom with backdrop blur
- Loading states: fade in, not pop in
- AI processing: pulsing/animated indicator, not a static spinner
- Duration: 200–300ms for navigation, 150ms for micro-interactions
- Reduced motion: always respect `prefers-reduced-motion`

---

*Last updated: 2026-05-14*
