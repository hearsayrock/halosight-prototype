---
name: ai-component-metadata
version: 2.0.0
description: Central component registry for the Halosight design system. Provides AI-ready metadata that ensures correct component usage, token compliance, and Flutter handoff consistency. Adapted from the original skill to match Halosight's architecture (Next.js + Tailwind v4, custom category system, Flutter-ready tokens).
---

# Halosight Component Registry

Structured, AI-consumable metadata for the Halosight design system. Enables AI to use existing components correctly — right tokens, right patterns, no recreating what already exists.

**Registry location:** `/docs/component-registry.ts`

---

## How It Works

Unlike the original skill (per-file metadata exports), Halosight uses a **central registry**: a single TypeScript file that documents every component in one place. This is more practical for a small, rapidly evolving system where a scattered per-file approach would require constant coordination.

The registry is the authoritative source for:
- What components exist and where they live
- Which tokens each component uses (required) and must never use (forbidden)
- Flutter equivalents for every prop and layout detail
- AI usage hints — when to use, when not to, what to always remember

---

## Quick Reference

Before building any UI, read `aiInstructions` from the registry:

```ts
import { aiInstructions, tokenRules, components } from "@/docs/component-registry";
```

Or read the file directly — it's plain TypeScript with inline comments.

---

## Registry Schema

Each component entry follows `ComponentMeta`:

```ts
interface ComponentMeta {
  name: string;
  category: "layout" | "feature" | "ui-primitive";
  type: "interactive" | "display" | "container" | "navigation";
  description: string;
  file: string;                      // path from repo root
  designSystemSection: string;       // anchor on /design-system

  flutterEquivalent: {
    widget: string;
    file?: string;                   // production widget path if it exists
    notes?: string;
  };

  tokens: {
    required: string[];              // tokens this component MUST use
    forbidden: string[];             // never use these (raw hex, wrong tokens)
  };

  props: Record<string, {
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }>;

  usage: {
    patterns: Array<{ name: string; description: string; jsx: string }>;
    antiPatterns: Array<{ scenario: string; reason: string; instead: string }>;
  };

  aiHints: {
    priority: "high" | "medium" | "low";
    useWhen: string[];
    neverUseFor: string[];
    alwaysRemember: string[];
  };
}
```

---

## Component Categories

Halosight uses three categories — **not** Atomic Design (atoms/molecules/organisms):

| Category | Folder | Description |
|---|---|---|
| `layout` | `components/layout/` | App-level structural, one per screen |
| `feature` | `components/accounts/`, `components/capture/` | Domain-specific, tied to a feature area |
| `ui-primitive` | `components/ui/` | Generic, not domain-aware |

---

## Adding a New Component

When a new component is built, add an entry to `/docs/component-registry.ts`:

1. Copy an existing entry as a template
2. Fill in all fields — do not leave `tokens.required` empty
3. List at least one `usage.pattern` and one `usage.antiPattern`
4. Add at least two `aiHints.alwaysRemember` entries
5. If a production Flutter widget exists, add its path to `flutterEquivalent.file`

Also follow the component file template in `docs/component-architecture.md` — the Flutter handoff comment block is required in every component file.

---

## Token Rules (Quick Reference)

Full rules are in the `tokenRules` export in the registry. Summary:

| Purpose | Token |
|---|---|
| Card / list item bg | `--md-sys-color-dark-secondary` |
| Dropdown / elevated surface | `--md-sys-color-dark-tertiary` |
| App background | `--md-sys-color-background` |
| Primary text | `--md-sys-color-text-primary` |
| Muted / metadata text | `--md-sys-color-text-muted` |
| Borders, card edges | `--md-sys-color-alpha-white-10` |
| Primary CTA | `--md-sys-color-brand-coral` |
| Interactive / accent | `--md-sys-color-neonindigo` |
| Secondary action | `--md-sys-color-indigo` |
| Card radius | `--radius-sm` |
| Dropdown / button radius | `--radius-xl` |
| Pill / nav radius | `--radius-full` |

**Never use raw hex values.** Never use raw px for border-radius. See `docs/design-system.md` for the full token reference.

---

## AI Rules (Enforced)

These rules are embedded in `aiInstructions` in the registry and apply to every AI-assisted UI task:

1. Read the registry before building any UI
2. Never recreate a component that already exists — check `components[]` first
3. Never use raw hex or raw px radius — always `var(--md-sys-color-*)` and `var(--radius-*)`
4. Check `tokens.forbidden` for the target component before writing styles
5. Use `.text-base`, `.heading-5`, etc. — never inline `fontSize` as raw numbers
6. Every new component needs a Flutter handoff comment block
7. Glass/blur effects require `--md-sys-color-alpha-*` tokens + `backdropFilter`
8. After adding a component or token, update the design system page and docs

---

## What Changed from the Original Skill

The original `ai-component-metadata` skill was designed for a different stack (Tamagui/Radix component primitives, Atomic Design categories, Python-based auto-generation). The following changes were made for Halosight:

| Original | Halosight adaptation |
|---|---|
| Per-file metadata exports | Central registry at `/docs/component-registry.ts` |
| `atoms / molecules / organisms` | `layout / feature / ui-primitive` |
| Generic `aiHints.keywords` | Specific `useWhen`, `neverUseFor`, `alwaysRemember` |
| No token enforcement | `tokens.required` + `tokens.forbidden` per component |
| No Flutter context | `flutterEquivalent` on every entry |
| Python auto-generation script | Not used — registry is hand-maintained |
| Separate accessibility schema | Folded into `aiHints.alwaysRemember` |

---

## Current Components in Registry

| Component | Category | File |
|---|---|---|
| `BottomNav` | layout | `components/layout/BottomNav.tsx` |
| `AccountListItem` | feature | `components/accounts/AccountListItem.tsx` |
| `AccountTypeIcon` | feature | `components/accounts/AccountTypeIcon.tsx` |
| `SortMenu` | feature | `components/accounts/SortMenu.tsx` |
| `Icon` | ui-primitive | `components/ui/Icon.tsx` |
| `MenuIcon` | ui-primitive | `components/ui/MenuIcon.tsx` |

---

*Last updated: 2026-05-16*
