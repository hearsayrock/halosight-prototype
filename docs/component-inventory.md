# Component inventory

> Generated from the code on `main` (via `playground/component-updates`). Facts come from the source files; **the labels and descriptions are proposals — mark the "Your call" column**. Once labels are final, this becomes the registry and Reed's conversion list.

## Decisions so far (2026-10-27)

- **SortMenu, VisitedFilterDropdown, InsightCard:** Library.
- **Sheets → one Drawer:** the six bottom sheets were rebuilt on the shared `Drawer` pieces (2026-10-28). Fill is now `color.dark.primary` everywhere; the dim behind is the new `color.alpha.scrim` token. The action item detail page was replaced by `ActionItemDrawer`.
- **SystemAccountListItem:** merged into AccountListItem as the `crm` variant (done 2026-10-27; the file is deleted). Reed builds one widget.
- **BottomNav:** Furniture. It is not part of the product, so it gets no handoff. It still has a registry entry and a section on the design-system page, which are now stale.
- Everything not marked ☑ below is my proposal and stands unless changed.

## How to use this

- **Your call:** `☑` = decided. `☐` = my proposal, not yet confirmed. Reply in chat to change a label or add a note; nothing in this file is clickable.
- **Handoff comment:** whether the file has the `FLUTTER HANDOFF` header. **In registry:** whether it's in `docs/component-registry.ts`.
- **Hard-coded colors:** raw hex / `rgba()` values in the file (approximate; includes colors mentioned in comments). Handoff-ready components should use tokens only.
- Token paths (appendix) follow the design-system rule: `color.semantic.success`, not `--md-sys-color-success`. A `*` means the prototype's CSS name differs from the rule and will be renamed when the generator is built (DELIVERY-1475).

## Labels

| Label | Meaning | Count |
|---|---|---|
| **Library** | Reusable widgets. These become the shared Flutter component library. | 18 |
| **Feature** | Built for one flow. These become Flutter feature widgets, not shared library components. | 8 |
| **Furniture** | Prototype scaffolding. Never converted to Flutter. | 11 |

## Caveats

- **This is `main`.** Newer versions of several components live on unmerged branches: `playground/add-company-test` (redesigned company rows, FAB, `CreateEntrySheet`, `FilterSheet`, new feedback card), and `playground/interaction-updates`. `playground/new-colors` is tabled. Decide where each component's source of truth should come from before handing it off.
- **Handoff comments missing on product components:** MiniCalendar, CompletionToast, CaptureWidget, AddActionItemSheet.
- **Registry covers only 7 components:** AccountListItem, CountBadge, AccountTypeIcon, SortMenu, BottomNav, Icon, MenuIcon (all Library).
- **Out of scope for components:** screens (`app/(mobile)/**/page.tsx`) are not listed here.

## Findings worth fixing

- **Undefined token referenced (`†`) — fixed 2026-10-27.** `--md-sys-color-semantic-success` is used in `FeedbackWidget`, `AIReviewOverlay` and the companies page, but only the short name `--md-sys-color-success` was defined, so those checkmarks had no color. `tokens/colors.css` now defines `--md-sys-color-semantic-{success,warning,error,info}` (and `-light` / `-dark`) as aliases of the short names, in both themes, same values. The generator (DELIVERY-1475) replaces the aliases later.
- **Hard-coded colors** remain in most feature components (see the column). They should become tokens before a component is documented as handoff-ready.

## Library (18)

_Reusable widgets. These become the shared Flutter component library._

