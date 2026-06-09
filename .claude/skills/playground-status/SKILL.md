---
description: Update the status of a playground to "exploring", "review", or "shipped". Use when someone says their playground is ready for review, has been merged, or has shipped to main.
argument-hint: "[playground-name] [exploring|review|shipped]"
disable-model-invocation: true
allowed-tools: Read Edit Bash
---

## Live context

Current branch: !`git branch --show-current`

Current registry:
!`cat app/lib/playgrounds.config.ts`

## Instructions

The user wants to update a playground's status. Their input: $ARGUMENTS

**Step 1 — Parse intent**
Extract the playground name/id and the desired status from $ARGUMENTS.

Valid statuses: `exploring` · `review` · `shipped`

- If the status is missing or invalid, ask which they want and explain what each means:
  - `exploring` — actively being worked on (purple badge)
  - `review` — ready for others to look at (orange badge)
  - `shipped` — merged to main and live (green badge)
- If the playground name/id is missing, check the current branch first and infer from it. If that doesn't match any entry, list the available playgrounds and ask which one they mean.

**Step 2 — Find the entry**
Match loosely — "Map View", "map-view", and "playground/map-view" should all find the same entry. If multiple entries could match, list them and ask the user to clarify.

**Step 3 — Update the registry**
Set the `status` field for the matching entry in `app/lib/playgrounds.config.ts`.

**Step 4 — Commit and push**
Commit with the message:
`Update playground status: <name> → <status>`

Then push.

**Step 5 — Confirm to the user**
Tell them what changed and what the sidebar badge will now show. If they marked it as `shipped`, also mention they can ask Claude to remove the entry from the registry entirely if they want to clean up the list.
