/**
 * Mock data for the Home / Today screen.
 * Tasks: open to-dos sorted by priority.
 * Activities: recently logged meetings/calls/visits.
 */

import type { RecentActivity } from "@/lib/types";

export interface HomeTask {
  id: string;
  /** Links to /relationships/[accountId]/action-items/[itemId] */
  itemId: string;
  title: string;
  dueDate: Date | null;   // null = due today
  accountName: string;
  accountId: string;
  completed: boolean;
  /** Name of the visit/call this item was generated from */
  originActivity?: string;
  /** Activity id — links to /relationships/[accountId]/activity/[originActivityId] */
  originActivityId?: string;
}

export interface HomeActivity {
  id: string;
  /** Links to /relationships/[accountId]/activity/[activityId] */
  activityId: string;
  title: string;
  description: string;
  accountName: string;
  accountId: string;
  date: Date;
  durationMinutes: number;
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const daysFromNow = (n: number) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000);
const at = (daysAgo: number, h: number, m: number) => {
  const d = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  d.setHours(h, m, 0, 0);
  return d;
};

export const mockTasks: HomeTask[] = [
  {
    id: "task-1",
    itemId: "wm-t1",
    title: "Send Q2 pricing update",
    dueDate: null,
    accountName: "Acme Co",
    accountId: "walmart-corp",
    completed: false,
    originActivity: "Quarterly Review",
    originActivityId: "wm-1",
  },
  {
    id: "task-2",
    itemId: "pg-t1",
    title: "Send pricing recap",
    dueDate: null,
    accountName: "Reladyne",
    accountId: "profleet-glendale-2",
    completed: false,
    originActivity: "Fleet Expansion",
    originActivityId: "pg-1",
  },
  {
    id: "task-3",
    itemId: "it-t3",
    title: "On-site training for new team",
    dueDate: daysFromNow(2),
    accountName: "Innovative Tech",
    accountId: "innovative-tech-tucson",
    completed: false,
    originActivity: "Vendor Review",
    originActivityId: "it-1",
  },
  {
    id: "task-4",
    itemId: "ja-t1",
    title: "Follow up on service contract renewal",
    dueDate: daysFromNow(3),
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    completed: false,
    originActivity: "Follow-Up Call",
    originActivityId: "ja-6",
  },
  {
    id: "task-5",
    itemId: "pf-t1",
    title: "Submit fleet expansion proposal",
    dueDate: daysFromNow(5),
    accountName: "ProFleet Maintenance",
    accountId: "profleet-corp",
    completed: false,
    originActivity: "Leadership Check-In",
    originActivityId: "pf-1",
  },
  {
    id: "task-6",
    itemId: "wm-t2",
    title: "Review Q3 forecast with manager",
    dueDate: daysFromNow(7),
    accountName: "Acme Co",
    accountId: "walmart-corp",
    completed: false,
    originActivity: "Quarterly Review",
    originActivityId: "wm-1",
  },
];

export const mockActivities: HomeActivity[] = [
  {
    id: "act-home-1",
    activityId: "ja-1",
    title: "Marcus outlined supplier pain points and confirmed openness to switching",
    description: "Initial discovery with Jack's Tire and Oil to understand their platform upgrade needs and timeline.",
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    date: at(0, 15, 46),
    durationMinutes: 35,
  },
  {
    id: "act-home-2",
    activityId: "wm-1",
    title: "Brake pad supply gaps discussed — Dave flagged expanded order potential for Q3",
    description: "Reviewed competitor platforms to identify feature gaps and opportunities for differentiation.",
    accountName: "Acme Co",
    accountId: "walmart-corp",
    date: at(1, 23, 0),
    durationMinutes: 80,
  },
  {
    id: "act-home-3",
    activityId: "ja-4",
    title: "Walked Marcus through the proposal — strong interest, a few questions on SLA terms",
    description: "Presented initial project proposal and received feedback from Jack's Tire and Oil stakeholders.",
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    date: at(1, 13, 12),
    durationMinutes: 2,
  },
  {
    id: "act-home-4",
    activityId: "ja-3",
    title: "Competitive pricing review — our turnaround time flagged as a key differentiator",
    description: "Initial discovery with Jack's Tire and Oil to understand their platform upgrade needs and timeline.",
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    date: at(1, 10, 5),
    durationMinutes: 47,
  },
  {
    id: "act-home-5",
    activityId: "pf-1",
    title: "Ops leadership confirmed Q3 fleet expansion budget — formal proposal requested by end of month",
    description: "Routine quarterly check-in with ProFleet Maintenance. Discussed fleet growth plans and service satisfaction.",
    accountName: "ProFleet Maintenance",
    accountId: "profleet-corp",
    date: at(2, 9, 30),
    durationMinutes: 22,
  },
  {
    id: "act-home-6",
    activityId: "pg-1",
    title: "Q3 fleet expansion budget confirmed — strong opportunity for an expanded contract",
    description: "Walked through updated service contract terms with the Reladyne ops team. Minor revisions requested.",
    accountName: "Reladyne",
    accountId: "profleet-glendale-2",
    date: at(2, 14, 15),
    durationMinutes: 55,
  },
  {
    id: "act-home-7",
    activityId: "rb-1",
    title: "Reconnected with Tom after a long gap — not ready to move but open to staying in touch",
    description: "Introduced premium tier options to Riverbend Collision. Strong interest in expanded coverage package.",
    accountName: "Riverbend Collision",
    accountId: "riverbend-collision",
    date: at(3, 11, 0),
    durationMinutes: 18,
  },
  {
    id: "act-home-8",
    activityId: "pf-flagstaff-1",
    title: "Toured the Flagstaff facility and met the new ops manager — Q3 service needs discussed",
    description: "Visited ProFleet Flagstaff location. Toured facility, met new ops manager, discussed Q3 service needs.",
    accountName: "ProFleet Maintenance",
    accountId: "profleet-flagstaff",
    date: at(4, 10, 45),
    durationMinutes: 64,
  },
  {
    id: "act-home-9",
    activityId: "it-2",
    title: "Mapped out current workflows and pain points with their existing parts solution",
    description: "Called Innovative Tech re: pending proposal. Budget approved internally — ready to move to contract stage.",
    accountName: "Innovative Tech",
    accountId: "innovative-tech-tucson",
    date: at(5, 16, 20),
    durationMinutes: 12,
  },
  {
    id: "act-home-10",
    activityId: "wm-2",
    title: "Checked in on service satisfaction — relationship in good standing, nothing new flagged",
    description: "Internal session to align on territory priorities, discuss pipeline health, and plan next 30-day outreach.",
    accountName: "Acme Co",
    accountId: "walmart-corp",
    date: at(6, 9, 0),
    durationMinutes: 90,
  },
];


