"use client";

/**
 * FLUTTER HANDOFF: AccountDetailScreen
 * Route: /accounts/[id]
 * Widget: StatefulWidget
 * State: activeTab ("overview" | "activity"), pageState (loading|error|loaded)
 * Tokens: --color-background, --color-dark-primary, --color-dark-secondary,
 *         --color-dark-tertiary, --color-text-primary, --color-text-muted,
 *         --color-text-disabled, --color-brand-coral, --radius-full, --radius-md
 * Flutter equivalent: account_detail_page.dart
 *
 * STATES (preview via ?preview=loading or ?preview=error):
 *   loading — skeleton shimmer for header + overview content
 *   error   — error card + retry CTA when the fetch fails
 *   loaded  — normal content (default)
 *
 * PULL-TO-REFRESH (Flutter only):
 *   Wrap the tab body in a RefreshIndicator. Re-call ViewModel.loadAccount(id).
 *   Not implemented in web prototype.
 */

import { use, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ActionItemCard from "@/components/accounts/ActionItemCard";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import { AccountDetailSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { useCapture } from "@/lib/context/CaptureContext";
import type { ActivityItem } from "@/lib/types";

// ── Activity card ─────────────────────────────────────────────────────────────

function formatActivityDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) +
    ", " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}hr ${m} mins` : `${h}hr`;
}

function ActivityCard({ item, accountId }: { item: ActivityItem; accountId: string }) {
  return (
    <Link href={`/accounts/${accountId}/activity/${item.id}`}>
    <div
      className="flex items-start gap-3 p-4 active:opacity-70 transition-opacity"
      style={{
        background: "var(--color-dark-secondary)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {item.title}
        </p>
        <p
          className="text-sm leading-relaxed mb-2"
          style={{
            color: "var(--color-text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.summary}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
            {formatActivityDate(item.date)}
          </span>
          {item.durationMinutes != null && (
            <>
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>•</span>
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
                {formatDuration(item.durationMinutes)}
              </span>
            </>
          )}
        </div>
      </div>
      <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
    </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AccountDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview"); // "loading" | "error" | null
  const [activeTab, setActiveTab] = useState<"overview" | "activity">(
    searchParams.get("tab") === "activity" ? "activity" : "overview"
  );
  const [showAddSheet, setShowAddSheet] = useState(false);

  const { getItems } = useActionItems();
  const actionItems = getItems(id);

  const { status: captureStatus, accountId: capturingId, startCapture } = useCapture();
  const isCapturing = captureStatus !== "idle" && capturingId === id;

  const detail = mockAccountDetails[id];
  const account = detail ?? mockAccounts.find((a) => a.id === id);

  // ── Preview states ────────────────────────────────────────────────────────
  if (preview === "loading") return <AccountDetailSkeleton />;

  if (preview === "error") {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <Link href="/accounts">
            <button className="p-1 active:opacity-60 transition-opacity">
              <Icon name="close" size={22} style={{ color: "var(--color-text-muted)" }} />
            </button>
          </Link>
        </div>
        <ErrorState
          title="Couldn't load account"
          message="We had trouble fetching this account's details. Check your connection and try again."
          onRetry={() => {}}
        />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <Link href="/accounts">
            <button className="p-1 active:opacity-60 transition-opacity">
              <Icon name="close" size={22} style={{ color: "var(--color-text-muted)" }} />
            </button>
          </Link>
        </div>
        <ErrorState
          title="Account not found"
          message="This account doesn't exist or may have been removed."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-4">

        {/* Close button */}
        <div className="mb-3">
          <Link href="/accounts">
            <button className="p-1 active:opacity-60 transition-opacity">
              <Icon name="close" size={22} style={{ color: "var(--color-text-muted)" }} />
            </button>
          </Link>
        </div>

        {/* Account name */}
        <h1
          className="w-full text-center text-[26px] font-bold leading-tight px-10 mb-4"
          style={{
            color: "var(--color-text-primary)",
            fontFamily: "Roboto Slab, Georgia, serif",
          }}
        >
          {account.name}
        </h1>

        {/* Tabs */}
        <div
          className="flex p-1 gap-1 mx-auto"
          style={{ width: 255, background: "var(--color-dark-primary)", borderRadius: "var(--radius-full)" }}
        >
          {(["overview", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-semibold transition-all capitalize"
              style={{
                borderRadius: "var(--radius-full)",
                background: activeTab === tab ? "var(--color-dark-secondary)" : "transparent",
                color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-muted)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — pb accounts for capture button + BottomNav */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="px-4 pb-4">
            {/* Detail-only sections */}
            {detail ? (
              <>
                <section className="mb-6">
                  <h2 className="heading-6 mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Last Time
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {detail.lastVisitSummary}
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="heading-6 mb-3" style={{ color: "var(--color-text-primary)" }}>
                    Ideas for this Time
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {detail.ideasForThisTime.map((idea, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--color-text-muted)", marginTop: "0.375rem" }}
                        />
                        <span className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                          {idea}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <div className="py-8 text-center mb-2">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No overview available yet.
                  <br />
                  Capture your first meeting to generate insights.
                </p>
              </div>
            )}

            {/* Action Items — always visible regardless of detail */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading-6" style={{ color: "var(--color-text-primary)" }}>
                  Action Items
                </h2>
                {actionItems.length > 0 && (
                  <button onClick={() => setShowAddSheet(true)} className="active:opacity-60 transition-opacity">
                    <Icon name="add" size={20} style={{ color: "var(--color-text-primary)" }} />
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
                    background: "var(--color-dark-secondary)",
                    borderRadius: "var(--radius-xl)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--color-brand-purple) 15%, transparent)",
                    }}
                  >
                    <Icon name="add" size={18} style={{ color: "var(--color-brand-purple)" }} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      Add your first action item
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                      Track follow-ups from this visit
                    </p>
                  </div>
                </button>
              )}
            </section>
          </div>
        )}

        {/* Activity */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {detail?.recentActivity?.length ? (
              detail.recentActivity.map((item) => (
                <ActivityCard key={item.id} item={item} accountId={id} />
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No activity recorded yet.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Capture Meeting CTA — hidden while a capture is active for this account */}
      {!isCapturing && (
        <div
          className="absolute left-0 right-0 flex justify-center px-4"
          style={{ bottom: 32 }}
        >
          <button
            onClick={() => startCapture(id, account.name)}
            className="h-11 px-6 font-semibold text-[14px] flex items-center gap-2 transition-opacity active:opacity-80"
            style={{
              background: "var(--color-brand-coral)",
              color: "var(--color-text-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Icon name="edit" size={16} style={{ color: "var(--color-text-primary)" }} />
            Capture Meeting
          </button>
        </div>
      )}

      {/* Add Action Item Sheet */}
      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

    </div>
  );
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <AccountDetailPageContent params={params} />
    </Suspense>
  );
}
