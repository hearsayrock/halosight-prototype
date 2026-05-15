# AI Behavior

> How AI features behave in the prototype, what they simulate, and what principles govern their design.

---

## Core Philosophy

AI in Halosight exists to reduce administrative burden, not to replace judgment.

The AI system should:
- Convert captured voice into structured data
- Surface relevant context before a visit
- Suggest actions based on evidence
- Automate CRM updates that reps would otherwise skip

The AI system must never:
- Fabricate customer information
- Present outputs as facts without evidence
- Operate as a black box
- Make decisions on behalf of the rep without explicit approval

---

## The Trust Model

Every AI output follows this pattern:

```
Evidence → Processing → Output → Rep Review → Action
```

No output skips the "Rep Review" step. The rep always approves, edits, or rejects.

The rep is the decision-maker. AI is the analyst.

---

## AI Output Types

### 1. Pre-Visit Brief
Generated before a rep arrives at an account.

**Contents:**
- Last visit summary (1–2 sentences from prior AI summary)
- Ideas for this time (3–5 suggested conversation topics based on account history)
- Open commitments from prior visits
- Account health signal

**Simulated as:** Static content in `mockAccountDetails` → `lastVisitSummary` + `ideasForThisTime`

**Flutter equivalent:** `MeetingPrepAgent` → `PreVisitBriefViewModel`

---

### 2. Interaction Transcript
Generated from voice recording after a visit is ended.

**Contents:**
- Speaker-separated segments
- Timestamps
- Confidence score per segment
- Editable text

**Simulated as:** `TranscriptSegment[]` in `lib/types/index.ts`

**Flutter equivalent:** `CallSummaryAgent` → whisper/STT adapter

---

### 3. AI Summary
Generated from transcript. The primary output of a captured interaction.

**Contents:**
- 2–4 sentence plain-English summary
- Key points (bullet list)
- Extracted structured data (see below)

**Confidence:** 0–1 float, displayed as a bar + percentage

**Editable:** Yes — full text edit before accepting

**Flutter equivalent:** `AISummary` entity → `PostCallDebriefAgent`

---

### 4. Extracted Structured Data
Pulled from the AI summary. Each item is individually accept/edit/rejectable.

| Type | Description | CRM Impact |
|---|---|---|
| `Commitment` | Rep or customer agreed to do something | Creates Salesforce Task |
| `Risk` | A signal that could threaten the relationship | Updates Opportunity stage or flags account |
| `Opportunity` | An upsell, expansion, or new need signal | Creates Salesforce Opportunity |
| `FollowUp` | Action item without a hard commitment | Creates Task with due date |
| `CrmUpdate` | Suggested change to a specific Salesforce field | Queued CRM write with confirmation |

---

### 5. Follow-Up Email Draft
Generated after a summary is accepted. Pre-populated based on commitments and key points.

**Format:**
```
Subject: [Auto-generated from account name + visit context]
Body: [Personalized recap, action items, next steps]
```

**Always labeled:** "AI Draft — review before sending"
**Always editable:** full text edit
**Source shown:** links to specific transcript segment that generated each point

---

## Confidence Display

All AI outputs show confidence. Three display modes:

**Bar + percentage** (primary outputs like summary):
```
[████████░░] 82%
```

**Qualitative chip** (extracted items):
- 80–100%: `High confidence` — green
- 50–79%: `Medium confidence` — amber
- 0–49%: `Low confidence` — red

**Per-item inline** (CRM updates):
Small dot + percentage next to each suggested field value.

---

## Accept / Edit / Reject Pattern

Every AI output card follows the same interaction contract:

```
┌─────────────────────────────┐
│ AI Summary           [88%]  │
│                             │
│ Visited today. Fleet        │
│ expansion Q3 confirmed...   │
│                             │
│ [Accept] [Edit] [Reject]    │
└─────────────────────────────┘
```

| Action | Result |
|---|---|
| Accept | Output is committed; triggers downstream actions (CRM update, task creation) |
| Edit | Opens inline text editor; rep modifies; then accepts the edited version |
| Reject | Output is dismissed; rep can regenerate or leave blank |

Rejection is consequence-free. No data is lost. The recording is always preserved.

---

## AI Processing States

When simulating AI behavior, the prototype uses these states:

| State | Visual | Duration |
|---|---|---|
| `recording` | Animated waveform / pulsing mic | Until rep ends |
| `processing` | Spinner + "Analyzing your visit..." | 2–4 seconds simulated |
| `transcript_ready` | Transcript text fades in | Instant |
| `summary_ready` | Summary card slides up | Instant |
| `complete` | Full output screen, all actions available | Final state |

---

## Simulating AI in the Prototype

The prototype uses static mock data that simulates realistic AI output. When building new AI-output screens:

1. Define the output structure in `lib/types/index.ts`
2. Add realistic mock data to `lib/mock-data/`
3. Add a simulated processing delay (1.5–3 seconds) using `setTimeout` + state
4. Show processing states before revealing output
5. Make every output accept/edit/rejectable

AI outputs should never appear instantly — the processing animation builds trust that something real happened.

---

## Agent Reference

From the Halosight Knowledge Wiki:

| Agent | Function |
|---|---|
| Meeting Prep Agent | Pre-visit brief generation |
| Call Summary Agent | Transcript → structured summary |
| Post-Call Debrief | Summary → commitments/risks/opportunities |
| Follow-Up Email | Email draft from summary |
| Opportunity Inspection | Deal health analysis |
| Pipeline Review | Cross-account pipeline analysis |
| Personal Executive Assistant | Rep coaching and inspection readiness |

---

*Last updated: 2026-05-14*
