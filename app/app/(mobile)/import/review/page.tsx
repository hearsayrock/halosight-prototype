"use client";

/**
 * FLUTTER HANDOFF: ImportReviewScreen
 * Route: /import/review
 * The single user-decision screen. Back navigable (close returns to entry point).
 * Widget: StatefulWidget
 * State: expandedGroups, moved, showAllAccounts, toastVisible — via SalesforceContext
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-primary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-dark-base, --md-sys-color-alpha-white-10,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-neonindigo, --md-sys-color-brand-teal,
 *         --md-sys-color-warning, --radius-md, --radius-lg, --radius-full
 * Flutter equivalent: import_review_page.dart
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import Icon from "@/components/ui/Icon";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useSalesforce, type ActivityDestination } from "@/lib/context/SalesforceContext";
import { mockAnalysis } from "@/lib/mock-data/salesforce";

const TYPE_SAMPLES: Record<string, { subject: string; account: string; date: string }> = {
  Task: { subject: "Send Q3 pricing and updated deck", account: "Jack's Tire & Oil", date: "Aug 12" },
  Call: { subject: "Checked in on fleet renewal timeline", account: "Midtown Chevrolet", date: "Aug 8" },
  "Site Audit": { subject: "Annual safety audit — east lot", account: "Summit Auto Group", date: "Jul 28" },
  "Route Check": { subject: "Route 9 corridor visit", account: "Route 9 Motors", date: "Aug 5" },
};

const DEST_OPTS: { value: ActivityDestination; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "task", label: "Action item" },
  { value: "skip", label: "Leave out" },
];

const DEST_ICON: Record<ActivityDestination, string> = {
  note: "sticky_note_2",
  task: "checklist",
  skip: "block",
};

const DEST_COLOR: Record<ActivityDestination, string> = {
  note: "var(--md-sys-color-neonindigo)",
  task: "var(--md-sys-color-brand-teal)",
  skip: "var(--md-sys-color-text-disabled)",
};

const DEST_LABEL: Record<ActivityDestination, string> = {
  note: "Account notes",
  task: "Action items",
  skip: "Left out",
};

const DEST_SUB: Record<ActivityDestination, string> = {
  note: "History you can read before a visit",
  task: "Open items assigned to you",
  skip: "No account attached in Salesforce",
};

function DestinationMovedToast({
  moved,
  onUndo,
  onDismiss,
}: {
  moved: { typeName: string; from: ActivityDestination; to: ActivityDestination };
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const overlayRoot = typeof document !== "undefined" ? document.getElementById("phone-overlay-root") : null;
  if (!overlayRoot) return null;

  return createPortal(
    <motion.div
      key="moved-toast"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        position: "absolute",
        bottom: 200,
        left: 16,
        right: 16,
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "var(--md-sys-color-dark-tertiary)",
          border: "1px solid var(--md-sys-color-alpha-white-18)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name="swap_horiz" size={18} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13.5, color: "var(--md-sys-color-text-primary)" }}>
          {moved.typeName} now comes in as {DEST_LABEL[moved.to].toLowerCase()}
        </span>
        <button onClick={onUndo} className="active:opacity-60 transition-opacity">
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}>Undo</span>
        </button>
        <button onClick={onDismiss} className="active:opacity-60 transition-opacity ml-1">
          <Icon name="close" size={16} style={{ color: "var(--md-sys-color-text-disabled)" }} />
        </button>
      </div>
    </motion.div>,
    overlayRoot
  );
}

function DismissExceptionsToast({ onUndo }: { onUndo: () => void }) {
  const overlayRoot = typeof document !== "undefined" ? document.getElementById("phone-overlay-root") : null;
  if (!overlayRoot) return null;
  return createPortal(
    <motion.div
      key="dismiss-toast"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ position: "absolute", bottom: 200, left: 16, right: 16, zIndex: 60, pointerEvents: "auto" }}
    >
      <div style={{
        background: "var(--md-sys-color-dark-tertiary)",
        border: "1px solid var(--md-sys-color-alpha-white-18)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <Icon name="auto_awesome" size={18} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13.5, color: "var(--md-sys-color-text-primary)" }}>
          Treating these as account notes
        </span>
        <button onClick={onUndo} className="active:opacity-60 transition-opacity">
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}>Undo</span>
        </button>
      </div>
    </motion.div>,
    overlayRoot
  );
}

export default function ImportReviewPage() {
  const router = useRouter();
  const {
    analysis,
    review,
    setReviewAnswer,
    toggleGroupExpanded,
    toggleAccountExclusion,
    toggleShowAllAccounts,
    setMoved,
    clearMoved,
  } = useSalesforce();

  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showExceptions, setShowExceptions] = useState(false);

  const [dismissedTypeNames, setDismissedTypeNames] = useState<string[]>([]);
  const [dismissToastVisible, setDismissToastVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = analysis ?? mockAnalysis;

  // Derived counts
  const answers = review.answers;
  const activityTypes = data.activityTypes;

  function resolvedDest(t: typeof activityTypes[number]): ActivityDestination {
    if (answers[t.name]) return answers[t.name] as ActivityDestination;
    if (dismissedTypeNames.includes(t.name)) return "note";
    return (t.recommended ?? "note") as ActivityDestination;
  }

  const noteCount = activityTypes.filter((t) => resolvedDest(t) === "note").reduce((s, t) => s + t.count, 0);
  const taskCount = activityTypes.filter((t) => resolvedDest(t) === "task").reduce((s, t) => s + t.count, 0);
  const skipCount = activityTypes.filter((t) => resolvedDest(t) === "skip").reduce((s, t) => s + t.count, 0) + data.unlinkedCount;

  const unresolvedTypes = activityTypes.filter((t) => !t.confident && !answers[t.name] && !dismissedTypeNames.includes(t.name));
  const hasUnresolved = unresolvedTypes.length > 0;

  function handleDismissExceptions() {
    setDismissedTypeNames(unresolvedTypes.map((t) => t.name));
    setDismissToastVisible(true);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setDismissToastVisible(false), 5000);
  }

  function handleUndoDismiss() {
    setDismissedTypeNames([]);
    setDismissToastVisible(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }
  const totalActivity = noteCount + taskCount + skipCount;
  const netImport = noteCount + taskCount;

  function destCountFor(dest: ActivityDestination) {
    if (dest === "note") return noteCount;
    if (dest === "task") return taskCount;
    return skipCount;
  }

  function handleDestChange(typeName: string, newDest: ActivityDestination) {
    const oldDest = (answers[typeName] ?? activityTypes.find(t => t.name === typeName)?.recommended ?? "note") as ActivityDestination;
    if (oldDest === newDest) return;
    setReviewAnswer(typeName, newDest);
    setMoved({ typeName, from: oldDest, to: newDest });
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      clearMoved();
    }, 5000);
    // Auto-expand destination
    toggleGroupExpanded(newDest);
  }

  function handleUndo() {
    if (!review.moved) return;
    setReviewAnswer(review.moved.typeName, review.moved.from);
    clearMoved();
    setToastVisible(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }, []);

  const SHOWN_ACCOUNTS = 6;
  const accounts = data.accounts;
  const visibleAccounts = review.showAllAccounts ? accounts : accounts.slice(0, SHOWN_ACCOUNTS);
  const remaining = accounts.length - SHOWN_ACCOUNTS;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ flexShrink: 0 }}>
        <button onClick={() => router.back()} className="p-1 active:opacity-60 transition-opacity">
          <Icon name="close" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-secondary)" }}>
          Import from Salesforce
        </span>
        <div style={{ width: 30 }} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4">

          {/* Title + sub */}
          <h1 style={{ fontSize: 27, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)", lineHeight: 1.2, marginBottom: 6 }}>
            Here's what we found
          </h1>
          <p style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)", marginBottom: 20 }}>
            From your Salesforce activity since Jun 25.
          </p>

          {/* Stat cards */}
          <div className="flex gap-3 mb-4">
            {[
              { value: data.accounts.length, label: "accounts" },
              { value: totalActivity - data.unlinkedCount, label: "activities" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 flex flex-col items-center justify-center py-4"
                style={{
                  background: "var(--md-sys-color-dark-primary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--md-sys-color-alpha-white-10)",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--md-sys-color-text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* How it comes in */}
          <button
            onClick={() => hasUnresolved && setShowExceptions((v) => !v)}
            className="mb-2 active:opacity-60 transition-opacity"
            style={{ display: "block" }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--md-sys-color-text-muted)" }}>
              How it comes in
            </span>
          </button>

          {/* Destination rows */}
          <div
            style={{
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {(["note", "task", "skip"] as ActivityDestination[]).map((dest, di) => {
              const expanded = !!review.expandedGroups[dest];
              const count = destCountFor(dest);
              const typesInDest = activityTypes.filter((t) => {
                const ans = answers[t.name] ?? t.recommended ?? "note";
                return ans === dest;
              });
              const movedHere = review.moved?.to === dest ? review.moved : null;
              const movedAway = review.moved?.from === dest ? review.moved : null;

              return (
                <div key={dest} style={{ borderBottom: di < 2 ? "1px solid var(--md-sys-color-alpha-white-10)" : undefined }}>
                  <button
                    onClick={() => toggleGroupExpanded(dest)}
                    className="w-full flex items-center gap-3 px-4 active:opacity-70 transition-opacity"
                    style={{ height: 56 }}
                  >
                    <Icon name={DEST_ICON[dest]} size={22} style={{ color: DEST_COLOR[dest], flexShrink: 0 }} />
                    <div className="flex-1 text-left min-w-0">
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                        {DEST_LABEL[dest]}
                      </div>
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: DEST_COLOR[dest], marginRight: 8, flexShrink: 0 }}>
                      {count}
                    </span>
                    <Icon
                      name={expanded ? "expand_less" : "expand_more"}
                      size={20}
                      style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }}
                    />
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        key={`${dest}-expanded`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

                          {/* Account note preview */}
                          {dest === "note" && (
                            <>
                              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--md-sys-color-text-muted)", margin: "4px 0 -2px" }}>
                                Example
                              </p>
                              <div style={{ background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-md)", padding: "16px 16px 14px" }}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--md-sys-color-text-primary)", lineHeight: 1.35, margin: 0 }}>
                                    Sandra confirmed we're the frontrunner in their vendor eval — timeline is the sticking point
                                  </p>
                                  <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
                                </div>
                                <p style={{ fontSize: 13.5, color: "var(--md-sys-color-text-muted)", lineHeight: 1.45, margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                                  Sandra shared that we're the frontrunner in their vendor evaluation. Budget approved, timeline is the sticking point.
                                </p>
                                <p style={{ fontSize: 12, color: "var(--md-sys-color-text-disabled)", margin: 0 }}>
                                  Jul 27, 10:00 AM · 50 mins
                                </p>
                              </div>
                            </>
                          )}

                          {/* Action item preview */}
                          {dest === "task" && (
                            <>
                              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--md-sys-color-text-muted)", margin: "4px 0 -2px" }}>
                                Example
                              </p>
                              <div style={{ background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-md)", padding: "14px 16px", border: "1px solid var(--md-sys-color-alpha-white-10)" }}>
                                <div className="flex items-center gap-3">
                                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
                                  <div className="flex-1 min-w-0">
                                    <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", margin: "0 0 5px" }}>
                                      Send phased rollout options doc
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                      <Icon name="calendar_today" size={12} style={{ color: "var(--md-sys-color-neonindigo)" }} />
                                      <span style={{ fontSize: 12.5, color: "var(--md-sys-color-neonindigo)" }}>August 28</span>
                                    </div>
                                  </div>
                                  <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Left out notice */}
                          {dest === "skip" && data.unlinkedCount > 0 && (
                            <div
                              style={{
                                background: "var(--md-sys-color-dark-primary)",
                                borderRadius: "var(--radius-md)",
                                padding: "12px 14px",
                              }}
                            >
                              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 4 }}>
                                No account attached
                              </div>
                              <div style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.5 }}>
                                {data.unlinkedCount} activities aren't linked to an account in Salesforce. Link them there and import again.
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Accounts container */}
          <div
            style={{
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => toggleGroupExpanded("accounts")}
              className="w-full flex items-center gap-3 px-4 active:opacity-70 transition-opacity"
              style={{ height: 56 }}
            >
              <Icon name="domain" size={22} style={{ color: "var(--md-sys-color-brand-teal)", flexShrink: 0 }} />
              <div className="flex-1 text-left min-w-0">
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                  Accounts coming in
                </div>
                <div style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                  {review.excludedAccountIds.length === 0
                    ? `All ${accounts.length}, taken from the activity we found`
                    : `${accounts.length - review.excludedAccountIds.length} of ${accounts.length} · ${review.excludedAccountIds.length * 2} activities excluded`}
                </div>
              </div>
              <Icon
                name={review.expandedGroups.accounts ? "expand_less" : "expand_more"}
                size={20}
                style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }}
              />
            </button>

            <AnimatePresence>
              {review.expandedGroups.accounts && (
                <motion.div
                  key="accounts-expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ borderTop: "1px solid var(--md-sys-color-alpha-white-10)" }}>
                    {visibleAccounts.map((acct) => {
                      const excluded = review.excludedAccountIds.includes(acct.id);
                      return (
                        <button
                          key={acct.id}
                          onClick={() => toggleAccountExclusion(acct.id)}
                          className="w-full flex items-center gap-3 px-4 active:opacity-70 transition-opacity"
                          style={{ height: 52, borderBottom: "1px solid var(--md-sys-color-alpha-white-10)" }}
                        >
                          <Icon
                            name={excluded ? "check_box_outline_blank" : "check_box"}
                            size={20}
                            style={{ color: excluded ? "var(--md-sys-color-text-disabled)" : "var(--md-sys-color-neonindigo)", flexShrink: 0 }}
                          />
                          <div className="flex-1 text-left min-w-0">
                            <div style={{ fontSize: 14.5, fontWeight: 600, color: excluded ? "var(--md-sys-color-text-muted)" : "var(--md-sys-color-text-primary)", marginBottom: 1 }}>
                              {acct.name}
                            </div>
                            <div style={{ fontSize: 12.5, color: "var(--md-sys-color-text-muted)" }}>
                              {acct.activityCount} activities · visited {acct.visitedDaysAgo}d ago
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {accounts.length > SHOWN_ACCOUNTS && (
                      <button
                        onClick={toggleShowAllAccounts}
                        className="w-full flex items-center justify-center py-3 active:opacity-70 transition-opacity"
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}>
                          {review.showAllAccounts
                            ? "Show fewer"
                            : `Show the other ${remaining} accounts`}
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exception row — below everything else, toggled via eyebrow */}
          {hasUnresolved && showExceptions && (
            <div
              className="flex items-start gap-3 mb-4"
              style={{
                background: "rgba(245,166,35,0.08)",
                border: "1px solid rgba(245,166,35,0.35)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => router.push("/import/question")}
                className="flex items-center gap-3 flex-1 text-left active:opacity-70 transition-opacity min-w-0"
                style={{ paddingLeft: 16, paddingTop: 14, paddingBottom: 14, paddingRight: 8 }}
              >
                <Icon name="help" size={20} style={{ color: "var(--md-sys-color-warning)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 3 }}>
                    {unresolvedTypes.length} activity {unresolvedTypes.length === 1 ? "type needs" : "types need"} your call
                  </div>
                  <div style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                    {unresolvedTypes.map((t) => t.name).join(" and ")} ({unresolvedTypes.reduce((s, t) => s + t.count, 0)} activities)
                  </div>
                </div>
                <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
              </button>
              <button
                onClick={handleDismissExceptions}
                className="flex items-center justify-center self-stretch px-4 active:opacity-60 transition-opacity"
                style={{ borderLeft: "1px solid rgba(245,166,35,0.2)" }}
                aria-label="Dismiss"
              >
                <Icon name="close" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Sticky footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px 28px",
          borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
          background: "var(--md-sys-color-background)",
        }}
      >
        <button
          onClick={() => !(hasUnresolved && showExceptions) && router.push("/import/importing")}
          className="w-full flex items-center justify-center active:scale-[.97] transition-transform"
          style={{
            height: 50,
            borderRadius: "var(--radius-full)",
            background: hasUnresolved && showExceptions ? "var(--md-sys-color-dark-secondary)" : "var(--md-sys-color-neonindigo)",
            color: hasUnresolved && showExceptions ? "var(--md-sys-color-text-disabled)" : "var(--md-sys-color-text-primary)",
            fontSize: 16,
            fontWeight: 600,
            cursor: hasUnresolved && showExceptions ? "default" : "pointer",
          }}
        >
          {hasUnresolved && showExceptions
            ? `${unresolvedTypes.length} ${unresolvedTypes.length === 1 ? "type needs" : "types need"} a quick decision`
            : `Import ${netImport} activities`}
        </button>
      </div>

      {/* Destination-move toast */}
      <AnimatePresence>
        {toastVisible && review.moved && (
          <DestinationMovedToast
            moved={review.moved}
            onUndo={handleUndo}
            onDismiss={() => { setToastVisible(false); clearMoved(); }}
          />
        )}
      </AnimatePresence>

      {/* Dismiss-exceptions toast */}
      <AnimatePresence>
        {dismissToastVisible && (
          <DismissExceptionsToast onUndo={handleUndoDismiss} />
        )}
      </AnimatePresence>
    </div>
  );
}