| # | Component | What it is | Used by | Handoff comment | In registry | Hard-coded colors | Flag / question | Your call |
|---|---|---|---|---|---|---|---|---|
| 1 | **AccountListItem**<br>`accounts/AccountListItem.tsx` | Row in the companies list: name, distance and location, last visited, risk and task badges. Has owned, crm ("Owner: name") and home variants, using the shared ListCard. | Companies / home / items, design-system page | ✓ | ✓ | 5 | Updated 2026-10-27: risk badge, zero-count badges hidden, SystemAccountListItem merged in as `variant="crm"`, and the home row added as `variant="home"` (inline CompactAccountRow removed). Has its own area on /design-system. Handoff comment and registry entry are current (first component done to the new standard). | ☐ |
| 2 | **AccountTypeIcon**<br>`accounts/AccountTypeIcon.tsx` | 18px icon for corporate, branch or standalone accounts. | design-system page | ✓ | ✓ | 0 | Only used on the design-system page today (hidden in the list). | ☐ |
| 3 | **ActionItemList**<br>`accounts/ActionItemList.tsx` | Card of action item rows (check circle, title, due text, account name) plus the section header. Replaces ActionItemCard, the home task strip, the interaction page rows and the full-page task rows (variant="page"). | Home, account detail, interaction, /tasks, priorities view, design-system page | ✓ | ✓ | 3 | New 2026-10-28. Props pick the screen: home = showAccountName + limit; account/interaction = collapsedCount. Handoff comment and registry entry written. | ☐ |
| 4 | **CountBadge**<br>`accounts/CountBadge.tsx` | Icon + number pill for risk and task counts on account rows. Hides itself at 0. | AccountListItem, Companies / home / items, design-system page | ✓ | ✓ | 0 | New 2026-10-27, extracted from AccountListItem. Handoff comment and registry entry written. | ☐ |
| 5 | **InsightCard**<br>`accounts/InsightCard.tsx` | AI card ("Last time" / "Ideas for next time") with a hairline footer: copy + thumbs-down always; sources and read-aloud/ask-AI optional (off for first handoff); `loading` shows the InsightCardLoader (sparkle + cycling status lines). | Account detail | ✓ | — | 0 | Now in the design-system page (Insight Card area, with a toggle for the optional footer items). Treated as a reusable AI-output pattern. | ☑ Library |
| 6 | **MiniCalendar**<br>`accounts/MiniCalendar.tsx` | Inline month calendar date picker. | Action item, AddActionItemSheet | **missing** | — | 0 | No handoff comment. | ☐ |
| 7 | **SortMenu**<br>`accounts/SortMenu.tsx` | Sort and filter menu opened from the list header (iOS menu-style spring). | Companies / home / items, design-system page | ✓ | ✓ | 3 | Embeds VisitedFilterDropdown. | ☑ Library |
| 8 | **CompletionToast**<br>`ui/CompletionToast.tsx` | "Item complete" banner with undo and an optional add-note action. | Account detail, Companies / home / items, Interaction detail, Tasks | **missing** | — | 4 | No handoff comment. | ☐ |
| 9 | **CustomIcons**<br>`ui/CustomIcons.tsx` | Custom SVG icons that supplement Material Symbols. | AccountListItem, Action item, Companies / home / items | ✓ | — | 0 |  | ☐ |
| 10 | **ErrorState**<br>`ui/ErrorState.tsx` | Error message with a retry action, for failed loads. | Account detail, Companies / home / items | ✓ | — | 0 |  | ☐ |
| 11 | **FilterDropdown**<br>`ui/FilterDropdown.tsx` | Pill dropdown with a list of options (iOS menu-style spring). | Companies / home / items, Tasks | ✓ | — | 4 |  | ☐ |
| 12 | **Icon**<br>`ui/Icon.tsx` | Material Symbols wrapper (fill, size, weight, grade). | 27 files (nearly everywhere) | ✓ | ✓ | 0 | Used in 26 files. | ☐ |
| 13 | **KebabMenu**<br>`ui/KebabMenu.tsx` | Overflow menu with an optional destructive item. | Account detail | ✓ | — | 2 |  | ☐ |
| 14 | **MenuIcon**<br>`ui/MenuIcon.tsx` | Two-bar menu glyph that opens the drawer. | Companies / home / items, design-system page | ✓ | ✓ | 0 |  | ☐ |
| 15 | **NoteSheet**<br>`ui/NoteSheet.tsx` | Bottom sheet to add an optional note after completing an item. | Account detail, Companies / home / items, Interaction detail, Tasks | ✓ | — | 2 |  | ☐ |
| 16 | **ScrollAwareTopBar**<br>`ui/ScrollAwareTopBar.tsx` | Floating back bar: glass circle once scrolled, right-hand slot hides on scroll. | Action item, Profile, Review | ✓ | — | 2 |  | ☐ |
| 17 | **Skeleton**<br>`ui/Skeleton.tsx` | Shimmer loading placeholders (single bone and composed skeletons). | Account detail, Companies / home / items | ✓ | — | 0 |  | ☐ |
| 18 | **VisitedFilterDropdown**<br>`ui/VisitedFilterDropdown.tsx` | "Last visited" filter with presets and a custom date range. | Companies / home / items, SortMenu | ✓ | — | 6 | Used inside SortMenu and directly on the list. | ☑ Library |

## Feature (8)

_Built for one flow. These become Flutter feature widgets, not shared library components._

