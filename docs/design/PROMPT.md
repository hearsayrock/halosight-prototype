# Prompt for Claude Code

Paste this into Claude Code from the root of your Lite branch, with `design_handoff_salesforce_import/` copied into the repo (e.g. at `docs/design/`). Adjust the paths in the first paragraph to match where you put it.

---

Read `docs/design/design_handoff_salesforce_import/README.md` in full before writing any code. It is a high-fidelity design spec for a new feature: Salesforce quick import in Halosight Lite. The two `.dc.html` files next to it are HTML design prototypes — reference them for layout, copy, and interaction, but do not port their markup, inline styles, or runtime. Recreate the designs using this repo's existing components, tokens, routing, and data patterns.

Before you write anything, do this and report back:

1. Read `AGENTS.md`, `app/app/globals.css`, and the components in `app/components/` so you're using our tokens and primitives rather than inventing any.
2. Tell me which existing screens and components you'll reuse or extend — the home screen, the profile screen, the account detail screen, buttons, cards, segmented controls, list rows, toasts.
3. Tell me what's missing that you'd need to add as a shared primitive (I expect: a segmented control, an expandable list row, a toast with an undo action).
4. List the data/API work the flow needs, and flag anything the spec assumes that our backend can't do yet — the four open questions at the end of the README are the ones I already know about.

Then propose an implementation plan in vertical slices, smallest shippable first, and stop for my review before building:

- Slice 1: Data & Connections in Profile (connection card with last-import state, saved-rules list, disconnect), plus the "Imported from Salesforce {date}" provenance line on account detail and "· from Salesforce" on imported action items. Mock the connection state.
- Slice 2: the flow — home entry card, disclosure, OAuth handoff and return, analysis, review, importing, success, and the return to a populated home. Real data, mocked where the API isn't ready.
- Slice 3: the unrecognized-type question flow and the inline exception handling on review.
- Slice 4: stale-import prompt and the Lite-vs-Full comparison screen.

Rules while you build:

- Use the exact copy from the spec. Don't rewrite microcopy; the wording is the design.
- No raw hex, no raw px radii — tokens only.
- The word "sync" never appears in Lite UI. Import is always a verb the user performs, and every surface that mentions the connection shows a date.
- Review is the only screen that asks the user for anything, and only when the data is genuinely ambiguous. Never add a configuration or field-mapping step.
- The destination-change behavior on Review (dashed placeholder in the origin group, auto-expanded destination, outlined moved row, toast with Undo) is required, not a nice-to-have — the spec explains why.
- The importing screen has no actions on it at all. Don't add a "continue in background" affordance.
- Skip anything the README marks as deferred or post-V1 (the sample-records screen, import history removal if the data model can't support it).

Ask me before making any product decision the spec doesn't cover.

---

## Which repo files to give it

You don't need to hand-pick much — Claude Code can read the repo itself. What matters is that the handoff folder is *in* the repo and that you point it at your conventions:

- Copy `design_handoff_salesforce_import/` into the repo (`docs/design/` is a good home) and commit it on the Lite branch. Doing this in-repo rather than pasting into chat means it can re-read the spec on every follow-up turn instead of losing it to context.
- Make sure `AGENTS.md` is current on that branch — it's the file that keeps generated code in your house style.
- If your Lite prototype has a scenarios or mock-data doc (`docs/prototype-scenarios.md`, `docs/data-model.md`), mention them by name in the prompt; the flow needs plausible accounts, activity types, and counts.

## How to get the files

Download this folder from the chat, unzip it into `docs/design/` in your Lite branch, and commit. That's it — the README is written to be self-sufficient for someone who wasn't in this conversation.
