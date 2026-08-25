# Handoff: Salesforce Quick Import (Halosight Lite)

## Overview

A user-initiated import that pulls a rep's recent Salesforce activity into Halosight Lite: the accounts their activity touches, plus the activity itself as **account notes** or **action items**. It is explicitly *not* a sync.

This handoff covers four things:

1. The end-to-end import flow (10 screens).
2. **Data & Connections** — a new Profile subsection that owns the connection, its last-import state, saved rules, and import history.
3. Provenance affordances — "Imported from Salesforce Aug 24" on an account, "from Salesforce" on an imported action item.
4. Home surfaces — the first-run import card, and the stale-import prompt.

The mental model to protect: **Connect → Halosight figures it out → Review → Import.** Mapping is exception handling, never a configuration step. On a clean org the user makes exactly one decision (approve).

## About the design files

The files in this bundle are **design references created in HTML** — prototypes of look and behavior, not production code. Recreate them in the Next.js Lite prototype using its existing components, tokens, and conventions. Do not port the HTML, the inline styles, or the `.dc.html` runtime.

`Salesforce Import Prototype.dc.html` is the clickable flow. `Salesforce Import - Rationale.dc.html` is the design rationale, flow diagram, edge-case matrix, and the Lite-vs-Full surfaces. Both need this design project's runtime to render; the spec below is self-sufficient.

## Fidelity

**High fidelity.** Colors, type, spacing, and copy are final. Recreate faithfully using the Halosight design tokens already in the prototype (`app/app/globals.css`). Where a token name below differs from the codebase, prefer the codebase's token.

---

## Screens

Mobile, 390×844. Dark. Headings Roboto Slab 700; all other text Barlow 400/600.

### 1. Home — first run (no companies yet)

Purpose: make the two ways to get started legible, with the higher-leverage one primary.

- Header row: hamburger, "Good afternoon, {firstName}" (Roboto Slab 700, 17px), avatar chip 32px circle on `--color-dark-secondary`.
- Card, `--gradient-hero`, 1px `--color-alpha-white-10`, radius 14, padding 24/22, gap 13:
  - Eyebrow: "GET STARTED", 10px, `letter-spacing: .14em`, uppercase, `--color-brand-purple`, 600.
  - Title: "Bring in the accounts you already work" — Roboto Slab 700, 25px, line-height 1.2.
  - Body 14px `--color-text-secondary`: "Pull in the accounts you've worked recently in Salesforce, with their calls, meetings and action items."
  - Primary button, 48px, radius 28, fill `--color-brand-purple`, text `--color-text-inverse`, 16px/600, icon `cloud_download`: **Import from Salesforce**
  - Secondary button, 44px, radius 28, 1px `--color-dark-tertiary`, icon `add`: **Add a company manually**
  - Footnote 12px `--color-text-disabled`, centered: "Takes about a minute. Nothing in Salesforce changes."
- Below the card, three 14px `--color-text-secondary` rows with 20px purple icons: `edit_note` "Log visits with voice — AI writes the summary", `checklist` "Action items generated from every meeting", `auto_awesome` "Smart prep before your next visit".

Behavior: not a wizard. Card is dismissible; once at least one company exists it collapses to a single row above the company list. Both entry points remain in Data & Connections permanently.

### 2. Disclosure

Purpose: state intent before OAuth. Salesforce's own consent screen covers scope; this covers what Halosight does with what it finds.

- Header: `close` + "Import from Salesforce" (15px/600 `--color-text-secondary`).
- Title "Before we connect" (Roboto Slab 700, 28px). Sub 15px: "You'll sign in to Salesforce next."
- Section eyebrow "WE LOOK AT" (purple), three bulleted lines (bullet char "•" in `--color-brand-purple`, 14.5px text):
  - Your tasks and activity from the last 60 days
  - The accounts they're attached to
  - Your Salesforce name and email
- 1px divider `--color-alpha-white-10`.
- Section eyebrow "WE COPY, ONCE" (`--color-brand-teal`), two teal bullets:
  - Those accounts, as companies
  - The activity, as notes or action items
- Boundary card, `--color-dark-primary`, radius 12, padding 16/18:
  - 14.5px/600: "A one-time copy, not a sync."
  - 13.5px `--color-text-secondary`: "Halosight won't change anything in Salesforce or check back on its own."
