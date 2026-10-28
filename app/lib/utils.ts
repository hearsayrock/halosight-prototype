export function formatLastVisited(date: Date): { label: string; isToday: boolean } {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "today", isToday: true };
  if (diffDays === 1) return { label: "yesterday", isToday: false };
  if (diffDays < 7) return { label: `${diffDays} days ago`, isToday: false };
  if (diffDays < 14) return { label: "1 week ago", isToday: false };
  if (diffDays < 30) return { label: `${Math.floor(diffDays / 7)} weeks ago`, isToday: false };
  if (diffDays < 60) return { label: "1 month ago", isToday: false };
  if (diffDays < 365) return { label: `${Math.floor(diffDays / 30)} months ago`, isToday: false };
  return { label: "1 year ago", isToday: false };
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return `${(miles * 5280).toFixed(0)} ft`;
  if (miles < 10) return `${miles} mi`;
  return `${Math.round(miles)} mi`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Due-date text for an action item row.
 * urgent = overdue, yesterday or today (rendered in the coral urgent tone).
 */
export function formatActionItemDue(dueDate: Date | null, now: Date = new Date()): { text: string; urgent: boolean } {
  if (!dueDate) return { text: "No due date", urgent: false };
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff < -1) return { text: `Overdue ${-diff} days`, urgent: true };
  if (diff === -1) return { text: "Due yesterday", urgent: true };
  if (diff === 0) return { text: "Due today", urgent: true };
  if (diff === 1) return { text: "Due tomorrow", urgent: false };
  if (diff < 14) return { text: `Due in ${diff} days`, urgent: false };
  return { text: `Due in ${Math.round(diff / 7)} weeks`, urgent: false };
}

/** "Today", "Yesterday", "N days ago", "N weeks ago", "N months ago", "N years ago". */
export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const start = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
  const days = Math.round((start(now) - start(date)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) { const w = Math.floor(days / 7); return w === 1 ? "1 week ago" : `${w} weeks ago`; }
  if (days < 365) { const m = Math.max(1, Math.floor(days / 30)); return m === 1 ? "1 month ago" : `${m} months ago`; }
  const y = Math.floor(days / 365);
  return y === 1 ? "1 year ago" : `${y} years ago`;
}
