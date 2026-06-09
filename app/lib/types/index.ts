/**
 * FLUTTER HANDOFF: Domain Types
 * These interfaces map directly to Flutter Entity classes in the domain layer.
 * Flutter equivalent: lib/entity/
 */

export type AccountType = "corporate" | "branch" | "standalone";

export type CrmAccountType = "sold-to" | "shipped-to" | "distributor" | "prospect";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  crmAccountType?: CrmAccountType; // CRM classification shown on card badge
  assignedInitial?: string;        // team member initial shown on card (e.g. "A")
  taskCount?: number;              // open to-dos for this account
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
}

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
