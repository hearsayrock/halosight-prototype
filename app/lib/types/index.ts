/**
 * FLUTTER HANDOFF: Domain Types
 * These interfaces map directly to Flutter Entity classes in the domain layer.
 * Flutter equivalent: lib/entity/
 */

export type AccountType = "corporate" | "branch" | "standalone";

export type CrmAccountType = "sold-to" | "shipped-to" | "distributor" | "prospect";

/**
 * Halosight-native account classification.
 * Set once at creation time — cannot be changed in-app.
 * "prospect"  = a new relationship being developed (not yet a customer)
 * "account"   = an established customer / CRM account
 * undefined   = came from CRM sync (treated as "account" for display)
 */
export type HalosightAccountType = "prospect" | "account";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  halosightType?: HalosightAccountType; // Set at creation — prospect vs established account
  crmAccountType?: CrmAccountType;      // CRM classification shown on card badge
  taskCount?: number;              // open to-dos for this account
  riskCount?: number;              // open AI-flagged risks for this account (hidden when 0/undefined)
  city?: string;
  state?: string;
  distanceMiles: number;
  lastVisited: Date;
  childCount?: number;         // corporate accounts only
  parentId?: string;           // branch accounts only
  contactName?: string;
  contactTitle?: string;
  phone?: string;
  address?: string;
  crmId?: string;
  healthScore?: number;        // 0–100
  annualRevenue?: number;
}

export type ActionItemStatus = "open" | "done" | "canceled";

export interface ActionItem {
  id: string;
  title: string;
  dueDate: Date | null;   // null = TBD
  status: ActionItemStatus;
  note?: string;          // optional completion note
  description?: string;   // why this action item was created
  originActivity?: string; // name of the visit/call this item was generated from
  originActivityId?: string; // links to /relationships/[accountId]/activity/[originActivityId]
  originType?: ActionItemOriginType; // kind of interaction it came from; shown on the drawer's interaction card
}

/** Where an action item came from. Items with no origin type show no icon. */
export type ActionItemOriginType = "meeting" | "spoken-note";

export interface AccountDetail extends Account {
  lastVisitSummary: string;
  ideasForThisTime: string[];
  recentActivity: ActivityItem[];
  actionItems: ActionItem[];
  relatedAccountCount: number;
}

export interface ActivityAISummary {
  title: string;        // AI-generated headline for the activity
  tldr: string;         // short paragraph summary
  keyPoints: string[];  // bullet points — wrap **text** in bold
}

export interface ActivityItem {
  id: string;
  accountId: string;
  date: Date;
  type: "visit" | "call" | "email" | "task";
  title: string;
  summary: string;
  durationMinutes?: number;
  hasTranscript: boolean;
  repName: string;
  aiSummary?: ActivityAISummary;
  interactionType?: "inperson" | "phone";
  /** Where the activity came from. Undefined = logged in Halosight. */
  source?: "salesforce";
}

export interface Interaction {
  id: string;
  accountId: string;
  startedAt: Date;
  endedAt?: Date;
  status: "recording" | "processing" | "complete" | "draft";
  durationSeconds?: number;
  transcript?: TranscriptSegment[];
  aiSummary?: AISummary;
}

export interface TranscriptSegment {
  id: string;
  speaker: "rep" | "customer" | "unknown";
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;          // 0–1
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  commitments: Commitment[];
  risks: Risk[];
  opportunities: Opportunity[];
  followUps: FollowUp[];
  suggestedCrmUpdates: CrmUpdate[];
  confidence: number;          // 0–1
}

export interface Commitment {
  id: string;
  text: string;
  owner: "rep" | "customer";
  dueDate?: Date;
  status: "pending" | "accepted" | "rejected";
}

export interface Risk {
  id: string;
  text: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "accepted" | "rejected";
}

export interface Opportunity {
  id: string;
  text: string;
  estimatedValue?: number;
  status: "pending" | "accepted" | "rejected";
}

export interface FollowUp {
  id: string;
  text: string;
  dueDate?: Date;
  status: "pending" | "accepted" | "rejected";
}

export interface CrmUpdate {
  id: string;
  fieldName: string;
  currentValue?: string;
  suggestedValue: string;
  confidence: number;
  status: "pending" | "accepted" | "rejected";
}

export type SortOption = "alphabetical" | "distance" | "lastVisited" | "company";

// ─── Account chat ──────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

/** One message in an account chat. `draft` is a quoted block (e.g. an email the assistant wrote) shown under the text. */
export interface ChatTurn {
  id: string;
  role: ChatRole;
  text: string;
  draft?: string;
}

/** A saved chat shown in the history menu. */
export interface ChatThread {
  id: string;
  title: string;
  /** "Today", "Yesterday", "Tuesday" */
  whenLabel: string;
  messageCount: number;
  pinned: boolean;
}
