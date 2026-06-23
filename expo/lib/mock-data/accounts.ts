import type { Account, AccountDetail } from '../types';

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

export const mockAccounts: Account[] = [
  {
    id: 'walmart-corp',
    name: 'Walmart',
    type: 'corporate',
    crmAccountType: 'distributor',
    assignedInitial: 'J',
    taskCount: 0,
    city: 'Bentonville',
    state: 'AR',
    distanceMiles: 56.7,
    lastVisited: daysAgo(3),
    childCount: 14,
    crmId: 'SF-001',
    healthScore: 82,
  },
  {
    id: 'walmart-cedar-city',
    name: 'Branch of Walmart',
    type: 'branch',
    crmAccountType: 'shipped-to',
    assignedInitial: 'J',
    taskCount: 5,
    city: 'Cedar City',
    state: 'UT',
    distanceMiles: 56.7,
    lastVisited: daysAgo(3),
    childCount: 7,
    parentId: 'walmart-corp',
    crmId: 'SF-002',
    healthScore: 78,
  },
  {
    id: 'jacks-tire-elko',
    name: "Jack's Tire & Oil",
    type: 'standalone',
    crmAccountType: 'sold-to',
    assignedInitial: 'M',
    taskCount: 2,
    city: 'Elko',
    state: 'NV',
    distanceMiles: 13.5,
    lastVisited: daysAgo(14),
    contactName: 'Marcus Webb',
    contactTitle: 'General Manager',
    crmId: 'SF-003',
    healthScore: 65,
  },
  {
    id: 'profleet-corp',
    name: 'ProFleet Maintenance',
    type: 'corporate',
    crmAccountType: 'distributor',
    assignedInitial: 'S',
    taskCount: 0,
    city: 'Phoenix',
    state: 'AZ',
    distanceMiles: 146,
    lastVisited: daysAgo(6),
    childCount: 14,
    crmId: 'SF-004',
    healthScore: 74,
  },
  {
    id: 'profleet-glendale-1',
    name: 'ProFleet Maintenance',
    type: 'branch',
    crmAccountType: 'sold-to',
    assignedInitial: 'S',
    taskCount: 0,
    city: 'Glendale',
    state: 'AZ',
    distanceMiles: 0.75,
    lastVisited: daysAgo(90),
    parentId: 'profleet-corp',
    crmId: 'SF-005',
    healthScore: 55,
  },
  {
    id: 'profleet-flagstaff',
    name: 'ProFleet Maintenance Store',
    type: 'branch',
    crmAccountType: 'shipped-to',
    assignedInitial: 'A',
    taskCount: 3,
    city: 'Flagstaff',
    state: 'AZ',
    distanceMiles: 845,
    lastVisited: daysAgo(21),
    parentId: 'profleet-corp',
    crmId: 'SF-006',
    healthScore: 70,
  },
  {
    id: 'profleet-glendale-2',
    name: 'ProFleet Maintenance Store',
    type: 'branch',
    crmAccountType: 'sold-to',
    assignedInitial: 'S',
    taskCount: 1,
    city: 'Glendale',
    state: 'AZ',
    distanceMiles: 3.5,
    lastVisited: new Date(),
    parentId: 'profleet-corp',
    crmId: 'SF-007',
    healthScore: 88,
  },
  {
    id: 'profleet-tucson',
    name: 'ProFleet Maintenance Store',
    type: 'branch',
    crmAccountType: 'shipped-to',
    assignedInitial: 'A',
    taskCount: 0,
    city: 'Tucson',
    state: 'AZ',
    distanceMiles: 56.7,
    lastVisited: daysAgo(14),
    parentId: 'profleet-corp',
    crmId: 'SF-008',
    healthScore: 72,
  },
  {
    id: 'innovative-tech-tucson',
    name: 'Innovative Tech',
    type: 'standalone',
    crmAccountType: 'prospect',
    assignedInitial: 'M',
    taskCount: 7,
    city: 'Tucson',
    state: 'AZ',
    distanceMiles: 75.2,
    lastVisited: daysAgo(30),
    contactName: 'Sandra Perez',
    contactTitle: 'Operations Director',
    crmId: 'SF-009',
    healthScore: 60,
  },
  {
    id: 'riverbend-collision',
    name: 'Riverbend Collision',
    type: 'standalone',
    crmAccountType: 'sold-to',
    assignedInitial: 'J',
    taskCount: 0,
    city: 'St George',
    state: 'UT',
    distanceMiles: 241,
    lastVisited: daysAgo(365),
    contactName: 'Tom Hadley',
    contactTitle: 'Owner',
    crmId: 'SF-010',
    healthScore: 30,
  },
];

const future = (month: number, day: number) => new Date(2026, month - 1, day);
const at = (daysBack: number, h: number, m: number) => {
  const d = daysAgo(daysBack);
  d.setHours(h, m, 0, 0);
  return d;
};

