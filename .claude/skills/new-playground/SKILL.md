---
description: Register a new playground in playgrounds.config.ts, commit it, and give the user the exact git commands to create their branch. Use when someone wants to start a new playground or exploration branch.
argument-hint: "[name] [description] [author]"
disable-model-invocation: true
allowed-tools: Read Edit Bash
---

## Live context

Current branch: !`git branch --show-current`

Current registry:
!`cat app/lib/playgrounds.config.ts`

## Instructions

The user wants to register a new playground. Their input: $ARGUMENTS

**Step 1 — Gather info**
Parse a name, one-line description, and author from $ARGUMENTS. If any piece is missing, ask for it before doing anything else. Do not proceed with placeholders.

**Step 2 — Generate the slug**
Derive a URL-safe slug from the name: lowercase, spaces to hyphens, strip special characters. The full `id` will be `playground/<slug>`.

**Step 3 — Update the registry**
Add a new entry to the top of the `PLAYGROUNDS` array in `app/lib/playgrounds.config.ts` (newest first). Use today's date for `startedAt`. Leave `url` as an empty string — it gets filled in later with `/playground-url`.

Entry shape:
```ts
{
  id: "playground/<slug>",
  name: "<Name>",
  description: "<one-line description>",
  url: "",
  author: "<Author>",
  status: "exploring",
  startedAt: "<YYYY-MM-DD>",
},
```

**Step 4 — Commit**
Commit the change on the current branch with the message:
`Register playground: <Name>`

**Step 5 — Tell the user what to do next**
Reply with:
1. Confirmation that the playground is registered
2. The exact two Terminal commands to run (using the slug you generated):
```
git checkout -b playground/<slug>
git push -u origin playground/<slug>
```
3. A note that Vercel will automatically start building a preview — it takes about 1–2 minutes. Once it's done, copy the URL from the Vercel dashboard and run `/playground-url <url>` to wire it in.