| # | Component | What it is | Used by | Handoff comment | In registry | Hard-coded colors | Flag / question | Your call |
|---|---|---|---|---|---|---|---|---|
| 19 | **AccountPickerSheet**<br>`accounts/AccountPickerSheet.tsx` | Sheet to choose which account a capture belongs to. | CaptureWidget | ✓ | — | 1 | Only used by CaptureWidget. | ☐ |
| 20 | **AddActionItemSheet**<br>`accounts/AddActionItemSheet.tsx` | Create-action-item sheet (title plus MiniCalendar). | Account detail, Interaction detail | **missing** | — | 1 | No handoff comment. | ☐ |
| 21 | **ConvertToAccountSheet**<br>`accounts/ConvertToAccountSheet.tsx` | Multi-step sheet to convert a lead to an account, with an optional deal. | Account detail | ✓ | — | 3 |  | ☐ |
| 22 | **CreateAccountSheet**<br>`accounts/CreateAccountSheet.tsx` | "Add new account" form sheet. | Companies / home / items | ✓ | — | 3 | Replaced on `playground/add-company-test` by a one-field CreateEntrySheet. | ☐ |
| 23 | **CreateLeadSheet**<br>`accounts/CreateLeadSheet.tsx` | "Add new lead" form sheet with duplicate detection. | Companies / home / items | ✓ | — | 9 | Replaced on `playground/add-company-test` by CreateEntrySheet. | ☐ |
| 24 | **AIReviewOverlay**<br>`capture/AIReviewOverlay.tsx` | Post-visit "Here's the read" screen: AI-extracted CRM fields, edit by voice or text. | CaptureWidget | ✓ | — | 10 | Largest component (about 600 lines). Reads CaptureContext. | ☐ |
| 25 | **CaptureWidget**<br>`capture/CaptureWidget.tsx` | Persistent capture bar: recording, finishing and ready states, with account switching. | mobile layout | **missing** | — | 9 | No handoff comment. Many hard-coded colors (animated blobs). | ☐ |
| 26 | **FeedbackWidget**<br>`ui/FeedbackWidget.tsx` | Home feedback card (3 full-width options) plus the feedback drawer (Bug / Idea / Other). Exports FeedbackEntryCard and FeedbackForm. | Companies / home / items, design-system page | ✓ | ✓ | 4 | Brought in from `playground/add-company-test` 2026-10-28 and moved onto the shared Drawer; raw rgba tints replaced with token mixes. Has its own area on /design-system. | ☐ |

## Furniture (11)

_Prototype scaffolding. Never converted to Flutter._

