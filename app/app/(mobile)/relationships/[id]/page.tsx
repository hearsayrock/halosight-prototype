"use client";

/**
 * FLUTTER HANDOFF: AccountDetailScreen
 * Route: /relationships/[id]
 * Widget: StatefulWidget
 * State: activeTab ("overview" | "activity"), pageState (loading|error|loaded)
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary, --md-sys-color-dark-secondary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-text-primary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-brand-coral, --radius-full, --radius-md
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

import { use, useState, useRef, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import ActionItemCard from "@/components/accounts/ActionItemCard";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import CompletionToast from "@/components/ui/CompletionToast";
import NoteSheet from "@/components/ui/NoteSheet";
import { AccountDetailSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { systemAccountReps } from "@/lib/mock-data/system-accounts";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { useCapture } from "@/lib/context/CaptureContext";
import { useAccountState } from "@/lib/context/AccountStateContext";
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

function ActivityCard({ item, accountId, isExternal }: { item: ActivityItem; accountId: string; isExternal?: boolean }) {
  return (
    <Link href={`/relationships/${accountId}/activity/${item.id}`}>
    <div
      className="flex items-start gap-3 p-4 active:opacity-70 transition-opacity"
      style={{
        background: isExternal ? "var(--md-sys-color-dark-primary)" : "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-md)",
        border: isExternal ? "1px solid var(--md-sys-color-dark-secondary)" : undefined,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--md-sys-color-text-primary)" }}>
          {item.title}
        </p>
        <p
          className="text-sm leading-relaxed mb-2"
          style={{
            color: "var(--md-sys-color-text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.summary}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
            {formatActivityDate(item.date)}
          </span>
          {item.durationMinutes != null && (
            <>
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>•</span>
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                {formatDuration(item.durationMinutes)}
              </span>
            </>
          )}
          {item.repName !== "Jordan Mills" && (
            <>
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>•</span>
              <div
                className="flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0"
                style={{
                  width: 18,
                  height: 18,
                  background: "var(--md-sys-color-dark-tertiary)",
                  color: "var(--md-sys-color-text-muted)",
                }}
                title={item.repName}
              >
                {item.repName.charAt(0)}
              </div>
            </>
          )}
          {isExternal && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(139,146,255,0.10)",
                color: "var(--md-sys-color-neonindigo)",
                border: "1px solid rgba(139,146,255,0.18)",
              }}
            >
              Unassigned
            </span>
          )}
        </div>
      </div>
      <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
    </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AccountDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const preview = searchParams.get("preview"); // "loading" | "error" | null
  const [activeTab, setActiveTab] = useState<"overview" | "activity">(
    searchParams.get("tab") === "activity" ? "activity" : "overview"
  );
  const [showAddSheet, setShowAddSheet] = useState(false);

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

  // Trigger completion when returning from action item detail page
  const justCompletedHandled = useRef(false);
  useEffect(() => {
    const justCompleted = searchParams.get("just_completed");
    if (justCompleted && !justCompletedHandled.current) {
      justCompletedHandled.current = true;
      handleComplete(justCompleted);
      router.replace(`/relationships/${id}`);
    }
  }, []); // eslint-disable-line

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

  const { status: captureStatus, accountId: capturingId, startCapture } = useCapture();
  const { disqualify, restore } = useAccountState();

  // Disqualify flow — pending toast, then commit + navigate back
  const [disqualifyPending, setDisqualifyPending] = useState(false);
  const disqualifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDisqualify() {
    setDisqualifyPending(true);
    disqualifyTimerRef.current = setTimeout(() => {
      disqualify(id);
      router.push("/relationships");
    }, 5000);
  }

  function handleUndoDisqualify() {
    if (disqualifyTimerRef.current) clearTimeout(disqualifyTimerRef.current);
    disqualifyTimerRef.current = null;
    restore(id);
    setDisqualifyPending(false);
  }

  function handleConfirmDisqualify() {
    if (disqualifyTimerRef.current) clearTimeout(disqualifyTimerRef.current);
    disqualifyTimerRef.current = null;
    disqualify(id);
    router.push("/relationships");
  }
  const isCapturing = captureStatus !== "idle" && capturingId === id;

  const justCreated = searchParams.get("just_created") === "true";
  const justCreatedName = searchParams.get("name") ?? "";

  const detail = mockAccountDetails[id];
  const mockAccount = mockAccounts.find((a) => a.id === id);
  // True for system/CRM accounts not in the rep's Halosight portfolio
  const isExternalAccount = !mockAccount;

  // For just-created companies that aren't in mock data yet, build a shell account from URL params
  const account = detail ?? mockAccount ?? (justCreated && justCreatedName
    ? { id, name: justCreatedName, type: "standalone" as const, halosightType: "prospect" as const, distanceMiles: 0, lastVisited: new Date(), taskCount: 0 }
    : undefined);

  // ── Preview states ────────────────────────────────────────────────────────
  if (preview === "loading") return <AccountDetailSkeleton />;

  if (preview === "error") {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <button onClick={() => router.push("/relationships")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
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
      <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <button onClick={() => router.push("/relationships")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
        </div>
        <ErrorState
          title="Relationship not found"
          message="This account doesn't exist or may have been removed."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-4">

        {/* Back button row */}
        <div className="flex items-center mb-3">
          <button onClick={() => router.push("/relationships")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
        </div>

        {/* Account name */}
        <h1
          className="w-full text-center text-[26px] font-bold leading-tight px-10 mb-2"
          style={{
            color: "var(--md-sys-color-text-primary)",
            fontFamily: "Roboto Slab, Georgia, serif",
          }}
        >
          {account.name}
        </h1>

        {/* Account metadata — address */}
        {account.address && (
          <div className="flex items-center justify-center gap-1 mb-3">
            <Icon name="location_on" size={13} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "var(--md-sys-color-text-muted)" }}>
              {account.address}
            </span>
          </div>
        )}

        {/* Lead badge + disqualify — prospects only */}
        {account.halosightType === "prospect" && !justCreated && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <span
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: "rgba(107, 157, 176, 0.18)", color: "var(--md-sys-color-brand-teal)" }}
            >
              Lead
            </span>
            <button
              onClick={handleDisqualify}
              className="text-sm active:opacity-60 transition-opacity"
              style={{ color: "var(--md-sys-color-brand-coral)" }}
            >
              Disqualify
            </button>
          </div>
        )}

        {/* Unowned account banner — shown for system/CRM accounts not owned by the current rep */}
        {isExternalAccount && !justCreated && (() => {
          const repName = systemAccountReps[account.id];
          const message = repName
            ? `You're viewing ${repName}'s account — notes you capture here will be visible to them.`
            : "This account isn't assigned to a rep — notes you capture here will be visible to your team.";
          return (
            <div
              className="flex items-start gap-2.5 px-3.5 py-3 mb-3 mx-1"
              style={{
                background: "rgba(139, 146, 255, 0.08)",
                border: "1px solid rgba(139, 146, 255, 0.18)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <Icon name="info" size={15} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0, marginTop: 1 }} />
              <span className="text-[12px] leading-snug" style={{ color: "var(--md-sys-color-text-secondary)" }}>
                {message}
              </span>
            </div>
          );
        })()}

        {/* Tabs — hidden on just-created blank slate */}
        {!justCreated && <div
          className="flex p-1 gap-1 mx-auto"
          style={{ width: 255, background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-full)" }}
        >
          {(["overview", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-semibold transition-all capitalize"
              style={{
                borderRadius: "var(--radius-full)",
                background: activeTab === tab ? "var(--md-sys-color-dark-secondary)" : "transparent",
                color: activeTab === tab ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>}
      </div>

      {/* Just-created empty state — replaces tabs entirely */}
      {justCreated && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center">
          <Icon name="auto_awesome" size={32} style={{ color: "var(--md-sys-color-neonindigo)", marginBottom: 20 }} />
          <h2
            style={{
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize: 22, fontWeight: 700,
              color: "var(--md-sys-color-text-primary)",
              lineHeight: 1.25, marginBottom: 12,
            }}
          >
            And just like that,<br />{account.name} exists.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--md-sys-color-text-muted)", maxWidth: 280 }}>
            No visits yet. No notes. Nothing to sync to the CRM. Just potential, a blank slate, and nowhere to go but up.
          </p>
        </div>
      )}

      {/* Tab content — pb accounts for capture button + BottomNav */}
      {!justCreated && <div className="flex-1 overflow-y-auto pb-24">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="px-4 pb-4">
            {/* Detail-only sections */}
            {detail ? (
              <>
                <section className="mb-6">
                  <h2 className="heading-6 mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>
                    Last Time
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: "var(--md-sys-color-text-muted)" }}>
                    {detail.lastVisitSummary}
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="heading-6 mb-3" style={{ color: "var(--md-sys-color-text-primary)" }}>
                    Ideas for this Time
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {detail.ideasForThisTime.map((idea, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 mt-[10px] w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--md-sys-color-text-muted)" }}
                        />
                        <span className="text-base leading-relaxed" style={{ color: "var(--md-sys-color-text-muted)" }}>
                          {idea}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <div className="py-8 text-center mb-2">
                <p className="text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                  No overview available yet.
                  <br />
                  Capture your first meeting to generate insights.
                </p>
              </div>
            )}

            {/* Action Items — always visible regardless of detail */}
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
                    <Link key={item.id} href={`/relationships/${id}/action-items/${item.id}?from=account`}>
                      <ActionItemCard item={item} onComplete={() => handleComplete(item.id)} pending={pendingItemId === item.id} />
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
                    style={{
                      background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 15%, transparent)",
                    }}
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
        )}

        {/* Activity */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {detail?.recentActivity?.length ? (
              detail.recentActivity.map((item) => (
                <ActivityCard key={item.id} item={item} accountId={id} isExternal={isExternalAccount} />
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                  No activity recorded yet.
                </p>
              </div>
            )}
          </div>
        )}

      </div>}

      {/* Log a Visit CTA — hidden while a capture is active for this account */}
      {!isCapturing && (
        <div
          className="absolute left-0 right-0 flex justify-center px-4"
          style={{ bottom: 32 }}
        >
          <button
            onClick={() => startCapture(id, account.name)}
            className="h-11 px-6 font-semibold text-[14px] flex items-center gap-2 transition-opacity active:opacity-80"
            style={{
              background: "var(--md-sys-color-brand-coral)",
              color: "var(--md-sys-color-text-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Icon name="border_color" size={16} style={{ color: "var(--md-sys-color-text-primary)" }} />
            Log a Visit
          </button>
        </div>
      )}

      {/* Add Action Item Sheet */}
      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

      {/* Completion toast */}
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

      {/* Disqualify toast */}
      {typeof document !== "undefined" && document.getElementById("phone-overlay-root") && createPortal(
        <AnimatePresence>
          {disqualifyPending && (
            <motion.div
              key="disqualify-toast"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                position: "absolute",
                bottom: 106,
                left: 16,
                right: 16,
                zIndex: 60,
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  background: "var(--md-sys-color-dark-secondary)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--md-sys-color-dark-tertiary)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)",
                  padding: "12px 16px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(107, 157, 176, 0.20)" }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--md-sys-color-brand-teal)" }} />
                  </div>
                  <span className="flex-1 text-sm font-semibold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                    Lead disqualified
                  </span>
                  <button
                    onClick={handleUndoDisqualify}
                    className="text-sm font-semibold active:opacity-60 transition-opacity"
                    style={{ color: "var(--md-sys-color-neonindigo)" }}
                  >
                    undo
                  </button>
                  <button
                    onClick={handleConfirmDisqualify}
                    className="ml-1 flex items-center justify-center active:opacity-60 transition-opacity"
                    style={{ color: "var(--md-sys-color-text-muted)" }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("phone-overlay-root")!
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
