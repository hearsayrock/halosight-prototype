"use client";

/**
 * FLUTTER HANDOFF: CombinedHomeAccountsScreen
 * Route: /accounts
 * Playground: account-prospecting — exploring a single home screen that
 *             merges today's tasks + accounts list, with a slide-in
 *             Engagements drawer replacing the bottom nav.
 *
 * Widget: StatefulWidget
 * State: searchQuery, sortOption, systemSearchState, drawerOpen
 *
 * ENGAGEMENTS DRAWER
 *   Opens on hamburger tap. Slides in from the left. Shows recently
 *   logged activities grouped by "Today" and "Previous." Portals into
 *   #phone-overlay-root so it layers above the page content.
 *
 * ADVANCED SEARCH (same as before)
 *   Zero-result prompt → "Search all Halosight accounts" → system results
 *   + "Create new account" CTA at bottom.
 *
 * Flutter notes:
 *   - Drawer: use Scaffold.drawer with a custom DrawerTheme
 *   - Tasks strip: SliverToBoxAdapter above the SliverList of accounts
 *   - System search: separate API endpoint, show CircularProgressIndicator
 */

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AccountListItem from "@/components/accounts/AccountListItem";
import SystemAccountListItem from "@/components/accounts/SystemAccountListItem";
import SortMenu from "@/components/accounts/SortMenu";
import Icon from "@/components/ui/Icon";
import { AccountListSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import CompletionToast from "@/components/ui/CompletionToast";
import MenuIcon from "@/components/ui/MenuIcon";
import { mockAccounts } from "@/lib/mock-data/accounts";
import { mockSystemAccounts, systemAccountReps } from "@/lib/mock-data/system-accounts";
import { mockTasks, mockActivities } from "@/lib/mock-data/home";
import type { HomeTask, HomeActivity } from "@/lib/mock-data/home";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { useCapture } from "@/lib/context/CaptureContext";
import type { Account, SortOption } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function sortAccounts(accounts: Account[], sort: SortOption) {
  return [...accounts].sort((a, b) => {
    switch (sort) {
      case "alphabetical": return a.name.localeCompare(b.name);
      case "distance":     return a.distanceMiles - b.distanceMiles;
      case "lastVisited":  return b.lastVisited.getTime() - a.lastVisited.getTime();
      case "company":      return (a.parentId ?? a.id).localeCompare(b.parentId ?? b.id);
      default:             return 0;
    }
  });
}

function searchAccounts(accounts: Account[], q: string) {
  const lower = q.toLowerCase().trim();
  if (!lower) return accounts;
  return accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(lower) ||
      a.city?.toLowerCase().includes(lower) ||
      a.state?.toLowerCase().includes(lower)
  );
}

// ── Engagements drawer ────────────────────────────────────────────────────────

