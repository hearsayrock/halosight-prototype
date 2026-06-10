# Figma Design Library Setup

How to connect the Halosight token system to a new Figma library so that tokens stay in sync between the codebase and Figma.

---

## What syncs and what doesn't

| Layer | Sync direction | Method |
|---|---|---|
| Colors, radii, spacing, shadows | ↔ Bidirectional | Tokens Studio + Style Dictionary |
| Font families, font weights | ↔ Bidirectional | Tokens Studio |
| Typography scales | → Code to Figma | Tokens Studio (as text styles) |
| Components | Manual | Figma components mirror coded components by hand |
| Screens | Not synced | The web prototype IS the screen reference |

The token layer is fully automated. The component layer is maintained manually but the token sync keeps visual parity locked.

---

## One-time Figma setup

### 1 — Create a new Figma library file

1. Open Figma, create a new file: **"Halosight Design System"**
2. Publish it as a team library (Assets panel → book icon → Publish)

### 2 — Install Tokens Studio

1. In Figma, open the Community plugins panel
2. Search for **"Tokens Studio for Figma"** (formerly Figma Tokens)
3. Install and open it

### 3 — Connect Tokens Studio to GitHub

1. In Tokens Studio, go to **Settings → Sync providers → Add new**
2. Choose **GitHub**
3. Fill in:
   - **Repository:** `nate-natesdesigns/halosight-prototype` (your GitHub repo)
   - **Branch:** `main`
   - **Token path:** `app/tokens/tokens.json`
   - **Personal access token:** create one at GitHub → Settings → Developer settings → Fine-grained tokens
     - Permissions needed: **Contents** (read & write), **Metadata** (read)
4. Click **Save** and then **Pull from GitHub** to load the current token set

### 4 — Apply tokens to Figma Variables

1. In Tokens Studio, click **Variables** in the right panel
2. Click **Create Variables** — it will create Figma Variable collections from your token groups:
   - `color` → Color variables
   - `radius` → Number variables (labeled as radii)
   - `spacing` → Number variables
3. Review the created variables in Figma (Edit → Manage Variables)

### 5 — Create Text Styles from typography tokens

Tokens Studio can't fully auto-create text styles, so do this once manually:

1. In Figma, define text styles for each scale (H1–H6, body variants, eyebrow, labels)
2. Name them exactly matching the token keys, e.g. `heading/1`, `body/bold-base`, `eyebrow`
3. Apply the Figma Variables to each style's color and size properties

---

## Day-to-day sync workflow

### Figma → Code  (designer updates a color in Figma)

1. Open Tokens Studio in Figma
2. Make your changes (e.g. adjust `color.brand.purple`)
3. Click **Push to GitHub** → choose "main" branch → write a commit message
4. GitHub Action `sync-tokens.yml` automatically runs:
   - Rebuilds `tokens/generated/tokens.css`
   - Commits it back to main
5. Next time the app deploys, the new color is live

### Code → Figma  (developer adds a new token in code)

1. Add the token to `app/tokens/tokens.json`
2. Also add the CSS variable to the appropriate `app/tokens/*.css` file (currently colors.css, spacing.css, etc.)
3. Push to main — the GitHub Action regenerates the CSS
4. In Figma, open Tokens Studio → **Pull from GitHub** to get the new token
5. Click **Create Variables** again to add the new variable to Figma

---

## File structure

```
app/tokens/
├── tokens.json          ← Source of truth for Tokens Studio sync
├── $metadata.json       ← Tokens Studio metadata (token set order)
├── $themes.json         ← Tokens Studio themes (empty for now)
├── sd.config.mjs        ← Style Dictionary build config
├── colors.css           ← Authoring CSS (mirrors tokens.json colors)
├── spacing.css          ← Authoring CSS (mirrors tokens.json spacing/radii)
├── typography.css       ← Authoring CSS (mirrors tokens.json typography)
├── fonts.css            ← Font face declarations
├── icons.css            ← Material Symbols utility classes
└── generated/
    └── tokens.css       ← ⚠️ AUTO-GENERATED — do not edit
```

---

## Running the build locally

```bash
cd app
npm install
npm run build:tokens
```

This reads `tokens/tokens.json` and writes `tokens/generated/tokens.css`.

---

## Tips

- **Never edit `tokens/generated/tokens.css` by hand** — it will be overwritten on the next build.
- When resolving a merge conflict in `tokens.json`, prefer keeping the most recent intentional change. The generated CSS will be rebuilt automatically on push.
- The `[skip ci]` tag on auto-commits prevents an infinite Action loop.
- Tokens Studio's free tier supports GitHub sync fully. No paid plan needed for this workflow.
