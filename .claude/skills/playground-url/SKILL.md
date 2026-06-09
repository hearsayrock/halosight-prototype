---
description: Wire a Vercel preview URL into playgrounds.config.ts for the current branch's playground. Use when someone pastes a Vercel preview URL after their playground branch has been built.
argument-hint: "[vercel-preview-url]"
disable-model-invocation: true
allowed-tools: Read Edit Bash
---

## Live context

Current branch: !`git branch --show-current`

Current registry:
!`cat app/lib/playgrounds.config.ts`

## Instructions

The user has a Vercel preview URL to add to their playground. URL provided: $ARGUMENTS

**Step 1 — Identify the playground**
Look at the current branch name from the live context above. Find the entry in `PLAYGROUNDS` whose `id` matches the current branch name exactly.

- If no match is found: tell the user no playground is registered for this branch and suggest running `/new-playground` first.
- If the URL argument is empty or missing: ask the user to paste their Vercel preview URL.
- If the `url` field already has a non-empty value: show the user the existing URL and ask them to confirm before overwriting.

**Step 2 — Update the registry**
Set the `url` field for the matching playground entry in `app/lib/playgrounds.config.ts` to the provided URL.

**Step 3 — Commit and push**
Commit with the message:
`Add preview URL for playground: <name>`

Then push.

**Step 4 — Confirm to the user**
Tell them:
- Their playground is now live and linked in the left sidebar
- The DevPanel on the right will also link directly to it
- They're ready to start building — suggest they can also add `routes` to the config entry if they want quick-jump buttons in the DevPanel for the specific screens they're working on (just ask Claude to add them)