function EngagementRow({
  activity,
  onClose,
}: {
  activity: HomeActivity;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/accounts/${activity.accountId}/activity/${activity.activityId}`}
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-5 py-2.5 active:opacity-60 transition-opacity"
      >
        <span style={{ fontSize: 15, color: "var(--color-text-primary)", fontWeight: 400 }}>
          {activity.accountName}
        </span>
        {/* Dot indicator — shown when the activity has meaningful content */}
        <span style={{ fontSize: 8, color: "var(--color-brand-purple)", lineHeight: 1 }}>
          ●
        </span>
      </div>
    </Link>
  );
}

function EngagementsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const todayActivities = mockActivities.filter((a) => isToday(a.date));
  const previousActivities = mockActivities.filter((a) => !isToday(a.date));

  const overlay = (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 200,
              pointerEvents: "auto",
            }}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0, 0.18, 1] }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "78%",
              background: "var(--color-dark-primary)",
              borderRight: "1px solid var(--color-dark-tertiary)",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              pointerEvents: "auto",
            }}
          >
            {/* Header */}
            <div style={{ padding: "56px 20px 12px" }}>
              <p style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                margin: 0,
              }}>
                Engagements
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--color-dark-tertiary)", marginBottom: 16 }} />

            {/* Today */}
            {todayActivities.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-brand-teal)",
                  padding: "0 20px 4px",
                  margin: 0,
                }}>
                  Today
                </p>
                {todayActivities.map((a) => (
                  <EngagementRow key={a.id} activity={a} onClose={onClose} />
                ))}
              </div>
            )}

            {/* Previous */}
            {previousActivities.length > 0 && (
              <div style={{ marginTop: todayActivities.length > 0 ? 12 : 0 }}>
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-brand-teal)",
                  padding: "0 20px 4px",
                  margin: 0,
                }}>
                  Previous
                </p>
                {previousActivities.map((a) => (
                  <EngagementRow key={a.id} activity={a} onClose={onClose} />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Portal into the phone overlay root
  if (typeof window === "undefined") return null;
  const root = document.getElementById("phone-overlay-root");
  if (!root) return null;
  return createPortal(overlay, root);
}

// ── Task row (compact) ────────────────────────────────────────────────────────

function formatTaskDue(dueDate: Date | null): string {
  if (!dueDate) return "Today";
  return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskStrip({
  tasks,
  pendingId,
  onCheck,
}: {
  tasks: HomeTask[];
  pendingId: string | null;
  onCheck: (task: HomeTask) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span style={{
          fontSize: 11, fontWeight: 700,
          letterSpacing: "0.07em", textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}>
          Top Priorities
        </span>
        <Link href="/tasks" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brand-purple)" }}>
          View all
        </Link>
      </div>

      <div style={{
        background: "var(--color-dark-secondary)",
        borderRadius: 16,
        overflow: "hidden",
      }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.slice(0, 3).map((task, i) => {
            const isPending = task.id === pendingId;
            const isToday = task.dueDate === null;
            const isLast = i === Math.min(tasks.length, 3) - 1;
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24 }}
                className="flex items-center gap-3 px-3.5 py-3 relative"
              >
                {!isLast && (
                  <div className="absolute bottom-0 left-3 right-3"
                    style={{ height: 1, background: "var(--color-dark-tertiary)" }} />
                )}
                {/* Check circle */}
                <button
                  onClick={() => onCheck(task)}
                  className="flex-shrink-0 w-5 h-5 rounded-full relative active:scale-90 transition-transform"
                >
                  <div className="absolute inset-0 rounded-full"
                    style={{ border: `1.5px solid ${isPending ? "#2ECC71" : "var(--color-text-disabled)"}` }} />
                  {isPending && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{ background: "#2ECC71" }}>
                      <Icon name="check" size={11} style={{ color: "#fff" }} />
                    </div>
                  )}
                </button>
                {/* Task info */}
                <Link
                  href={`/accounts/${task.accountId}/action-items/${task.itemId}`}
                  className="flex-1 min-w-0"
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span style={{
                      fontSize: 11,
                      color: isToday ? "var(--color-brand-coral)" : "var(--color-text-disabled)",
                      fontWeight: 500,
                    }}>
                      {formatTaskDue(task.dueDate)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-text-disabled)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-disabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {task.accountName}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-disabled)", background: "var(--color-dark-secondary)", borderRadius: 10, padding: "1px 7px" }}>
        {count}
      </span>
    </div>
  );
}

function SystemSearchSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5">
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton-bone" style={{ width: "60%", height: 14 }} />
            <div className="skeleton-bone" style={{ width: "40%", height: 11 }} />
            <div className="skeleton-bone" style={{ width: "50%", height: 11 }} />
          </div>
          <div className="skeleton-bone" style={{ width: 56, height: 20, borderRadius: 10 }} />
        </div>
      ))}
    </div>
  );
}

function CreateAccountCTA({ query }: { query: string }) {
  return (
    <div className="px-4 py-5">
      <button
        className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity"
        style={{ background: "var(--color-dark-secondary)", borderRadius: "var(--radius-xl)", border: "1px dashed var(--color-dark-tertiary)" }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--color-brand-coral) 15%, transparent)" }}>
          <Icon name="add" size={18} style={{ color: "var(--color-brand-coral)" }} />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Create new account
            {query.trim() && <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> — "{query.trim()}"</span>}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Add to Halosight and start capturing
          </p>
        </div>
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type SystemSearchState = "idle" | "loading" | "done";

function CombinedPageContent() {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Accounts search
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("alphabetical");
  const [systemState, setSystemState] = useState<SystemSearchState>("idle");
  const [systemResults, setSystemResults] = useState<Account[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tasks
  const { getItems, updateItem } = useActionItems();
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableTasks = mockTasks.filter((t) => !completedTaskIds.includes(t.id));

  function handleCheck(task: HomeTask) {
    if (pendingTaskId) return;
    setPendingTaskId(task.id);
    timerRef.current = setTimeout(() => {
      const item = getItems(task.accountId).find((i) => i.id === task.itemId);
      if (item) updateItem(task.accountId, { ...item, status: "done" });
      setCompletedTaskIds((prev) => [...prev, task.id]);
      setPendingTaskId(null);
    }, 5000);
  }

  function handleUndo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPendingTaskId(null);
  }

  // Reset system search on query change
  useEffect(() => {
    setSystemState("idle");
    setSystemResults([]);
  }, [query]);

  const myFiltered = useMemo(() => sortAccounts(searchAccounts(mockAccounts, query), sort), [query, sort]);
  const hasQuery = query.trim().length > 0;

  function triggerSystemSearch() {
    setSystemState("loading");
    setSystemResults([]);
    searchTimerRef.current = setTimeout(() => {
      setSystemResults(searchAccounts(mockSystemAccounts, query));
      setSystemState("done");
    }, 700);
  }

  const showSystemSection = systemState === "loading" || systemState === "done";

  return (
    <div className="relative flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="active:opacity-60 transition-opacity p-1"
          aria-label="Engagements"
        >
          <MenuIcon size={24} />
        </button>

        <h1 style={{
          fontFamily: "Roboto Slab, Georgia, serif",
          fontSize: 26,
          fontWeight: 500,
          color: "var(--color-text-primary)",
          margin: 0,
          lineHeight: 1.15,
          flex: 1,
          textAlign: "center",
          padding: "0 12px",
        }}>
          {greeting()}, Nate
        </h1>

        <Link href="/profile">
          <button className="active:opacity-60 transition-opacity" aria-label="Profile">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-dark-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
                  stroke="var(--color-text-muted)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </Link>
      </div>

      {/* Search bar — above everything */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl"
          style={{
            background: "var(--color-dark-secondary)",
            outline: showSystemSection ? "1.5px solid var(--color-brand-purple)" : "none",
          }}>
          <Icon name="search" size={18} style={{ color: showSystemSection ? "var(--color-brand-purple)" : "var(--color-text-muted)", flexShrink: 0, transition: "color 0.2s" }} />
          <input
            type="text"
            placeholder={showSystemSection ? "Searching all accounts…" : "Search accounts or priorities"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          {showSystemSection && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-brand-purple)", background: "rgba(139,146,255,0.12)", borderRadius: 6, padding: "2px 6px", flexShrink: 0, whiteSpace: "nowrap" }}>
              ALL
            </span>
          )}
          {query && (
            <button onClick={() => setQuery("")} className="active:opacity-60 flex-shrink-0">
              <Icon name="cancel" fill size={16} style={{ color: "var(--color-text-disabled)" }} />
            </button>
          )}
        </div>
        <SortMenu current={sort} onChange={setSort} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-12">

        {/* Preview states */}
        {preview === "loading" && <AccountListSkeleton rows={6} />}
        {preview === "error" && (
          <ErrorState title="Couldn't load accounts" message="We had trouble reaching the server. Check your connection and try again." onRetry={() => {}} />
        )}

        {!preview && (
          <>
            {/* Task strip */}
            <TaskStrip tasks={availableTasks} pendingId={pendingTaskId} onCheck={handleCheck} />

            {/* Accounts section label */}
            {!showSystemSection && <SectionHeader label="Accounts" count={myFiltered.length} />}
            {showSystemSection && <SectionHeader label="Your Accounts" count={myFiltered.length} />}

            {myFiltered.length > 0 ? (
              <div className="flex flex-col">
                {myFiltered.map((account, i) => (
                  <AccountListItem key={account.id} account={account} isLast={i === myFiltered.length - 1} />
                ))}
              </div>
            ) : hasQuery ? (
              <div className="mx-4 mt-2 rounded-2xl flex flex-col items-center gap-4 px-5 py-6"
                style={{ background: "var(--color-dark-secondary)" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(139,146,255,0.12)" }}>
                  <Icon name="search_off" size={22} style={{ color: "var(--color-brand-purple)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Not in your accounts</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>"{query}" didn't match anything assigned to you.</p>
                </div>
                {systemState === "idle" && (
                  <button onClick={triggerSystemSearch}
                    className="w-full h-10 rounded-xl font-semibold text-sm active:opacity-80 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: "rgba(139,146,255,0.15)", border: "1px solid rgba(139,146,255,0.3)", color: "var(--color-brand-purple)" }}>
                    <Icon name="public" size={16} style={{ color: "var(--color-brand-purple)" }} />
                    Search all Halosight accounts
                  </button>
                )}
              </div>
            ) : null}

            {hasQuery && myFiltered.length > 0 && systemState === "idle" && (
              <button onClick={triggerSystemSearch}
                className="mx-4 mt-2 mb-1 h-9 rounded-xl text-xs font-semibold active:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
                style={{ background: "transparent", border: "1px solid var(--color-dark-tertiary)", color: "var(--color-text-muted)" }}>
                <Icon name="public" size={13} style={{ color: "var(--color-text-muted)" }} />
                Also search all Halosight accounts
              </button>
            )}

            {/* System accounts */}
            {showSystemSection && (
              <div className="mt-4">
                <div className="mx-4 mb-1" style={{ height: 1, background: "var(--color-dark-tertiary)" }} />
                {systemState === "loading" && (
                  <>
                    <SectionHeader label="All Halosight Accounts" count={0} />
                    <SystemSearchSkeleton />
                  </>
                )}
                {systemState === "done" && (
                  <>
                    <SectionHeader label="All Halosight Accounts" count={systemResults.length} />
                    {systemResults.length > 0 ? (
                      <div className="flex flex-col">
                        {systemResults.map((account, i) => (
                          <SystemAccountListItem
                            key={account.id}
                            account={account}
                            assignedRep={systemAccountReps[account.id] ?? "Unknown"}
                            isLast={i === systemResults.length - 1}
                            onSelect={(a) => { window.location.href = `/accounts/${a.id}`; }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>Not found anywhere in Halosight.</p>
                      </div>
                    )}
                    <CreateAccountCTA query={query} />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Engagements drawer */}
      <EngagementsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Completion toast */}
      <CompletionToast
        visible={pendingTaskId !== null}
        bottom={24}
        onUndo={handleUndo}
        onDismiss={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          const task = mockTasks.find((t) => t.id === pendingTaskId);
          if (task) {
            const item = getItems(task.accountId).find((i) => i.id === task.itemId);
            if (item) updateItem(task.accountId, { ...item, status: "done" });
            setCompletedTaskIds((prev) => [...prev, task.id]);
            setPendingTaskId(null);
          }
        }}
      />
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense>
      <CombinedPageContent />
    </Suspense>
  );
}