| # | Component | What it is | Used by | Handoff comment | In registry | Hard-coded colors | Flag / question | Your call |
|---|---|---|---|---|---|---|---|---|
| 27 | **FakeCallOverlay**<br>`capture/FakeCallOverlay.tsx` | Prototype-only incoming-call simulation. | mobile layout | **missing** | — | 22 |  | ☐ |
| 28 | **DecisionWidget**<br>`decisions/DecisionWidget.tsx` | Supabase-backed decision recorder used on the story pages. | story-1, story-2, story-3, story-4 | ✓ | — | 6 | Review tool, not product UI. | ☐ |
| 29 | **BottomNav**<br>`layout/BottomNav.tsx` | Floating glass pill navigation bar (66px). | StaticBottomNav, design-system page | ✓ | ✓ | 2 | Decided: not part of the product. Still has a registry entry and appears on the design-system page. | ☑ Furniture |
| 30 | **DemoReset**<br>`layout/DemoReset.tsx` | Resets demo state for walkthroughs. | mobile layout | **missing** | — | 0 |  | ☐ |
| 31 | **DevModeOverlay**<br>`layout/DevModeOverlay.tsx` | Hover inspector that shows fill, text color, radius, font and spacing. | PhoneFrame | ✓ | — | 39 |  | ☐ |
| 32 | **DevPanel**<br>`layout/DevPanel.tsx` | Right-hand playground sidebar: screen jump, device size, demo reset. | PhoneFrame | **missing** | — | 2 |  | ☐ |
| 33 | **MobileKeyboard**<br>`layout/MobileKeyboard.tsx` | Simulated iOS keyboard that slides up when a field is focused. | PhoneFrame | ✓ | — | 5 |  | ☐ |
| 34 | **PageTransition**<br>`layout/PageTransition.tsx` | Web route slide transition. | mobile layout | ✓ | — | 0 | Flutter's Navigator handles this natively. | ☐ |
| 35 | **PhoneFrame**<br>`layout/PhoneFrame.tsx` | Desktop phone-frame wrapper around the app. | mobile layout | ✓ | — | 2 | Web-only. Remove in production. | ☐ |
| 36 | **PlaygroundNav**<br>`layout/PlaygroundNav.tsx` | Left sidebar listing playgrounds and git branches. | PhoneFrame | **missing** | — | 8 |  | ☐ |
| 37 | **StaticBottomNav**<br>`layout/StaticBottomNav.tsx` | Placement wrapper that anchors BottomNav outside the page transition. | mobile layout | **missing** | — | 0 | The real component is BottomNav. | ☐ |
| 38 | **Drawer**<br>`ui/Drawer.tsx` | The one bottom drawer: scrim, dark-primary panel, handle, motion, plus DrawerBody and DrawerHeader. | NoteSheet, AddActionItemSheet, CreateLeadSheet, CreateAccountSheet, ConvertToAccountSheet, AccountPickerSheet, ActionItemDrawer, design-system page | ✓ | ✓ | 1 | New 2026-10-28. The six sheets now share its chrome (fill unified to dark-primary, scrim on `color.alpha.scrim`). | ☐ |
| 39 | **ActionItemDrawer**<br>`accounts/ActionItemDrawer.tsx` | View and edit an action item in a drawer; Mark complete, edit fields, delete with confirmation. Replaces the old detail page. | Every ActionItemList row (home, account, interaction, full-page lists) | ✓ | ✓ | 5 | New 2026-10-28. Has its own area on /design-system with every state (view ×3, edit ×3, delete dialog) rendered from the real bodies. | ☐ |
| 40 | **ThinkingDots**<br>`ui/ThinkingDots.tsx` | In-progress indicator (listening bars) that replaces the spinning circle. | Button, design-system page | ✓ | ✓ | 0 | New 2026-10-28. Existing spinners (processing banner, "Preparing note" card, story mocks) not migrated yet. | ☐ |
| 41 | **Button**<br>`ui/Button.tsx` | Filled / tonal / outlined / text buttons with a loading state. | design-system page | ✓ | ✓ | 0 | New 2026-10-28. Screens still use inline button styles; migrate as touched. | ☐ |
| 42 | **Tabs**<br>`ui/Tabs.tsx` | Tab bar with underline (default) and segmented (sub-variant) styles. | Account detail, design-system page | ✓ | ✓ | 1 | New 2026-10-28, extracted from the account screen's inline tabs. | ☐ |
| 43 | **ActivityCard**<br>`accounts/ActivityCard.tsx` | Activity tab row: title, summary, meta (relative date · duration or From Salesforce · creator). Halosight and CRM variants. | Account detail, design-system page | ✓ | ✓ | 1 | New 2026-10-28, extracted from the inline boxed card. | ☐ |
| 44 | **Menu**<br>`ui/Menu.tsx` | The popup panel behind every dropdown. Variants: icon, check (right-aligned), icon + check. | SortMenu, FilterDropdown, KebabMenu, interaction-type picker | ✓ | ✓ | 4 | New 2026-10-28. Replaces four hand-built panels. Panel is translucent dark-secondary (88%, blurred) with a white-18 stroke at 80%. | ☑ Library |
| 45 | **ChatDrawer**<br>`chat/ChatDrawer.tsx` | The account chat drawer (typing + simulated voice). Composes the parts below. | Account screen, Ask in the more-options menu | ✓ | ✓ | 12 | New 2026-10-28. Canned replies. Area on /design-system with every state. | ☐ |
| 46 | **ChatInput**<br>`chat/ChatInput.tsx` | Pill input; trailing button is voice mode or Send. | ChatDrawer | ✓ | ✓ | 5 | New. | ☐ |
| 47 | **ChatMessage**<br>`chat/ChatMessage.tsx` | User bubble, assistant text + actions, draft block, thinking row. | ChatMessageList | ✓ | ✓ | 6 | New. | ☐ |
| 48 | **ChatVoiceDock**<br>`chat/ChatVoiceDock.tsx` | Voice-mode dock: listening / thinking / speaking. | ChatDrawer | ✓ | ✓ | 7 | New. Light mode unchecked. | ☐ |
| 49 | **ChatHistoryMenu**<br>`chat/ChatHistoryMenu.tsx` | Search + pinned/recent chat list popover. | ChatDrawer | ✓ | ✓ | 6 | New. Uses Menu chrome. | ☐ |
| 50 | **ChatHeader / ChatEmptyState / ChatMessageList**<br>`chat/…` | Header icons, greeting + suggestion chips, scrolling message list. | ChatDrawer | ✓ | ✓ | 5 | New; small parts of the chat. | ☐ |
| 51 | **ThumbsDownIcon**<br>`ui/ThumbsDownIcon.tsx` | Thumbs-down glyph without the wrist cuff. | InsightCard, ChatMessage | — | — | 1 | Extracted from InsightCard. | ☐ |
| 52 | **InsightCardLoader**<br>`accounts/InsightCardLoader.tsx` | Sparkle + cycling status lines shown in the Insight Card while the summary loads. | InsightCard (`loading`) | ✓ | ✓ | 2 | New 2026-10-28. Not yet wired to the real account load. | ☐ |