- Progressive disclosure link, 14px/600 purple + chevron: **What gets imported?** → expands 13.5px body: "Halosight reads your recent tasks, groups them by the account each one is attached to, and turns them into account notes or action items. Activity with no account attached is left behind. If fewer than 100 records turn up, we widen the window to 120 days."
- Sticky footer, 1px top border: footnote 12.5px `--color-text-disabled` centered "You'll approve what we found before anything is copied.", then primary 50px purple button **Continue to Salesforce**.

Notes: no Cancel button (the header close is the cancel), no "Agree and continue". This screen does not reappear on later imports — only when connecting a different Salesforce account or when scopes change.

### 3. Salesforce OAuth (system browser)

Standard OAuth handoff, not our chrome. Deep-link back into the app. Handle: success, user cancel (return silently to the entry point, no error, no modal), failure, expired session, insufficient permissions — see Edge cases.

### 4. Analysis

Purpose: make the intelligence visible instead of a spinner. Read-only; nothing is written.

Title "Looking through your Salesforce activity" (Roboto Slab, 27px). Three beats, 22px apart, each a 22px status icon + label (15.5px/600) + result (13.5px `--color-text-muted`):

| Beat | Label | Result when done |
| --- | --- | --- |
| 1 | Finding your recent activity | "127 tasks and activities since Jun 25" |
| 2 | Matching activity to accounts | "18 accounts · 4 records had none" |
| 3 | Sorting notes from action items | "All 123 sorted automatically" / "123 sorted · 2 types unclear" |

Icon states: pending `circle` in `--color-dark-tertiary` with `--color-text-disabled` label; active `radio_button_unchecked` purple, result reads "Working…"; done `check_circle` in `--color-success`. Footer 12.5px `--color-text-disabled`: "Reading only. Nothing is copied into Halosight yet."

Timing in the prototype: beats at ~1.1s / 2.3s / 3.4s, advance to Review at ~4.2s. In production, drive from real progress events; keep the beat order and copy.

### 5. Unrecognized type question (conditional)

Shown once per activity type Halosight can't place — only when they exist.

- Header: back arrow + position counter, 13px `--color-text-muted`: "1 of 2".
- Eyebrow "NOT SURE ABOUT THIS ONE" in `--color-warning`.
- Title: `Where should "{TypeName}" go?` (Roboto Slab 27px).
- Body 14.5px: "{n} activities use this type. It isn't a standard Salesforce type, so we'd rather ask than guess."
- Sample card, `--color-dark-primary`, radius 12: eyebrow "FROM YOUR SALESFORCE", then two real records — subject 14.5px, meta 12.5px `--color-text-muted` ("{Account} · {date}").
- Three option cards, `--color-dark-secondary`, 1px hairline, radius 12, padding 16, icon + label 15.5px/600 + hint 13px muted:
  - `sticky_note_2` purple — **Account note** / "Reads as history on the account"
  - `checklist` teal — **Action item** / "Shows up in your action items"
  - `block` muted — **Don't import** / "Leave these in Salesforce"
- Footer 12.5px: "We'll remember this for next time. You can change it in Data & Connections."

Behavior: picking an option answers and advances to the next unresolved type, then returns to Review. Answers persist as saved rules.

### 6. Review and approve — the one decision

Purpose: one screen that carries counts, destinations, samples, exceptions, and approval.

- Header: `close` + "Import from Salesforce".
- Title "Here's what we found"; sub 14px muted "From your Salesforce activity since Jun 25."
- Two stat cards side by side (`--color-dark-primary`, radius 12): big number Roboto Slab 26px + label 12.5px muted — **18 accounts**, **127 activities**. The activity number is *found*, and must equal notes + action items + left out + unresolved.
- Exception row (only when unresolved types exist): `rgba(245,166,35,.08)` fill, 1px `rgba(245,166,35,.35)`, radius 12, `help` icon in `--color-warning`, title 14.5px/600 "2 activity types need your call", sub 13px "Site Audit and Route Check — 4 activities, not standard Salesforce types", chevron. Tapping opens screen 5.
- Section header: eyebrow "HOW IT COMES IN" + right-aligned 12px hint "tap a row to change".
- Destination list, one bordered container radius 12, three rows separated by hairlines. Each row: 22px icon, title 15px/600, sub 13px muted, count Roboto Slab 17px in the row's accent, chevron.
  - `sticky_note_2` purple — **Account notes** / "History you can read before a visit" / 94
  - `checklist` teal — **Action items** / "Open items assigned to you" / 29
  - `block` muted — **Left out** / "No account attached in Salesforce" (or "Your choices, plus 4 with no account attached") / 4
