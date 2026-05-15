export function formatLastVisited(date: Date): { label: string; isToday: boolean } {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "Visited Today", isToday: true };
  if (diffDays === 1) return { label: "Visited yesterday", isToday: false };
  if (diffDays < 7) return { label: `Visited ${diffDays} days ago`, isToday: false };
  if (diffDays < 14) return { label: "Visited 1 week ago", isToday: false };
  if (diffDays < 30) return { label: `Visited ${Math.floor(diffDays / 7)} weeks ago`, isToday: false };
  if (diffDays < 60) return { label: "Visited 1 month ago", isToday: false };
  if (diffDays < 365) return { label: `Visited ${Math.floor(diffDays / 30)} months ago`, isToday: false };
  return { label: "Visited 1 year ago", isToday: false };
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return `${(miles * 5280).toFixed(0)} ft`;
  if (miles < 10) return `${miles} mi`;
  return `${Math.round(miles)} mi`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
