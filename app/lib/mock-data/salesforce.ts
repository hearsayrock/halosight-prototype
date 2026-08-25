/**
 * Mock data for the Salesforce quick import feature.
 * All dates are fixed to match the spec's "Aug 24" import reference point.
 */

export const mockConnection = {
  connected: true,
  salesforceUserId: "sf-user-001",
  lastImportAt: new Date("2026-08-24"),
  lastRecordCursor: "cursor-abc123",
};

export const mockAnalysis = {
  windowStart: new Date("2026-06-25"),
  accounts: [
    { id: "sf-acc-1", name: "Jack's Tire & Oil", activityCount: 12, sfAccountId: "sf-acc-1", alreadyInHalosight: false, visitedDaysAgo: 14 },
    { id: "sf-acc-2", name: "Midtown Chevrolet", activityCount: 8, sfAccountId: "sf-acc-2", alreadyInHalosight: true, visitedDaysAgo: 3 },
    { id: "sf-acc-3", name: "Summit Auto Group", activityCount: 7, sfAccountId: "sf-acc-3", alreadyInHalosight: false, visitedDaysAgo: 21 },
    { id: "sf-acc-4", name: "Eastside Body Works", activityCount: 6, sfAccountId: "sf-acc-4", alreadyInHalosight: false, visitedDaysAgo: 5 },
    { id: "sf-acc-5", name: "Route 9 Motors", activityCount: 5, sfAccountId: "sf-acc-5", alreadyInHalosight: false, visitedDaysAgo: 30 },
    { id: "sf-acc-6", name: "Lakewood Service Center", activityCount: 5, sfAccountId: "sf-acc-6", alreadyInHalosight: false, visitedDaysAgo: 7 },
    { id: "sf-acc-7", name: "Valley Ford", activityCount: 4, sfAccountId: "sf-acc-7", alreadyInHalosight: false, visitedDaysAgo: 45 },
    { id: "sf-acc-8", name: "Northgate Trucks", activityCount: 4, sfAccountId: "sf-acc-8", alreadyInHalosight: false, visitedDaysAgo: 60 },
    { id: "sf-acc-9", name: "Precision Auto Parts", activityCount: 4, sfAccountId: "sf-acc-9", alreadyInHalosight: false, visitedDaysAgo: 12 },
    { id: "sf-acc-10", name: "Harbor Motorsports", activityCount: 3, sfAccountId: "sf-acc-10", alreadyInHalosight: false, visitedDaysAgo: 8 },
    { id: "sf-acc-11", name: "Oak Park Dealership", activityCount: 3, sfAccountId: "sf-acc-11", alreadyInHalosight: false, visitedDaysAgo: 18 },
    { id: "sf-acc-12", name: "Westside Fleet", activityCount: 3, sfAccountId: "sf-acc-12", alreadyInHalosight: false, visitedDaysAgo: 35 },
    { id: "sf-acc-13", name: "Clearview Auto", activityCount: 2, sfAccountId: "sf-acc-13", alreadyInHalosight: false, visitedDaysAgo: 50 },
    { id: "sf-acc-14", name: "Metro Honda", activityCount: 2, sfAccountId: "sf-acc-14", alreadyInHalosight: false, visitedDaysAgo: 25 },
    { id: "sf-acc-15", name: "Ridgeline Kia", activityCount: 2, sfAccountId: "sf-acc-15", alreadyInHalosight: false, visitedDaysAgo: 40 },
    { id: "sf-acc-16", name: "Sunrise Toyota", activityCount: 2, sfAccountId: "sf-acc-16", alreadyInHalosight: false, visitedDaysAgo: 55 },
    { id: "sf-acc-17", name: "Canyon Chrysler", activityCount: 1, sfAccountId: "sf-acc-17", alreadyInHalosight: false, visitedDaysAgo: 10 },
    { id: "sf-acc-18", name: "Pinehurst Subaru", activityCount: 1, sfAccountId: "sf-acc-18", alreadyInHalosight: false, visitedDaysAgo: 28 },
  ],
  activityTypes: [
    { name: "Task", count: 94, recommended: "note" as const, confident: true },
    { name: "Call", count: 29, recommended: "task" as const, confident: true },
    { name: "Site Audit", count: 3, recommended: null, confident: false },
    { name: "Route Check", count: 1, recommended: null, confident: false },
  ],
  unlinkedCount: 4,
  alreadyImportedCount: 31,
};

export const mockImportHistory = [
  {
    id: "run-1",
    importedAt: new Date("2026-08-24"),
    companiesAdded: 18,
    notesCreated: 94,
    actionItemsCreated: 29,
  },
];

export const mockSavedRules: Record<string, "note" | "task" | "skip"> = {
  Task: "note",
  Call: "task",
};