- Expanding a row reveals, inside `padding: 0 16px 16px; gap: 14px`:
  - For **Left out** only, non-editable notice cards: "No account attached · 4 activities" with body "These tasks aren't linked to an account in Salesforce, so there's nothing to file them under. Link them there and import again." Plus, when accounts are unchecked, "Accounts you unchecked · N activities".
  - One card per activity type: name 14.5px/600 + count right-aligned 12.5px muted; one real sample in 13px `--color-text-secondary` (`"Called Marcus re: Q3 pricing" · Jack's Tire & Oil · Aug 12`); then a **segmented control** — track `--color-dark-base`, radius 999, padding 4, gap 4; segments flex:1, 32px, radius 999, 13px/600; selected segment fill `--color-dark-tertiary` with `--color-text-primary`, unselected transparent with `--color-text-disabled`. Segments: **Note · Action item · Leave out**.
- Accounts container, radius 12: row with `domain` teal icon, "Accounts coming in", sub "All 18, taken from the activity we found" (or "17 of 18 · 6 activities excluded"), chevron. Expanded: one row per account with a `check_box` / `check_box_outline_blank` toggle (purple when on), name 14.5px/600 (muted when off), meta 12.5px "{n} activities · visited {recency}". First six shown; a purple 13.5px/600 action row toggles **Show the other 12 accounts** / **Show fewer**.
- Footnote 12.5px `--color-text-disabled`, `text-wrap: balance`: "4 activities have no account attached in Salesforce, so they stay there." — or "N activities stay in Salesforce: the ones you left out, plus 4 with no account attached."
- Sticky footer: primary 50px purple **Import 123 activities**, footnote "Nothing is copied until you tap this."

Critical behaviors:

- **Changing a destination must be visible.** When a type moves group: leave a dashed placeholder in the origin group — 1px dashed `--color-dark-tertiary`, `arrow_forward` purple icon, "Call moved to Action items", with an **Undo** action; auto-expand the destination group and outline the moved card with a 1px `--color-brand-purple` border; raise a toast directly above the Import button (`--color-dark-tertiary` fill, 1px `--color-alpha-white-18`, radius 12, `swap_horiz` icon) reading "Call now comes in as an action item" with **Undo**. Clear all three after ~5s.
- Import button is disabled (fill `--color-dark-secondary`, text `--color-text-disabled`) only while unresolved types remain; label becomes "Answer 2 questions to continue". If everything is left out: "Nothing selected to import", inert, and the Left-out group auto-expands.
- Counts are net-new: dedupe against previously imported Salesforce record ids before this screen renders, and state it — "31 you've already imported are skipped."
- Accounts that already exist in Halosight merge rather than duplicate (match on Salesforce account id, then name): "3 of these are companies you already have — we'll add the activity to them."

### 7. Sample records (optional, deferred)

A list of six representative records, each showing subject, meta, and destination. **Cut from V1** — every destination row already carries a sample. Ship only if the confidence gap shows up in testing.

### 8. Importing

Deliberately inert. No cards, no secondary actions, nothing to decide.

Centered column, ~240px from the top: title "Importing" (Roboto Slab 700, 27px); 15px `--color-text-secondary` "This can take a few minutes."; a 6px full-width progress track (`--color-dark-secondary`, radius 999) with a `--color-brand-purple` fill; percentage 13px `--color-text-muted`.

Notes: import runs server-side. A "you can navigate away" affordance is explicitly **out of scope for V1**. If Salesforce is slow past ~20s, the page stays as-is; do not time out and discard work.

### 9. Success

- 40px `check_circle` filled, `--color-success`.
- Title "You're ready to go" (Roboto Slab 30px). Sub 15px: "Imported from Salesforce just now. Import again whenever you want more."
- Result list, one bordered container, three rows: 22px icon + label 15px + value Roboto Slab 17px — `domain` teal "Companies added" 18, `sticky_note_2` "Account notes imported" 94, `checklist` "Action items created" 29.
- Handoff card, `--gradient-hero`, radius 14: eyebrow "START HERE", account name Roboto Slab 19px ("Jack's Tire & Oil"), 13.5px "9 notes and 3 action items came across. You visited 2 weeks ago.", 44px purple button **Open the account**. Pick the account with the most imported activity and the least recent visit.
- Footer: 46px outlined button **Done** → app home.
- Partial failure: same screen plus one amber row "6 activities didn't come through" with **Retry those 6** (idempotent).

