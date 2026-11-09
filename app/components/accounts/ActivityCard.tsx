"use client";

/**
 * FLUTTER HANDOFF: ActivityCard
 * Widget: StatelessWidget (tappable open row) with a `variant`
 * Props: item (ActivityItem), accountId, isLast (hides the separator), variant ("halosight" default | "crm"), href (optional override)
 * State: none — purely presentational
 * Data: ActivityItem (lib/types) — title, summary, date, durationMinutes, repName, source
 * Flutter equivalent: activity_card.dart (one widget; variant is an enum, derived from ActivityItem.source)
 *
 * An open row (no card fill) on the page background, separated by 1px hairlines inset 20px each side; the list supplies no gaps.
 * 16px vertical padding, 20px sides. Column: title 17/500 (text.primary, wraps) · 4px · summary 15/21 (text.secondary, 2 lines then "…") · 6px · meta 14.
 * Meta line parts are separated by a dot (text.disabled), all other text is color.text.muted:
 *   halosight — "<relative date> · <duration> · <person>"   e.g. "2 days ago · 35 mins · You"   (duration omitted when there is none)
 *   crm       — "<relative date> · From Salesforce · <person>"  with "From Salesforce" in color.brand.teal
 *   person = who created it: "You" when it is the signed-in rep, otherwise their name. Dates are never indigo.
 * Variants "recent" and "recent-unread" are the rows of the Engagements side drawer (the feed of recent interactions across accounts):
 *   company eyebrow (12/600 uppercase, brand.teal; unread adds an 8px neonindigo dot before it) · title 17 (500; unread 600 and text.primary) ·
 *   unread only: a "Modified …" line (14, text.muted) behind a 2px text.disabled bar · meta: type icon + "Meeting" / "Phone Call" (14, text.muted; unread 600) · date.
 *   The date reads "Today" (neonindigo), "Yesterday", a weekday, "Last Friday", then "Oct 12". Pressing highlights the row (dark.secondary, radius.md).
 *   Takes `recent` (RecentActivity) instead of `item`. Rows sit 8px in from the list edge so the pressed fill has room; hairlines inset 20px.
 * crm adds a 20px cloud icon (color.semantic.info) before the title. Tapping opens the activity screen for both variants.
 *
 * Tokens: color.text.primary, color.text.secondary (summary), color.text.muted (meta), color.text.disabled, color.brand.teal, color.semantic.info, color.alpha.white-10
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { ActivityItem, RecentActivity } from "@/lib/types";
import { formatEngagementDate, formatRelativeDate } from "@/lib/utils";

/** The signed-in rep in the prototype; their activities read "You". */
const CURRENT_REP = "Jordan Mills";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}hr ${m} mins` : `${h}hr`;
}

export type ActivityCardVariant = "halosight" | "crm" | "recent" | "recent-unread";

/** The Engagements drawer row (variants "recent" and "recent-unread"). */
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

export default function ActivityCard({
  item, recent, accountId, isLast = false, variant, href, onPress,
}: {
  /** Activity-tab variants. */
  item?: ActivityItem;
  /** Engagements-drawer variants ("recent", "recent-unread"). */
  recent?: RecentActivity;
  accountId?: string;
  isLast?: boolean;
  /** Defaults from item.source: "salesforce" → crm, otherwise halosight. With `recent`, defaults to recent-unread when recent.unread. */
  variant?: ActivityCardVariant;
  href?: string;
  onPress?: () => void;
}) {
  if (variant === "recent" || variant === "recent-unread" || (!item && recent)) {
    if (!recent) return null;
    return <RecentRow recent={recent} unread={(variant ?? (recent.unread ? "recent-unread" : "recent")) === "recent-unread"} isLast={isLast} href={href} onPress={onPress} />;
  }
  if (!item || !accountId) return null;
  const kind = (variant === "crm" || variant === "halosight") ? variant : item.source === "salesforce" ? "crm" : "halosight";
  const person = item.repName === CURRENT_REP ? "You" : item.repName;
  const dot = <span aria-hidden style={{ color: "var(--md-sys-color-text-disabled)" }}>·</span>;
  const muted = { color: "var(--md-sys-color-text-muted)" };

  return (
    <Link href={href ?? `/relationships/${accountId}/activity/${item.id}`} className="block relative active:opacity-70 transition-opacity">
      <div style={{ padding: "var(--spacing-4) var(--spacing-5)" }}>
        <p className="flex items-start" style={{ gap: "var(--spacing-2)", fontSize: 17, fontWeight: 500, lineHeight: "22px", color: "var(--md-sys-color-text-primary)" }}>
          {kind === "crm" && <Icon name="cloud" size={20} style={{ color: "var(--md-sys-color-semantic-info)", flexShrink: 0, marginTop: 1 }} />}
          <span>{item.title}</span>
        </p>
        <p
          style={{
            marginTop: "var(--spacing-1)", fontSize: 15, lineHeight: "21px", color: "var(--md-sys-color-text-secondary)",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {item.summary}
        </p>
        <p className="flex items-center flex-wrap" style={{ marginTop: 6, gap: "var(--spacing-2)", fontSize: 14, lineHeight: "20px", ...muted }}>
          <span>{formatRelativeDate(item.date)}</span>
          {kind === "crm" ? (
            <>{dot}<span style={{ color: "var(--md-sys-color-brand-teal)" }}>From Salesforce</span></>
          ) : (
            item.durationMinutes != null && <>{dot}<span>{formatDuration(item.durationMinutes)}</span></>
          )}
          {dot}
          <span>{person}</span>
        </p>
      </div>
      {!isLast && (
        <div className="absolute bottom-0 left-5 right-5" style={{ height: 1, background: "var(--md-sys-color-alpha-white-10)" }} />
      )}
    </Link>
  );
}
