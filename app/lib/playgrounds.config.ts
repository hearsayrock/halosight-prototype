/**
 * Playground registry — single source of truth for all prototype explorations.
 *
 * WORKFLOW
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add an entry below (on main, before branching).
 * 2. Push: git checkout -b playground/<id>
 * 3. Vercel auto-deploys a preview URL — paste it into `url` and commit.
 * 4. Build whatever you want on that branch.
 * 5. When it's ready: merge to main, set status → "shipped", remove the entry
 *    (or keep it as a historical record — your call).
 *
 * CURRENT_APP_URL
 * ─────────────────────────────────────────────────────────────────────────────
 * Update this whenever the main deployment URL changes.
 */

export type PlaygroundStatus = "exploring" | "review" | "shipped";

export interface PlaygroundRoute {
  label: string;
  path: string;
}

export interface Playground {
  /** Matches the git branch name exactly, e.g. "playground/map-view" */
  id: string;
  /** Short display name shown in the nav */
  name: string;
  /** One sentence describing what's being explored */
  description: string;
  /** Vercel preview URL for this branch */
  url: string;
  /** Who started it */
  author: string;
  status: PlaygroundStatus;
  /** ISO date string, e.g. "2026-06-09" */
  startedAt: string;
  /**
   * Optional quick-nav overrides for the right DevPanel.
   * If omitted, the default route list is used.
   * Add routes here to highlight the screens this playground touches.
   */
  routes?: PlaygroundRoute[];
}

// ── Main deployment URL ───────────────────────────────────────────────────────

export const CURRENT_APP_URL = "https://halosight-prototype.vercel.app";

// ── Active playgrounds ────────────────────────────────────────────────────────
// Listed in reverse-chronological order (newest first).

export const PLAYGROUNDS: Playground[] = [
  {
    id: "playground/july-13-prospecting-goals",
    name: "July 13 Prospecting Goals",
    description: "Explore prospecting goals and visit tracking features for the July 13 demo.",
    url: "https://halosight-prototype-git-playg-60b352-nate-natesdesigns-projects.vercel.app",
    author: "Nate",
    status: "exploring",
    startedAt: "2026-07-13",
  },
  {
    id: "board-meeeting-ai-brainstorm",
    name: "Board Meeting AI",
    description: "Explore adding an AI chat agent.",
    url: "https://halosight-prototype-git-board-b83846-nate-natesdesigns-projects.vercel.app",
    author: "Nate",
    status: "exploring",
    startedAt: "2026-06-16",
  },
  {
    id: "playground/onboarding-flow",
    name: "Onboarding Flow",
    description: "A 3-screen welcome slideshow walking new users through the app's most valuable features.",
    url: "https://halosight-prototype-git-playg-2734fa-nate-natesdesigns-projects.vercel.app",
    author: "Nate",
    status: "exploring",
    startedAt: "2026-06-09",
    routes: [
      { label: "Onboarding", path: "/onboarding" },
    ],
  },
  // Example entry — copy, fill in, and uncomment when starting a new playground:
  //
  // {
  //   id: "playground/map-view",
  //   name: "Map View",
  //   description: "Exploring a route map for the accounts tab.",
  //   url: "https://halosight-prototype-git-playground-map-view-xxx.vercel.app",
  //   author: "Nate",
  //   status: "exploring",
  //   startedAt: "2026-06-09",
  //   routes: [
  //     { label: "Accounts (map)", path: "/accounts?view=map" },
  //   ],
  // },
];