### 10. Home after import

Standard populated home. Suggested-visit card (coral **Log a Visit**), COMPANIES section with "View all" and per-company note-count chips (11.5px purple text on `rgba(139,146,255,.14)`, radius 999), ACTION ITEMS section with "View all" and rows of `radio_button_unchecked` + title + "{date} · {Company}".

---

## Data & Connections (new Profile subsection)

Move "Import from Salesforce" out of the flat Profile list. Profile keeps identity, support, tenant, and gets one row: "Data & Connections — Salesforce, last imported Aug 24".

Screen: back arrow + "Data & Connections" (Roboto Slab 17px).

- Connection card (`--color-dark-secondary`, hairline, radius 12): `cloud_download` purple icon, title 16px/600 "Salesforce quick import", meta 13.5px muted **"Last imported Aug 24 · 18 companies"**, body 13.5px "A manual copy of your recent account activity. It doesn't run on its own.", then 44px purple button **Import new activity**.
- List container, radius 12, hairline-separated rows: `tune` **How activity comes in** (right meta "6 rules"), `history` **Import history** ("3"), `link_off` **Disconnect Salesforce**.
- Education card, hairline only: 14.5px/600 "Want Salesforce to stay up to date on its own?", 13.5px "Full Halosight keeps your accounts and activity connected continuously, across your whole team.", 14px/600 purple link "Compare quick import and full integration →".

**Never show a green "Connected" status light.** Last-imported dates and user-performed verbs are what distinguish import from sync.

**How activity comes in** = the saved rules list, same rows and segmented control as the Review expansion, editable outside a run. Rules for values that no longer exist in Salesforce are dropped silently; new values surface as the amber exception row on the next Review.