export const mockAccountDetails: Record<string, AccountDetail> = {
  'jacks-tire-elko': {
    ...mockAccounts[2],
    relatedAccountCount: 3,
    lastVisitSummary:
      "Visited 2 weeks ago. Marcus walked me through a few recurring issues with their current supplier — lead times and inconsistent part quality. They're open to switching if we can demonstrate reliability.",
    ideasForThisTime: [
      'Ask about upcoming seasonal demand',
      'Explore additional product/service needs',
      'Identify front-line decision makers',
      'Confirm any pain points before they grow',
    ],
    actionItems: [
      { id: 'ja-t1', title: 'Send Q2 pricing update', dueDate: future(6, 5), status: 'open' },
      { id: 'ja-t2', title: 'On-site training for new team', dueDate: null, status: 'open' },
      { id: 'ja-t3', title: 'Provide weekly updates', dueDate: future(6, 20), status: 'open' },
      { id: 'ja-t4', title: 'Investigate account', dueDate: future(6, 12), status: 'open' },
      { id: 'ja-t5', title: 'Send intro deck', dueDate: daysAgo(3), status: 'done' },
      { id: 'ja-t6', title: 'Confirm meeting with Marcus', dueDate: daysAgo(7), status: 'done' },
    ],
    recentActivity: [
      {
        id: 'ja-1', accountId: 'jacks-tire-elko', date: at(9, 15, 46), type: 'call',
        title: 'Discovery Call',
        summary: 'Initial discovery with Jack\'s Tire and Oil to understand their platform upgrade needs and timeline.',
        durationMinutes: 35, hasTranscript: true, repName: 'Jordan Mills',
        aiSummary: {
          title: 'Marcus outlined supplier pain points and confirmed openness to switching vendors',
          tldr: 'Marcus walked through recurring issues with their current supplier — late deliveries and inconsistent part quality are causing real floor-level slowdowns.',
          keyPoints: [
            'Late deliveries from the current supplier are creating floor slowdowns.',
            'Part quality has been inconsistent, leading to returns and rework.',
            'Marcus confirmed budget is available with a decision timeline tied to Q3.',
            'He wants to see a concrete delivery SLA before moving forward.',
          ],
        },
      },
      { id: 'ja-2', accountId: 'jacks-tire-elko', date: at(4, 11, 0), type: 'visit', title: 'Market Research', summary: 'Reviewed competitor platforms to identify feature gaps and opportunities for differentiation.', durationMinutes: 80, hasTranscript: false, repName: 'Jordan Mills' },
      { id: 'ja-3', accountId: 'jacks-tire-elko', date: at(2, 14, 0), type: 'visit', title: 'Client Presentation', summary: 'Presented initial project proposal and received feedback from stakeholders.', durationMinutes: 45, hasTranscript: true, repName: 'Jordan Mills' },
      { id: 'ja-4', accountId: 'jacks-tire-elko', date: at(1, 9, 30), type: 'call', title: 'Follow-Up Call', summary: 'Checked in on proposal status. Marcus confirmed internal budget approval. Ready to proceed.', durationMinutes: 18, hasTranscript: true, repName: 'Jordan Mills' },
    ],
  },
  'walmart-cedar-city': {
    ...mockAccounts[1],
    relatedAccountCount: 7,
    lastVisitSummary:
      'Visited 3 days ago. Spoke with the store ops lead about ongoing friction with their current parts supplier — late deliveries are causing floor slowdowns.',
    ideasForThisTime: [
      'Come with a concrete delivery SLA to address their lead time concern',
      'Ask about Q3 seasonal volume to size the opportunity',
      'Find out who else is involved in the vendor decision',
      'Mention the Cedar City distribution hub — proximity is a differentiator',
    ],
    actionItems: [
      { id: 'wc-t1', title: 'Send pricing recap', dueDate: future(6, 4), status: 'open' },
      { id: 'wc-t2', title: 'Follow up with procurement', dueDate: future(6, 8), status: 'open' },
      { id: 'wc-t3', title: 'Confirm delivery SLA in writing', dueDate: future(6, 15), status: 'open' },
      { id: 'wc-t4', title: 'Schedule Q3 planning call', dueDate: null, status: 'open' },
    ],
    recentActivity: [
      {
        id: 'wc-1', accountId: 'walmart-cedar-city', date: at(3, 14, 30), type: 'visit',
        title: 'Ops Check-In',
        summary: 'Spoke with ops lead about supplier friction. Late deliveries causing floor slowdowns ahead of Q3.',
        durationMinutes: 40, hasTranscript: true, repName: 'Jordan Mills',
        aiSummary: {
          title: 'Ops lead confirmed supplier frustration and signaled strong motivation to switch before Q3',
          tldr: 'The ops lead walked through the impact of their current supplier\'s delays. With Q3 peak season approaching, they\'re actively looking for a replacement.',
          keyPoints: [
            'Late deliveries are the core issue — floor slowdowns happening 2–3 times per week.',
            'The team has started documenting failures as part of an internal case to switch.',
            'They need a solution in place before July — Q3 peak season is the hard deadline.',
            'The ops lead has sign-off authority up to a certain spend threshold.',
          ],
        },
      },
      { id: 'wc-2', accountId: 'walmart-cedar-city', date: at(10, 11, 0), type: 'visit', title: 'Market Research', summary: 'Reviewed competitor service levels with the store manager.', durationMinutes: 80, hasTranscript: false, repName: 'Jordan Mills' },
      { id: 'wc-3', accountId: 'walmart-cedar-city', date: at(18, 9, 0), type: 'visit', title: 'Internal Workshop', summary: 'Walked through implementation logistics with ops and floor leads.', durationMinutes: 90, hasTranscript: false, repName: 'Jordan Mills' },
    ],
  },
  'walmart-corp': {
    ...mockAccounts[0],
    relatedAccountCount: 24,
    lastVisitSummary:
      'Visited 3 days ago. Conversation focused on Q2 supply chain concerns. Tom mentioned potential for an expanded order next quarter.',
    ideasForThisTime: [
      'Ask about upcoming seasonal demand',
      'Explore additional product/service needs',
      'Identify front-line decision makers',
      'Confirm any pain points before they grow',
    ],
    actionItems: [
      { id: 'wm-t1', title: 'Send Q2 pricing update', dueDate: future(6, 5), status: 'open' },
      { id: 'wm-t2', title: 'Schedule executive review', dueDate: future(6, 18), status: 'open' },
      { id: 'wm-t3', title: 'Share turnaround SLA doc', dueDate: future(6, 10), status: 'open' },
      { id: 'wm-t4', title: 'Send Q1 recap report', dueDate: daysAgo(5), status: 'done' },
    ],
    recentActivity: [
      { id: 'wm-1', accountId: 'walmart-corp', date: at(3, 14, 20), type: 'visit', title: 'Quarterly Review', summary: 'Discussed Q2 supply chain concerns. Tom mentioned potential for expanded order next quarter.', durationMinutes: 55, hasTranscript: true, repName: 'Jordan Mills' },
      { id: 'wm-2', accountId: 'walmart-corp', date: at(17, 10, 0), type: 'visit', title: 'Routine Check-In', summary: 'Reviewed current service satisfaction. No new opportunities surfaced — relationship in good standing.', durationMinutes: 30, hasTranscript: true, repName: 'Jordan Mills' },
      { id: 'wm-3', accountId: 'walmart-corp', date: at(31, 9, 15), type: 'call', title: 'Shipment Follow-Up', summary: 'Follow-up call on delayed shipment. Issue resolved. Customer satisfied with resolution.', durationMinutes: 12, hasTranscript: false, repName: 'Jordan Mills' },
    ],
  },
  'profleet-corp': {
    ...mockAccounts[3],
    relatedAccountCount: 14,
    lastVisitSummary:
      'Visited 6 days ago. Good conversation with ops leadership about upcoming Q3 fleet expansion. Budget has been earmarked — they want a formal proposal by end of month.',
    ideasForThisTime: [
      'Deliver formal Q3 fleet expansion proposal',
      'Introduce volume discount options',
      'Discuss service contract upgrade path',
      'Check in on satisfaction across branch locations',
    ],
    actionItems: [
      { id: 'pf-t1', title: 'Submit Q3 fleet proposal', dueDate: future(5, 30), status: 'open' },
      { id: 'pf-t2', title: 'Prepare volume discount sheet', dueDate: future(6, 7), status: 'open' },
      { id: 'pf-t3', title: 'Check in on Glendale 1 branch', dueDate: future(6, 14), status: 'open' },
      { id: 'pf-t4', title: 'Send annual contract renewal', dueDate: daysAgo(4), status: 'done' },
    ],
    recentActivity: [
      { id: 'pf-1', accountId: 'profleet-corp', date: at(6, 10, 30), type: 'visit', title: 'Leadership Check-In', summary: 'Met with ops leadership re: Q3 fleet expansion. Budget confirmed. Formal proposal requested.', durationMinutes: 60, hasTranscript: true, repName: 'Jordan Mills' },
      { id: 'pf-2', accountId: 'profleet-corp', date: at(20, 14, 0), type: 'call', title: 'Proposal Kick-Off', summary: 'Aligned on scope and pricing structure for the Q3 proposal.', durationMinutes: 40, hasTranscript: false, repName: 'Jordan Mills' },
    ],
  },
  'profleet-glendale-2': {
    ...mockAccounts[6],
    relatedAccountCount: 14,
    lastVisitSummary:
      'Visited today. Discussed new fleet acquisition coming in Q3. Manager hinted at budget availability for an expanded service contract.',
    ideasForThisTime: [
      'Follow up on Q3 fleet expansion proposal',
      'Introduce premium service tier options',
      'Ask about satisfaction with current turnaround times',
    ],
    actionItems: [
      { id: 'pg-t1', title: 'Send expanded contract proposal', dueDate: future(6, 3), status: 'open' },
      { id: 'pg-t2', title: 'Resolve pending invoice', dueDate: future(5, 30), status: 'open' },
    ],
    recentActivity: [
      { id: 'pg-1', accountId: 'profleet-glendale-2', date: at(0, 9, 15), type: 'visit', title: 'Fleet Expansion', summary: 'Q3 fleet expansion discussed. Budget confirmed. Strong opportunity for expanded contract.', durationMinutes: 45, hasTranscript: true, repName: 'Jordan Mills' },
      { id: 'pg-2', accountId: 'profleet-glendale-2', date: at(14, 11, 0), type: 'call', title: 'Invoice Follow-Up', summary: 'Checked on outstanding invoice from last month.', durationMinutes: 10, hasTranscript: false, repName: 'Jordan Mills' },
    ],
  },
  'innovative-tech-tucson': {
    ...mockAccounts[8],
    relatedAccountCount: 2,
    lastVisitSummary:
      "Visited 30 days ago. Sandra mentioned the team has been evaluating three vendors — we're the frontrunner. Budget is approved. Main concern is implementation timeline.",
    ideasForThisTime: [
      'Present implementation timeline to address concerns',
      'Offer a phased rollout option',
      'Introduce Sandra to our customer success lead',
    ],
    actionItems: [
      { id: 'it-t1', title: 'Share implementation timeline', dueDate: future(6, 2), status: 'open' },
      { id: 'it-t2', title: 'Intro call with CS lead', dueDate: future(6, 9), status: 'open' },
      { id: 'it-t3', title: 'On-site training for new team', dueDate: null, status: 'open' },
    ],
    recentActivity: [
      { id: 'it-1', accountId: 'innovative-tech-tucson', date: at(30, 10, 0), type: 'visit', title: 'Vendor Review', summary: "Sandra shared that we're the frontrunner in their vendor evaluation. Budget approved, timeline is key concern.", durationMinutes: 50, hasTranscript: true, repName: 'Jordan Mills' },
      { id: 'it-2', accountId: 'innovative-tech-tucson', date: at(45, 15, 30), type: 'call', title: 'Discovery Call', summary: 'Initial discovery to understand current workflows and pain points.', durationMinutes: 35, hasTranscript: true, repName: 'Jordan Mills' },
    ],
  },
  'riverbend-collision': {
    ...mockAccounts[9],
    relatedAccountCount: 1,
    lastVisitSummary:
      'Last visited over a year ago. Tom was friendly but noncommittal. Re-engagement should focus on what\'s changed in their business.',
    ideasForThisTime: [
      'Ask what\'s changed in their business since last visit',
      'Lead with new product improvements',
      'Offer a no-pressure demo of the latest service tier',
    ],
    actionItems: [
      { id: 'rb-t1', title: 'Send re-engagement email', dueDate: future(6, 5), status: 'open' },
      { id: 'rb-t2', title: 'Schedule demo call', dueDate: future(6, 18), status: 'open' },
    ],
    recentActivity: [
      { id: 'rb-1', accountId: 'riverbend-collision', date: at(365, 14, 0), type: 'visit', title: 'Re-engagement Visit', summary: 'Reconnected with Tom after a long gap. Friendly conversation — not ready to move, but open to staying in touch.', durationMinutes: 25, hasTranscript: false, repName: 'Jordan Mills' },
    ],
  },
  'profleet-flagstaff': {
    ...mockAccounts[5],
    relatedAccountCount: 14,
    lastVisitSummary:
      'Visited 3 weeks ago. Toured the facility and met the new ops manager.',
    ideasForThisTime: [
      'Follow up on Q3 service volume estimate',
      'Introduce volume discount options',
    ],
    actionItems: [
      { id: 'pf-flag-t1', title: 'Send Q3 service estimate', dueDate: future(6, 10), status: 'open' },
      { id: 'pf-flag-t2', title: 'Follow up with ops manager', dueDate: future(6, 14), status: 'open' },
    ],
    recentActivity: [
      { id: 'pf-flagstaff-1', accountId: 'profleet-flagstaff', date: at(4, 10, 45), type: 'visit', title: 'On-site Visit', summary: 'Toured the Flagstaff facility and met the new ops manager.', durationMinutes: 64, hasTranscript: true, repName: 'Jordan Mills' },
    ],
  },
};
