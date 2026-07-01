"use client";

/**
 * FLUTTER HANDOFF: ActivityDetailScreen
 * Route: /accounts/[id]/activity/[activityId]
 * Reached by tapping an activity card in the Account Detail → Activity tab.
 * Also the landing screen after completing a capture flow.
 * Widget: StatelessWidget
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-text-secondary, --md-sys-color-neonindigo-dark, --radius-xl, --radius-md
 * Flutter equivalent: activity_detail_page.dart
 */

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ActionItemCard from "@/components/accounts/ActionItemCard";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import type { ActivityAISummary } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFullDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", { month: "long", day: "numeric" }) +
    "  •  " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}hr ${m}m` : `${h}hr`;
}

// Render inline **bold** markers
function Bold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: "var(--md-sys-color-text-primary)", fontWeight: 600 }}>{part}</strong>
          : part
      )}
    </>
  );
}

// ── AI Summary card ───────────────────────────────────────────────────────────

function AISummaryCard({ summary, durationMinutes }: { summary: ActivityAISummary; durationMinutes?: number }) {
  return (
    <div
      className="p-5 mb-6"
      style={{
        background: "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      {/* Title */}
      <p className="text-[15px] font-bold leading-snug mb-3" style={{ color: "var(--md-sys-color-text-primary)" }}>
        {summary.title}
      </p>

      {/* TL;DR */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--md-sys-color-text-muted)" }}>
        <span className="font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>TL;DR: </span>
        {summary.tldr}
        {durationMinutes != null && (
          <span className="font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}> ({formatDuration(durationMinutes)})</span>
        )}
      </p>

      {/* Key Points */}
      <p className="heading-6 mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>Key Points</p>
      <ul className="flex flex-col gap-2">
        {summary.keyPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full" style={{ background: "var(--md-sys-color-text-disabled)" }} />
            <span className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-text-muted)" }}>
              <Bold text={point} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  const { id, activityId } = use(params);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { getItems } = useActionItems();
  const actionItems = getItems(id);

  const detail = mockAccountDetails[id];
  const account = detail ?? mockAccounts.find((a) => a.id === id);
  const activity = detail?.recentActivity.find((a) => a.id === activityId);

  if (!account || !activity) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--md-sys-color-text-muted)" }}>Activity not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-4">
        {/* Back + more buttons row */}
        <div className="flex items-center justify-between mb-3">
          <Link href={`/accounts/${id}?tab=activity`}>
            <button className="p-1 active:opacity-60 transition-opacity">
              <Icon name="chevron_left" size={24} style={{ color: "var(--md-sys-color-text-muted)" }} />
            </button>
          </Link>
          <button className="p-1 active:opacity-60 transition-opacity">
            <Icon name="more_horiz" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
        </div>

        {/* Account name */}
        <h1
          className="w-full text-center text-[26px] font-bold leading-tight px-10"
          style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
        >
          {account.name}
        </h1>

        {/* Date + time */}
        <p className="text-center text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>
          {formatFullDate(activity.date)}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">

        {/* AI Summary */}
        {activity.aiSummary && (
          <AISummaryCard summary={activity.aiSummary} durationMinutes={activity.durationMinutes} />
        )}

        {/* No AI summary fallback */}
        {!activity.aiSummary && (
          <div
            className="p-5 mb-6"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <p className="text-[15px] font-bold mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>
              {activity.title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-text-muted)" }}>
              {activity.summary}
            </p>
          </div>
        )}

        {/* Action Items */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-6" style={{ color: "var(--md-sys-color-text-primary)" }}>
              Action Items
            </h2>
            {actionItems.length > 0 && (
              <button onClick={() => setShowAddSheet(true)} className="active:opacity-60 transition-opacity">
                <Icon name="add" size={20} style={{ color: "var(--md-sys-color-text-primary)" }} />
              </button>
            )}
          </div>

          {actionItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              {actionItems.map((item) => (
                <Link key={item.id} href={`/accounts/${id}/action-items/${item.id}`}>
                  <ActionItemCard item={item} />
                </Link>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setShowAddSheet(true)}
              className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity"
              style={{
                background: "var(--md-sys-color-dark-secondary)",
                borderRadius: "var(--radius-xl)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 15%, transparent)" }}
              >
                <Icon name="add" size={18} style={{ color: "var(--md-sys-color-neonindigo)" }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                  Add your first action item
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--md-sys-color-text-secondary)" }}>
                  Track follow-ups from this visit
                </p>
              </div>
            </button>
          )}
        </section>

      </div>

      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

    </div>
  );
}
