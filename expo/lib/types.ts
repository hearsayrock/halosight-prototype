export type AccountType = 'corporate' | 'branch' | 'standalone';
export type CrmAccountType = 'sold-to' | 'shipped-to' | 'distributor' | 'prospect';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  crmAccountType?: CrmAccountType;
  assignedInitial?: string;
  taskCount?: number;
  city?: string;
  state?: string;
  distanceMiles: number;
  lastVisited: Date;
  childCount?: number;
  parentId?: string;
  contactName?: string;
  contactTitle?: string;
  phone?: string;
  address?: string;
  crmId?: string;
  healthScore?: number;
  annualRevenue?: number;
}

export type ActionItemStatus = 'open' | 'done' | 'canceled';

export interface ActionItem {
  id: string;
  title: string;
  dueDate: Date | null;
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
  title: string;
  tldr: string;
  keyPoints: string[];
}

export interface ActivityItem {
  id: string;
  accountId: string;
  date: Date;
  type: 'visit' | 'call' | 'email' | 'task';
  title: string;
  summary: string;
  durationMinutes?: number;
  hasTranscript: boolean;
  repName: string;
  aiSummary?: ActivityAISummary;
}

export type SortOption = 'alphabetical' | 'distance' | 'lastVisited' | 'company';