## Appendix: tokens used, by component

Read from the code (`var(--…)` references), mapped to design-system token paths. `*` = prototype CSS name differs from the rule. `(… no token)` = a name with no token in the design-system repo. `†` = the code references a CSS variable the prototype never defines, so it renders unstyled.

### Library

- **AccountListItem**: `color.brand.teal`, `color.dark.primary`, `color.dark.tertiary`, `color.semantic.warning *`, `color.text.disabled`, `color.text.muted`, `color.text.primary`, `radius.lg`
- **AccountTypeIcon**: `color.text.disabled`, `color.text.muted`
- **ActionItemList**: `color.alpha.white-10`, `color.brand.coral-light`, `color.neonindigo.base`, `color.semantic.success`, `color.text.disabled`, `color.text.inverse`, `color.text.muted`, `color.text.primary`, `radius.full`
- **CountBadge**: `color.neonindigo.base`, `color.neonindigo.light`, `color.semantic.error *`, `color.semantic.error-light *`, `radius.full`
- **InsightCard**: `color.alpha.white-10`, `color.background`, `color.brand.coral`, `color.brand.teal`, `color.dark.primary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.disabled`, `color.text.muted`, `color.text.secondary`
- **MiniCalendar**: `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.disabled`, `color.text.primary`, `radius.full`, `radius.md`
- **SortMenu**: `color.dark.secondary`, `color.dark.tertiary`, `color.text.muted`, `color.text.primary`, `radius.xl`
- **CompletionToast**: `color.brand.teal`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.muted`, `color.text.primary`, `radius.xl`
- **CustomIcons**: _none (uses currentColor / inherited)_
- **ErrorState**: `color.brand.coral`, `color.dark.secondary`, `color.dark.tertiary`, `color.text.muted`, `color.text.primary`, `radius.full`
- **FilterDropdown**: `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.xl`
- **Icon**: _none (uses currentColor / inherited)_
- **KebabMenu**: `color.brand.coral`, `color.dark.secondary`, `color.dark.tertiary`, `color.text.muted`, `color.text.primary`, `radius.xl`
- **MenuIcon**: `color.text.muted`
- **NoteSheet**: `color.brand.teal`, `color.dark.secondary`, `color.dark.tertiary`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.lg`, `radius.xl`
- **ScrollAwareTopBar**: `color.text.primary`
- **Skeleton**: `color.background`, `color.dark.tertiary`
- **VisitedFilterDropdown**: `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.md`, `radius.xl`

### Feature

- **AccountPickerSheet**: `color.dark.primary`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.disabled`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.xl`
- **AddActionItemSheet**: `color.background`, `color.brand.coral`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.neonindigo.dark`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.md`, `radius.xl`
- **ConvertToAccountSheet**: `color.background`, `color.brand.teal`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.neonindigo.dark`, `color.text.disabled`, `color.text.muted`, `color.text.primary`, `color.text.secondary`, `radius.full`, `radius.md`, `radius.sm`, `radius.xl`
- **CreateAccountSheet**: `color.alpha.neonindigo-10`, `color.background`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.text.disabled`, `color.text.primary`, `radius.full`, `radius.lg`, `radius.sm`, `radius.xl`
- **CreateLeadSheet**: `color.alpha.neonindigo-10`, `color.background`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.semantic.warning *`, `color.text.disabled`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.lg`, `radius.sm`, `radius.xl`
- **AIReviewOverlay**: `color.alpha.neonindigo-10`, `color.background`, `color.dark.secondary`, `color.neonindigo.base`, `color.semantic.success †`, `color.text.disabled`, `color.text.muted`, `color.text.primary`, `radius.lg`
- **CaptureWidget**: `color.brand.coral`, `color.dark.primary`, `color.neonindigo.base`, `color.text.muted`, `color.text.primary`, `color.text.secondary`
- **FeedbackWidget**: `color.alpha.white-10`, `color.background`, `color.brand.coral`, `color.brand.teal`, `color.dark.primary`, `color.dark.secondary`, `color.dark.tertiary`, `color.neonindigo.base`, `color.semantic.success`, `color.text.disabled`, `color.text.muted`, `color.text.primary`, `radius.full`, `radius.md`

### Names used in components with no design-system token

_None: every `var(--…)` the components use maps to a design-system token (some under a different name, marked `*`)._
