/**
 * Mock data for the Home / Today screen.
 * Tasks: open to-dos sorted by priority.
 * Activities: recently logged meetings/calls/visits.
 */

export interface HomeTask {
  id: string;
  /** Links to /accounts/[accountId]/action-items/[itemId] */
  itemId: string;
  title: string;
  dueDate: Date | null;   // null = due today
  accountName: string;
  accountId: string;
  completed: boolean;
  /** Name of the visit/call this item was generated from */
  originActivity?: string;
}

export interface HomeActivity {
  id: string;
  /** Links to /accounts/[accountId]/activity/[activityId] */
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
    accountName: "Acme Corporation",
    accountId: "walmart-corp",
    completed: false,
    originActivity: "Quarterly Review",
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
  },
  {
    id: "task-6",
    itemId: "wm-t2",
    title: "Review Q3 forecast with manager",
    dueDate: daysFromNow(7),
    accountName: "Acme Corporation",
    accountId: "walmart-corp",
    completed: false,
    originActivity: "Quarterly Review",
  },
];

export const mockActivities: HomeActivity[] = [
  {
    id: "act-home-1",
    activityId: "ja-1",
    title: "Discovery Call",
    description: "Initial discovery with Jack's Tire and Oil to understand their platform upgrade needs and timeline.",
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    date: at(0, 15, 46),
    durationMinutes: 35,
  },
  {
    id: "act-home-2",
    activityId: "wm-1",
    title: "Market Research",
    description: "Reviewed competitor platforms to identify feature gaps and opportunities for differentiation.",
    accountName: "Acme Corporation",
    accountId: "walmart-corp",
    date: at(1, 23, 0),
    durationMinutes: 80,
  },
  {
    id: "act-home-3",
    activityId: "ja-4",
    title: "Client Presentation",
    description: "Presented initial project proposal and received feedback from Jack's Tire and Oil stakeholders.",
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    date: at(1, 13, 12),
    durationMinutes: 2,
  },
  {
    id: "act-home-4",
    activityId: "ja-3",
    title: "Market Research",
    description: "Initial discovery with Jack's Tire and Oil to understand their platform upgrade needs and timeline.",
    accountName: "Jack's Tire & Oil",
    accountId: "jacks-tire-elko",
    date: at(1, 10, 5),
    durationMinutes: 47,
  },
  {
    id: "act-home-5",
    activityId: "pf-1",
    title: "Account Check-In",
    description: "Routine quarterly check-in with ProFleet Maintenance. Discussed fleet growth plans and service satisfaction.",
    accountName: "ProFleet Maintenance",
    accountId: "profleet-corp",
    date: at(2, 9, 30),
    durationMinutes: 22,
  },
  {
    id: "act-home-6",
    activityId: "pg-1",
    title: "Contract Review",
    description: "Walked through updated service contract terms with the Reladyne ops team. Minor revisions requested.",
    accountName: "Reladyne",
    accountId: "profleet-glendale-2",
    date: at(2, 14, 15),
    durationMinutes: 55,
  },
  {
    id: "act-home-7",
    activityId: "rb-1",
    title: "Upsell Conversation",
    description: "Introduced premium tier options to Riverbend Collision. Strong interest in expanded coverage package.",
    accountName: "Riverbend Collision",
    accountId: "riverbend-collision",
    date: at(3, 11, 0),
    durationMinutes: 18,
  },
  {
    id: "act-home-8",
    activityId: "pf-flagstaff-1",
    title: "On-site Visit",
    description: "Visited ProFleet Flagstaff location. Toured facility, met new ops manager, discussed Q3 service needs.",
    accountName: "ProFleet Maintenance",
    accountId: "profleet-flagstaff",
    date: at(4, 10, 45),
    durationMinutes: 64,
  },
  {
    id: "act-home-9",
    activityId: "it-2",
    title: "Follow-Up Call",
    description: "Called Innovative Tech re: pending proposal. Budget approved internally — ready to move to contract stage.",
    accountName: "Innovative Tech",
    accountId: "innovative-tech-tucson",
    date: at(5, 16, 20),
    durationMinutes: 12,
  },
  {
    id: "act-home-10",
    activityId: "wm-2",
    title: "Strategy Session",
    description: "Internal session to align on territory priorities, discuss pipeline health, and plan next 30-day outreach.",
    accountName: "Acme Corporation",
    accountId: "walmart-corp",
    date: at(6, 9, 0),
    durationMinutes: 90,
  },
];
