"use client";

/**
 * FLUTTER HANDOFF: ActivityDetailScreen
 * Route: /relationships/[id]/activity/[activityId]
 * Reached by tapping an activity card in the Account Detail → Activity tab.
 * Also the landing screen after completing a capture flow.
 * Widget: StatelessWidget
 * Tokens: --color-background, --color-dark-secondary, --color-dark-tertiary,
 *         --color-text-primary, --color-text-muted, --color-text-disabled,
 *         --color-text-secondary, --color-brand-purple-dark, --radius-xl, --radius-md
 * Flutter equivalent: activity_detail_page.dart
 */

import { use, useState, useRef, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";
import ActionItemCard from "@/components/accounts/ActionItemCard";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import AccountPickerSheet from "@/components/accounts/AccountPickerSheet";
import CompletionToast from "@/components/ui/CompletionToast";
import NoteSheet from "@/components/ui/NoteSheet";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import type { ActivityAISummary, ActivityItem, ActionItem } from "@/lib/types";

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
          ? <strong key={i} style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{part}</strong>
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
        background: "var(--color-dark-secondary)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      {/* Title */}
      <p className="text-[15px] font-bold leading-snug mb-3" style={{ color: "var(--color-text-primary)" }}>
        {summary.title}
      </p>

      {/* TL;DR */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
        <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>TL;DR: </span>
        {summary.tldr}
        {durationMinutes != null && (
          <span className="font-bold" style={{ color: "var(--color-text-primary)" }}> ({formatDuration(durationMinutes)})</span>
        )}
      </p>

      {/* Key Points */}
      <p className="heading-6 mb-2" style={{ color: "var(--color-text-primary)" }}>Key Points</p>
      <ul className="flex flex-col gap-2">
        {summary.keyPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-text-muted)" }} />
            <span className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              <Bold text={point} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Demo data for newly-captured leads ────────────────────────────────────────

const DEMO_ACTION_ITEMS: ActionItem[] = [
  {
    id: "demo-ai-1",
    title: "Send Sandra the formal proposal",
    dueDate: null,
    status: "open",
    description: "Price, timeline, and onboarding plan — she asked for it by end of next week.",
    originActivity: "Sandra confirmed we're the frontrunner for the contract",
    originActivityId: "new-capture",
  },
  {
    id: "demo-ai-2",
    title: "Intro email to Marcus (IT lead)",
    dueDate: null,
    status: "open",
    description: "Loop him in before final sign-off.",
    originActivity: "Sandra confirmed we're the frontrunner for the contract",
    originActivityId: "new-capture",
  },
];

const DEMO_CAPTURE_ACTIVITY: ActivityItem = {
  id: "new-capture",
  accountId: "new-capture",
  title: "Sandra confirmed we're the frontrunner for the contract",
  summary: "Strong meeting — Sandra is ready to move forward and asked for a formal proposal by end of next week.",
  date: new Date(),
  durationMinutes: 28,
  hasTranscript: true,
  repName: "Jordan Mills",
  type: "visit",
  aiSummary: {
    title: "Sandra confirmed we're the frontrunner for the contract",
    tldr: "Sandra confirmed they're moving forward and asked for a formal proposal by end of next week. A competitor came in 15% lower, but she said our support model was the differentiator.",
    keyPoints: [
      "Sandra confirmed the company is **ready to move forward** with the partnership.",
      "She asked for a **formal proposal by Friday** — price, timeline, and onboarding plan.",
      "Mentioned a competitor quote came in **15% lower**, but our support model was the differentiator.",
      "Their IT lead (Marcus) needs to be looped in before final sign-off.",
      "Follow up with an intro email to Marcus this week.",
    ],
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

function ActivityDetailPageContent({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  const { id, activityId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [assignedAccountId, setAssignedAccountId] = useState(id);
  const [assignedAccountName, setAssignedAccountName] = useState<string | null>(null);
  const { getItems, updateItem } = useActionItems();
  const [completedItemIds, setCompletedItemIds] = useState<string[]>([]);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allActionItems = getItems(id);
  const actionItems = allActionItems.filter((i) => !completedItemIds.includes(i.id));

  function handleComplete(itemId: string) {
    if (pendingItemId) return;
    setPendingItemId(itemId);
    completionTimerRef.current = setTimeout(() => {
      const item = allActionItems.find((i) => i.id === itemId);
      if (item) updateItem(id, { ...item, status: "done" });
      setCompletedItemIds((prev) => [...prev, itemId]);
      setPendingItemId(null);
    }, 8000);
  }

  function handleUndoComplete() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    setPendingItemId(null);
  }

  function handleAddNote() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    completionTimerRef.current = null;
    setNoteSheetOpen(true);
  }

  function handleNoteDone(note: string) {
    const item = allActionItems.find((i) => i.id === pendingItemId);
    if (item) updateItem(id, { ...item, status: "done", ...(note.trim() ? { note } : {}) });
    if (pendingItemId) setCompletedItemIds((prev) => [...prev, pendingItemId]);
    setNoteSheetOpen(false);
    setPendingItemId(null);
  }

  // Trigger completion when returning from action item detail page
  const justCompletedHandled = useRef(false);
  useEffect(() => {
    const justCompleted = searchParams.get("just_completed");
    if (justCompleted && !justCompletedHandled.current) {
      justCompletedHandled.current = true;
      handleComplete(justCompleted);
      router.replace(`/relationships/${id}/activity/${activityId}`);
    }
  }, []); // eslint-disable-line

  const detail = mockAccountDetails[id];
  const isNewCapture = activityId === "new-capture";
  const account = detail
    ?? mockAccounts.find((a) => a.id === id)
    ?? (isNewCapture
      ? { id, name: searchParams.get("name") ?? "New Lead", type: "standalone" as const, halosightType: "prospect" as const, distanceMiles: 0, lastVisited: new Date(), taskCount: 0 }
      : undefined);
  const activity = detail?.recentActivity.find((a) => a.id === activityId) ?? (isNewCapture ? DEMO_CAPTURE_ACTIVITY : undefined);
  const isExternalAccount = !mockAccounts.some((a) => a.id === id) && !isNewCapture;

  if (!account || !activity) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--color-text-muted)" }}>Activity not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-4">
        {/* Back + rep avatar / more row */}
        <div className="flex items-center justify-between mb-3">
          <Link href={isNewCapture
            ? `/relationships/${id}?just_created=true&name=${encodeURIComponent(searchParams.get("name") ?? "")}&captured=true&tab=activity`
            : `/relationships/${id}?tab=activity`}>
            <button className="p-1 active:opacity-60 transition-opacity">
              <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
            </button>
          </Link>
          {activity.repName !== "Jordan Mills" ? (
            <div className="flex items-center gap-2 pr-1">
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Captured by</span>
              <div
                className="flex items-center justify-center rounded-full text-[13px] font-semibold"
                style={{
                  width: 28,
                  height: 28,
                  background: "var(--color-dark-secondary)",
                  color: "var(--color-text-muted)",
                  border: "1.5px solid var(--color-dark-tertiary)",
                }}
              >
                {activity.repName.charAt(0)}
              </div>
            </div>
          ) : (
            <button className="p-1 active:opacity-60 transition-opacity">
              <Icon name="more_horiz" size={22} style={{ color: "var(--color-text-muted)" }} />
            </button>
          )}
        </div>

        {/* Account name — tappable to reassign */}
        <button
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-1 active:opacity-70 transition-opacity px-10"
        >
          <h1
            className="text-center text-[26px] font-bold leading-tight"
            style={{ color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
          >
            {assignedAccountName ?? account.name}
          </h1>
          <Icon name="expand_more" size={20} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
        </button>

        {/* Date + time */}
        <p className="text-center text-sm" style={{ color: "var(--color-text-disabled)" }}>
          {formatFullDate(activity.date)}
        </p>

        {/* External account badge */}
        {isExternalAccount && (
          <div className="flex justify-center mt-2">
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(139,146,255,0.1)",
                color: "var(--color-brand-purple)",
                border: "1px solid rgba(139,146,255,0.2)",
              }}
            >
              Not in your accounts
            </span>
          </div>
        )}
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
              background: "var(--color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <p className="text-[15px] font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              {activity.title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {activity.summary}
            </p>
          </div>
        )}

        {/* Action Items */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-6" style={{ color: "var(--color-text-primary)" }}>
              Action Items
            </h2>
            {(isNewCapture ? DEMO_ACTION_ITEMS : actionItems).length > 0 && (
              <button onClick={() => setShowAddSheet(true)} className="active:opacity-60 transition-opacity">
                <Icon name="add" size={20} style={{ color: "var(--color-text-primary)" }} />
              </button>
            )}
          </div>

          {(isNewCapture ? DEMO_ACTION_ITEMS : actionItems).length > 0 ? (
            <div className="flex flex-col gap-2">
              {isNewCapture
                ? DEMO_ACTION_ITEMS.map((item) => (
                    <ActionItemCard key={item.id} item={item} onComplete={() => {}} pending={false} />
                  ))
                : actionItems.map((item) => (
                    <Link key={item.id} href={`/relationships/${id}/action-items/${item.id}?from=activity&activityId=${activityId}`}>
                      <ActionItemCard item={item} onComplete={() => handleComplete(item.id)} pending={pendingItemId === item.id} />
                    </Link>
                  ))
              }
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
                style={{ background: "color-mix(in srgb, var(--color-brand-purple) 15%, transparent)" }}
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

      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

      <CompletionToast
        visible={pendingItemId !== null && !noteSheetOpen}
        bottom={106}
        onUndo={handleUndoComplete}
        onAddNote={handleAddNote}
        onDismiss={() => {
          if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
          const item = allActionItems.find((i) => i.id === pendingItemId);
          if (item) updateItem(id, { ...item, status: "done" });
          if (pendingItemId) setCompletedItemIds((prev) => [...prev, pendingItemId]);
          setPendingItemId(null);
        }}
      />
      <NoteSheet visible={noteSheetOpen} onDone={handleNoteDone} />

      {/* Account picker — portaled so it layers above everything */}
      {typeof document !== "undefined" &&
        document.getElementById("phone-overlay-root") &&
        createPortal(
          <AnimatePresence>
            {showPicker && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
                <AccountPickerSheet
                  currentId={assignedAccountId}
                  onSelect={(newId, newName) => {
                    setAssignedAccountId(newId);
                    setAssignedAccountName(newName);
                  }}
                  onClose={() => setShowPicker(false)}
                />
              </div>
            )}
          </AnimatePresence>,
          document.getElementById("phone-overlay-root")!
        )}

    </div>
  );
}

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  return (
    <Suspense>
      <ActivityDetailPageContent params={params} />
    </Suspense>
  );
}
