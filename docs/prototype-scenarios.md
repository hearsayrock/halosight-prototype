# Prototype Scenarios

> The flows and user scenarios this prototype currently supports, and those planned for future iterations.

---

## Current Scenarios (Built)

### Scenario 1: Login
**Route:** `/`
**Flow:** Open app → view login screen → tap any auth button → arrive at accounts list
**What it tests:** Login screen visual design, button hierarchy, brand impression

**Accounts:**
- Continue with Google (primary CTA — coral)
- Continue with Microsoft
- Sign in with Apple
- Log in with Email (text link)

All routes navigate to `/accounts` (auth is bypassed in prototype).

---

### Scenario 2: Browse Accounts
**Route:** `/accounts`
**Flow:** View account list → search → sort → tap account

**What it tests:**
- Account list visual design
- Search + filter behavior (live, client-side)
- Sort options (Alphabetical, Distance, Last Visited, Company)
- Parent/child account hierarchy visualization
- "Visited Today" state
- Distance formatting

**Mock accounts loaded:** 10 accounts across Utah, Nevada, Arizona with varied visit recency.

---

### Scenario 3: View Account Overview
**Route:** `/accounts/[id]`
**Flow:** Tap account → view detail → switch tabs → tap "Capture Meeting"

**What it tests:**
- Account type label (CORPORATE / BRANCH / ACCOUNT)
- Account name display
- Related accounts count
- Overview tab: Last Time summary + Ideas for this Time
- Activity tab: interaction history list with transcript links
- Capture Meeting CTA

**Accounts with rich detail:**
- `walmart-corp` — Walmart corporate, related accounts 24, full overview + 3 activity items
- `profleet-glendale-2` — Visited today, Q3 expansion opportunity

---

## Planned Scenarios (Not Yet Built)

### Scenario 4: Capture Meeting — Recording
**Route:** `/accounts/[id]/capture`
**Flow:** Tap "Capture Meeting" → recording screen → active waveform → pause/resume → end

**What it should include:**
- Account name in header (confirm you're recording the right account)
- Animated waveform (simulated)
- Elapsed timer
- Pause button
- End Recording CTA
- "Discard" option (with confirmation)

**State machine:**
```
idle → recording → paused → recording → ended → processing
```

---

### Scenario 5: Processing & Transcript
**Route:** `/accounts/[id]/capture` (post-recording state)
**Flow:** End recording → processing animation → transcript appears

**What it should include:**
- "Analyzing your visit..." state (2–3 seconds)
- Transcript segments revealed progressively
- Speaker labels (Rep / Customer)
- Confidence score per segment (low confidence = muted color)
- "Edit transcript" option

---

### Scenario 6: AI Summary & Actions
**Route:** `/accounts/[id]/capture` (summary state)
**Flow:** Transcript ready → AI summary appears → review extracted items → accept/edit/reject

**What it should include:**
- AI Summary card with confidence %
- Commitments list (each individually reviewable)
- Risks list
- Opportunities list
- Follow-ups list
- Suggested CRM updates
- "Generate follow-up email" CTA

**Trust mechanics:**
- Each item shows: text + confidence + source snippet (on tap)
- Accept all / review individually toggle
- Regenerate option per item

---

### Scenario 7: Follow-Up Email Draft
**Route:** `/accounts/[id]/capture` (email state) or modal
**Flow:** Tap "Generate follow-up email" → review draft → edit → send / copy / dismiss

---

### Scenario 8: Home Screen
**Route:** `/` (post-login) OR `/home`
**What it should include:**
- Today's route / nearby accounts
- Recent interactions
- Outstanding commitments
- AI-surfaced priorities for today
- Quick-capture button

---

### Scenario 9: Account Activity Tab (Full)
Currently shows basic activity rows. Full version should include:
- Expandable interaction cards
- Full transcript view
- Linked AI summary per visit
- CRM update history

---

## Demo Scenarios

These are scripted walkthroughs suitable for product demos:

### Demo A: "The Rep's Morning"
1. Open app → see "Ideas for this Time" for next account
2. Drive to ProFleet Glendale → "Visited Today" shows on list
3. Tap account → see pre-visit brief
4. Finish visit → Capture Meeting
5. End recording → AI summary appears
6. Accept commitments, edit one risk, reject one CRM update
7. Send follow-up email draft

### Demo B: "The Manager's View"
1. Browse all accounts
2. Filter by "At Risk" status
3. View account with no recent visit (Riverbend Collision — 1 year ago)
4. See empty state with suggestion to schedule visit
5. View Walmart Corp → 14 branches, recent activity across all

---

## Data Needed for Scenarios 4–7

When building the capture flow, add to `lib/mock-data/`:

```ts
// interactions.ts
mockTranscript: TranscriptSegment[]
mockAISummary: AISummary
mockCommitments: Commitment[]
mockRisks: Risk[]
mockOpportunities: Opportunity[]
mockFollowUps: FollowUp[]
mockCrmUpdates: CrmUpdate[]
```

All types are already defined in `lib/types/index.ts`.

---

*Last updated: 2026-05-14*
