"use client";

/** FLUTTER HANDOFF: EngagementRow — opened/unread variants for the recent-engagement feed. */
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { RecentActivity } from "@/lib/types";
import { formatEngagementDate } from "@/lib/utils";

export type EngagementRowVariant = "recent" | "recent-unread";

/** A row in the cross-account engagement feed. */
function RecentRow({ recent, unread, isLast, href, onPress }: { recent: RecentActivity; unread: boolean; isLast: boolean; href?: string; onPress?: () => void }) {
  const isToday = formatEngagementDate(recent.date) === "Today";
  const typeLabel = recent.type === "call" ? "Phone Call" : "Meeting";
  const dot = <span aria-hidden style={{ color: "var(--md-sys-color-text-disabled)" }}>·</span>;
  const body = (
    <div
      className="active:bg-[var(--md-sys-color-dark-secondary)] transition-colors"
      style={{ margin: "0 var(--spacing-2)", padding: "var(--spacing-4) var(--spacing-3)", borderRadius: "var(--radius-md)" }}
    >
      <p className="flex items-center" style={{ gap: "var(--spacing-2)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--md-sys-color-brand-teal)" }}>
        {unread && <span aria-label="Unread" style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />}
        <span className="truncate">{recent.accountName}</span>
      </p>
      <p style={{ marginTop: "var(--spacing-1)", fontSize: 17, lineHeight: "22px", fontWeight: unread ? 600 : 500, color: "var(--md-sys-color-text-primary)" }}>
        {recent.title}
      </p>
      {unread && recent.changeNote && (
        <p style={{ marginTop: "var(--spacing-2)", paddingLeft: "var(--spacing-2)", borderLeft: "2px solid var(--md-sys-color-text-disabled)", fontSize: 14, lineHeight: "20px", color: "var(--md-sys-color-text-muted)" }}>
          {recent.changeNote}
        </p>
      )}
      <p className="flex items-center" style={{ marginTop: "var(--spacing-2)", gap: "var(--spacing-2)", fontSize: 14, lineHeight: "20px", color: "var(--md-sys-color-text-muted)" }}>
        <Icon name={recent.type === "call" ? "call" : "person"} size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />
        <span style={{ fontWeight: unread ? 600 : 500 }}>{typeLabel}</span>
        {dot}
        <span style={isToday ? { color: "var(--md-sys-color-neonindigo)", fontWeight: 600 } : undefined}>{formatEngagementDate(recent.date)}</span>
      </p>
    </div>
  );
  const sep = !isLast && <div className="absolute bottom-0 left-5 right-5" style={{ height: 1, background: "var(--md-sys-color-alpha-white-10)" }} />;
  return href ? (
    <Link href={href} onClick={onPress} className="block relative">{body}{sep}</Link>
  ) : (
    <button type="button" onClick={onPress} className="block relative w-full text-left">{body}{sep}</button>
  );
}


export default function EngagementRow({ recent, variant, isLast = false, href, onPress }: { recent: RecentActivity; variant?: EngagementRowVariant; isLast?: boolean; href?: string; onPress?: () => void }) {
  return <RecentRow recent={recent} unread={(variant ?? (recent.unread ? "recent-unread" : "recent")) === "recent-unread"} isLast={isLast} href={href} onPress={onPress} />;
}
