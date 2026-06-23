export function formatLastVisited(date: Date): { label: string; isToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return { label: 'Today', isToday: true };
  if (diff === 1) return { label: 'Yesterday', isToday: false };
  if (diff < 7) return { label: `${diff}d ago`, isToday: false };
  if (diff < 30) return { label: `${Math.round(diff / 7)}w ago`, isToday: false };
  if (diff < 365) return { label: `${Math.round(diff / 30)}mo ago`, isToday: false };
  return { label: `${Math.round(diff / 365)}y ago`, isToday: false };
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}hr ${m} min` : `${h}hr`;
}

export function formatActivityDate(date: Date): string {
  return (
    date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) +
    ', ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );
}