// ── Engagements feed (side drawer) ───────────────────────────────────────────

type Seed = [daysAgo: number, hour: number, account: string, accountId: string | undefined, kind: "visit" | "call", title: string, unread?: string | true, activityId?: string];

// Newest first. Mix of read and unread; unread rows may carry a "Modified …" note.
const SEEDS: Seed[] = [
  [0, 15, "Reladyne", undefined, "call", "Check in with James", "Modified 1 action item"],
  [0, 11, "Acme Co", "walmart-corp", "visit", "Brake pad supply gaps discussed — Dave flagged expanded order potential", true, "wm-1"],
  [1, 14, "O'Reilly Auto Parts", undefined, "visit", "Figure out authentication issues"],
  [1, 10, "Reladyne", undefined, "call", "Pricing follow-up before renewal"],
  [2, 16, "Jack's Tire & Oil", "jacks-tire-elko", "visit", "Quarterly stock review at branch", "Modified 2 contacts, 1 opportunity", "ja-4"],
  [2, 9, "Milwaukee Tools", undefined, "call", "Check in with James"],
  [3, 15, "Western Governor's University", undefined, "visit", "Renewal and possible expansion"],
  [3, 11, "ProFleet Maintenance", "profleet-corp", "call", "Volume discount sheet walkthrough", "Modified 1 action item", "pf-1"],
  [4, 14, "Advance Auto Parts", undefined, "visit", "Walkthrough of new order portal"],
  [5, 10, "Innovative Tech", "innovative-tech-tucson", "visit", "Confirm delivery windows", undefined, "it-1"],
  [6, 13, "Acme Co", "walmart-corp", "call", "Left voicemail on open quote"],
  [7, 9, "Southwestern Consolidated", "southwestern-consolidated", "visit", "Intro meeting with new buyer"],
  [8, 15, "Reladyne", undefined, "call", "Pricing follow-up before renewal"],
  [9, 11, "Desert Star Automotive", "desert-star-auto", "visit", "Shelf-life and returns policy", "Modified 1 contact"],
  [10, 14, "Mountain West Fleet Supply", "mountain-west-fleet", "call", "Reorder timing for winter fleet"],
  [11, 10, "O'Reilly Auto Parts", undefined, "visit", "Authentication issues, part two"],
  [12, 16, "Glendale Truck & Trailer", "glendale-truck-trailer", "visit", "Trailer brake line pricing", undefined, "pg-1"],
  [13, 9, "Jack's Tire & Oil", "jacks-tire-elko", "call", "Budget confirmation", "Modified 1 opportunity", "ja-6"],
  [14, 13, "Sunbelt Fleet Solutions", "sunbelt-fleet-solutions", "visit", "Onboarding checklist review"],
  [15, 10, "Milwaukee Tools", undefined, "visit", "Demo of the new cordless line"],
  [16, 15, "Saddleback Fleet Services", "saddleback-fleet", "call", "Intro call with fleet manager"],
  [17, 11, "Riverbend Collision", "riverbend-collision", "visit", "Paint supplier switch"],
  [19, 14, "Advance Auto Parts", undefined, "call", "Order portal access"],
  [20, 9, "Western Governor's University", undefined, "visit", "Campus fleet audit"],
  [22, 13, "Acme Co", "walmart-corp", "visit", "Quarterly review prep", undefined, "wm-2"],
  [24, 10, "Reladyne", undefined, "visit", "Contract renewal terms"],
  [26, 15, "ProFleet Maintenance", "profleet-corp", "call", "Invoice discrepancy", undefined, "pf-2"],
  [28, 11, "Innovative Tech", "innovative-tech-tucson", "call", "Pilot kickoff scheduling", undefined, "it-2"],
  [31, 14, "O'Reilly Auto Parts", undefined, "visit", "Territory overlap with the Phoenix branch"],
  [34, 10, "Milwaukee Tools", undefined, "call", "Warranty claim follow-up"],
];

export const mockRecentActivities: RecentActivity[] = SEEDS.map(([daysAgo, hour, accountName, accountId, type, title, unread, activityId], i) => ({
  id: `eng-${i + 1}`,
  accountId,
  accountName,
  activityId,
  type,
  title,
  date: at(daysAgo, hour, 0),
  unread: unread !== undefined,
  changeNote: typeof unread === "string" ? unread : undefined,
}));