**Import history** = one entry per run (date, counts). Each is removable, with this confirm copy: "Remove this import? This deletes the 94 notes and 29 action items from the Aug 24 import. Companies stay, and so does anything you've written or changed yourself since. Nothing in Salesforce is affected." Report preserved edits: "3 notes you've edited were kept." *(Post-V1 if the data model can't support it — do not fake it.)*

## Provenance

- Account detail, under the header, one quiet line: 12.5px `--color-text-muted`, 16px `cloud_download` purple icon — "Imported from Salesforce Aug 24".
- Imported action items: existing meta line gains a suffix — "August 2 · from Salesforce".
- Nothing else. No badges on note cards or list rows.

## Stale-import prompt (home)

Card, `--color-dark-secondary`, hairline, radius 12, `update` purple icon, dismiss `close` at right:

> Your Salesforce activity was last imported 18 days ago.
> **Import new activity**

Rules: appears once after 14 days with no import, dismissible, does not return for another 14 days. No full-integration message here.

## Lite vs Full comparison

Reached from Data & Connections only. Title "Two ways to work with Salesforce"; sub "You're using quick import today. Nothing changes unless your organization moves to full integration." Two-column table, "Quick import" (with a purple "YOU'RE HERE" eyebrow) vs "Full integration" ("Organization-wide"):

| Quick import | Full integration |
| --- | --- |
| You import when you want | Stays up to date on its own |
| Recent activity | Full account history |
| Standard tasks and activities | Your custom objects and fields |
| Just your records | Your whole team's |
| You set it up in a minute | Set up with your admin |

Closing 13.5px: "Quick import is the right choice for most people getting started. Full integration is worth it when a whole team needs Halosight and Salesforce to agree without anyone pressing a button." Outlined purple CTA: **Talk to us about full integration**.

---

## Interactions & behavior

- Navigation is a linear stack: Home → Disclosure → OAuth → Analysis → Review → Importing → Success → Home. Analysis and Importing are not back-navigable; Review is (close returns to the entry point and discards the analysis, nothing having been written).
- Press feedback over hover: buttons scale to .97 and drop opacity; rows drop to ~.7.
- Expand/collapse: chevron flips `expand_more`/`expand_less`.
- Toast: rise 8px and fade, auto-dismiss ~5s, always carries Undo.

## State

```
connection: { connected, salesforceUserId, lastImportAt, lastRecordCursor }
rules:      { [salesforceTypeValue]: 'note' | 'task' | 'skip' }
analysis:   { accounts[], activityTypes[{ name, count, recommended, confident }],
              unlinkedCount, alreadyImportedCount, windowStart }
review:     { answers{}, excludedAccountIds[], expandedGroups{}, moved|null, showAllAccounts }
run:        { status: idle|analyzing|importing|done|partial, progress, created{}, failed[] }
```

Derived, never stored: note/action-item/left-out counts, the import label, whether the exception row shows.

## Design tokens

Use the codebase tokens; these are the values the design assumes.

| Role | Token | Value |
| --- | --- | --- |
| Page | `--color-background` | `#111420` |
| Surface 1 | `--color-dark-primary` | `#1A1D29` |
| Surface 2 / cards | `--color-dark-secondary` | `#252A36` |
| Dividers, active segment | `--color-dark-tertiary` | `#3D4451` |
| Deepest (segmented track) | `--color-dark-base` | `#0D0F1A` |
| Text | `--color-text-primary` / `-secondary` / `-muted` / `-disabled` | `#F7F8FF` / `#C3CAD8` / `#8B94A8` / `#5D667A` |
| Interactive accent, import CTA | `--color-brand-purple` | `#8B92FF` |
| Relationship / account data | `--color-brand-teal` | `#6B9DB0` |
| Primary app CTA (Log a Visit only) | `--color-brand-coral` | `#FF6B5A` |
| Success | `--color-success` | `#2ECC71` |
| Needs review | `--color-warning` | `#F5A623` |
| Hairline | `--color-alpha-white-10` | `rgba(255,255,255,.10)` |

Radii: inputs/account cards 8, cards 12, hero cards 14, sheets 16, buttons/pills 28 or 999. Spacing on a 4px grid. Type: Roboto Slab 700 headings only (30/28/27/25/22/19/18/17); Barlow 400/600 for everything else (16/15.5/15/14.5/14/13.5/13/12.5/12); eyebrows 10px uppercase `.14em`.

Icons: Material Symbols Rounded, outlined at rest, filled for active/selected. Used here: `cloud_download`, `add`, `close`, `arrow_back`, `chevron_right`, `expand_more`, `expand_less`, `check_circle`, `radio_button_unchecked`, `circle`, `help`, `sticky_note_2`, `checklist`, `block`, `domain`, `check_box`, `check_box_outline_blank`, `swap_horiz`, `arrow_forward`, `tune`, `history`, `link_off`, `update`, `edit`, `edit_note`, `auto_awesome`, `menu`, `person`, `link`, `location_on`, `calendar_today`.

## Edge cases

Group them; do not build 18 screens.

1. **Connection didn't complete** — one screen, fixed shape (title, one cause sentence, one action). Auth failed: "Salesforce didn't finish signing you in. Nothing was imported." → Try again. Expired: "Your Salesforce session has expired. Sign in again to pick up where you left off." → Sign in to Salesforce. Permissions: "Your Salesforce account can't read tasks and activities. Your Salesforce admin can turn that on." → Copy details for your admin. Different account: "This is a different Salesforce account than last time. Anything already imported stays put." → Continue / Use the other account. **Cancelled OAuth is not an error** — return silently.
2. **Nothing worth importing** (no activity, nothing linked to an account, no accessible accounts) — one screen: "Nothing to import yet" + cause line + **Add a company manually** / Try again later. Unlinked variant: "We found 22 tasks, but none of them are attached to an account in Salesforce, so there's nothing to file them under."
3. **Odd but not broken** (unknown types, low confidence, unlinked records, inaccessible accounts, duplicates, already imported, everything left out, stale rules) — all resolve inline on Review as described above.
4. **Slow or large** — phase-free progress copy, server-side execution, no timeout that loses work; partial failure lands on Success with a retry row.
5. **Reversal** — Import history entry removal, with the exact confirm copy above.

## Assets

No new assets. Material Symbols Rounded and the Barlow / Roboto Slab webfonts are already in the prototype.

## Files in this bundle

- `Salesforce Import Prototype.dc.html` — clickable flow, both data scenarios (clean org; two unrecognized types). Reference for layout, copy, and interaction.
- `Salesforce Import - Rationale.dc.html` — UX model, flow diagram with failure branches, disclosure copy rationale, grouped edge cases, Lite-vs-Full surfaces, V1 scope cuts.
- `PROMPT.md` — a prompt to paste into Claude Code.

## Open questions to resolve before building

1. Can mapping rules persist per user today? The returning-import experience depends on it.
2. Is the 60-day window (widening to 120) a product decision or an API constraint?
3. Can the import run server-side after the app is closed? Screen 8 assumes yes.
4. Is per-import removal feasible on the current data model? If not, drop Import history from V1 rather than approximating it.
