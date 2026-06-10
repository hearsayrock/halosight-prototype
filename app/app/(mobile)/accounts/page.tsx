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
import { useSearchParams, useRouter } from "next/navigation";
import AccountListItem from "@/components/accounts/AccountListItem";
import SystemAccountListItem from "@/components/accounts/SystemAccountListItem";
import SortMenu from "@/components/accounts/SortMenu";
import Icon from "@/components/ui/Icon";
import { AccountListSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import CompletionToast from "@/components/ui/CompletionToast";
import MenuIcon from "@/components/ui/MenuIcon";
import FilterDropdown from "@/components/ui/FilterDropdown";
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

/** Score an account so the most relevant ones surface first in the collapsed view. */
function scoreAccount(a: Account): number {
  let score = 0;
  // Pending tasks are the strongest signal
  score += (a.taskCount ?? 0) * 30;
  // Recency: up to 20 pts for recently visited (decays over 20 days)
  const daysSince = (Date.now() - a.lastVisited.getTime()) / 86_400_000;
  score += Math.max(0, 20 - daysSince);
  // Proximity: up to 15 pts for nearby accounts
  score += Math.max(0, 15 - a.distanceMiles / 10);
  return score;
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

// ── Dashboard grid ────────────────────────────────────────────────────────────

function DashboardGrid({
  openTaskCount,
  nearestAccount,
  onStartVisit,
}: {
  openTaskCount: number;
  nearestAccount: Account;
  onStartVisit: () => void;
}) {
  const hasTasks = openTaskCount > 0;

  return (
    <div className="px-4 pb-5">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

        {/* ── Large left card: log a visit — spans both rows ── */}
        <button
          onClick={onStartVisit}
          style={{
            gridRow: "1 / 3",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: 16,
            borderRadius: 20,
            background: "linear-gradient(150deg, rgba(139,146,255,0.14) 0%, var(--color-dark-secondary) 65%)",
            border: "1px solid rgba(139,146,255,0.22)",
            minHeight: 158,
            textAlign: "left",
            cursor: "pointer",
            overflow: "hidden",
          }}
          className="active:scale-[0.97] transition-transform"
        >
          {/* Soft glow bloom top-right */}
          <div style={{
            position: "absolute", top: -24, right: -24,
            width: 110, height: 110, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,146,255,0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Icon badge — top-right */}
          <div style={{
            position: "absolute", top: 14, right: 14,
            width: 42, height: 42, borderRadius: 13,
            background: "rgba(139,146,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="mic" size={20} style={{ color: "var(--color-brand-purple)" }} />
          </div>
          {/* Text — pinned bottom-left */}
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2, margin: 0 }}>
              Log a Visit
            </p>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4, margin: "4px 0 0" }}>
              or take a note
            </p>
          </div>
        </button>

        {/* ── Top right: open tasks ── */}
        <Link href="/tasks" style={{ display: "block" }}>
          <div style={{
            padding: "13px 14px 14px",
            borderRadius: 20,
            background: hasTasks
              ? "linear-gradient(150deg, rgba(255,107,90,0.12) 0%, var(--color-dark-secondary) 70%)"
              : "var(--color-dark-secondary)",
            border: hasTasks ? "1px solid rgba(255,107,90,0.22)" : "1px solid var(--color-dark-tertiary)",
          }}
          className="active:scale-[0.97] transition-transform">
            {/* Icon badge */}
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: hasTasks ? "rgba(255,107,90,0.18)" : "rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 10,
            }}>
              <Icon name="task_alt" size={15} style={{ color: hasTasks ? "var(--color-brand-coral)" : "var(--color-text-disabled)" }} />
            </div>
            <p style={{
              fontSize: 26, fontWeight: 700, lineHeight: 1, margin: 0,
              color: hasTasks ? "var(--color-brand-coral)" : "var(--color-text-secondary)",
            }}>
              {openTaskCount}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 3 }}>
              {openTaskCount === 1 ? "open task" : "open tasks"}
            </p>
          </div>
        </Link>

        {/* ── Bottom right: nearest account ── */}
        <Link href={`/accounts/${nearestAccount.id}`} style={{ display: "block" }}>
          <div style={{
            padding: "13px 14px 14px",
            borderRadius: 20,
            background: "var(--color-dark-secondary)",
            border: "1px solid var(--color-dark-tertiary)",
          }}
          className="active:scale-[0.97] transition-transform">
            {/* Icon badge */}
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(38,198,190,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 10,
            }}>
              <Icon name="near_me" size={15} style={{ color: "var(--color-brand-teal)" }} />
            </div>
            <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2, margin: 0 }}>
              {nearestAccount.name}
            </p>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 3 }}>
              {nearestAccount.distanceMiles} mi away
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}

// ── Compact account row (collapsed top-accounts view) ─────────────────────────

function CompactAccountRow({ account, isLast }: { account: Account; isLast: boolean }) {
  const hasTask = (account.taskCount ?? 0) > 0;
  return (
    <Link href={`/accounts/${account.id}`}>
      <div className="flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity relative">
        {!isLast && (
          <div className="absolute bottom-0 left-4 right-4"
            style={{ height: 1, background: "var(--color-dark-tertiary)" }} />
        )}
        {/* Left — name + meta */}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2 }}
            className="truncate">
            {account.name}
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
            {[account.city && account.state ? `${account.city}, ${account.state}` : null,
              account.distanceMiles < 999 ? `${account.distanceMiles} mi` : null]
              .filter(Boolean).join(" · ")}
          </p>
        </div>
        {/* Right — task badge + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasTask && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,143,130,0.18)", fontSize: 11, fontWeight: 700, color: "var(--color-brand-coral-light)" }}>
              {account.taskCount} open
            </span>
          )}
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1L6 6L1 11" stroke="var(--color-text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
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
type TaskStatusFilter = "open" | "done";
type TaskSortMode = "dueDate" | "account";

type PageMode = "home" | "accounts" | "priorities";

function CombinedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preview = searchParams.get("preview");

  const { startCapture } = useCapture();

  // Page mode — derived from URL so browser back restores the expanded view
  const modeParam = searchParams.get("mode");
  const mode: PageMode = (modeParam === "accounts" || modeParam === "priorities") ? modeParam : "home";

  function goToMode(m: "accounts" | "priorities") {
    router.push(`/accounts?mode=${m}`, { scroll: false });
  }
  function goHome() {
    router.back();
  }

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Accounts search (used in accounts mode)
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("alphabetical");
  const [systemState, setSystemState] = useState<SystemSearchState>("idle");
  const [systemResults, setSystemResults] = useState<Account[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountsInputRef = useRef<HTMLInputElement>(null);

  // Priorities search (used in priorities mode)
  const [prioritiesQuery, setPrioritiesQuery] = useState("");
  const prioritiesInputRef = useRef<HTMLInputElement>(null);

  // Priorities expanded — filter + sort state
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatusFilter>("open");
  const [taskSortMode, setTaskSortMode] = useState<TaskSortMode>("dueDate");

  // Tasks
  const { getItems, updateItem, getAllItems } = useActionItems();
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

  // Reset system search when accounts query changes
  useEffect(() => {
    setSystemState("idle");
    setSystemResults([]);
  }, [query]);

  // Auto-focus the right input when switching modes
  useEffect(() => {
    if (mode === "accounts") {
      setTimeout(() => accountsInputRef.current?.focus(), 280);
    } else if (mode === "priorities") {
      setTimeout(() => prioritiesInputRef.current?.focus(), 280);
    } else {
      // Clear searches when returning home
      setQuery("");
      setPrioritiesQuery("");
      setSystemState("idle");
      setSystemResults([]);
    }
  }, [mode]);

  const myFiltered = useMemo(() => sortAccounts(searchAccounts(mockAccounts, query), sort), [query, sort]);
  const filteredTasks = useMemo(() =>
    availableTasks.filter(t =>
      !prioritiesQuery.trim() ||
      t.title.toLowerCase().includes(prioritiesQuery.toLowerCase()) ||
      t.accountName.toLowerCase().includes(prioritiesQuery.toLowerCase())
    ),
  [availableTasks, prioritiesQuery]);
  // Full task groups for the priorities expanded view
  const taskGroups = useMemo(() => {
    const ACCOUNT_NAME: Record<string, string> = Object.fromEntries(mockAccounts.map(a => [a.id, a.name]));
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const dueSortKey = (d: Date | null) => d ? d.getTime() : startOfDay.getTime();

    const all = getAllItems().filter(item =>
      taskStatusFilter === "open" ? item.status === "open" : item.status === "done" || item.status === "canceled"
    ).filter(item =>
      !prioritiesQuery.trim() ||
      item.title.toLowerCase().includes(prioritiesQuery.toLowerCase()) ||
      (ACCOUNT_NAME[item.accountId] ?? "").toLowerCase().includes(prioritiesQuery.toLowerCase())
    );

    if (taskSortMode === "account") {
      // Group by account name
      const map = new Map<string, typeof all>();
      for (const item of all) {
        const list = map.get(item.accountId) ?? [];
        list.push(item);
        map.set(item.accountId, list);
      }
      return [...map.entries()]
        .map(([accountId, items]) => ({
          label: ACCOUNT_NAME[accountId] ?? accountId,
          items: [...items].sort((a, b) => dueSortKey(a.dueDate) - dueSortKey(b.dueDate)),
          accountId,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } else {
      // Group by due date bucket
      const startOfTmrw = new Date(startOfDay.getTime() + 86_400_000);
      const startOfNextWk = new Date(startOfDay.getTime() + 7 * 86_400_000);
      const buckets: { label: string; items: typeof all }[] = [
        { label: "Today", items: [] },
        { label: "Tomorrow", items: [] },
        { label: "This Week", items: [] },
        { label: "Later", items: [] },
      ];
      for (const item of all) {
        const t = dueSortKey(item.dueDate);
        if (t < startOfTmrw.getTime()) buckets[0].items.push(item);
        else if (t < startOfTmrw.getTime() + 86_400_000) buckets[1].items.push(item);
        else if (t < startOfNextWk.getTime()) buckets[2].items.push(item);
        else buckets[3].items.push(item);
      }
      return buckets.filter(b => b.items.length > 0);
    }
  }, [getAllItems, taskStatusFilter, taskSortMode, prioritiesQuery, mockAccounts]);

  const topAccounts = useMemo(() =>
    [...mockAccounts].sort((a, b) => scoreAccount(b) - scoreAccount(a)).slice(0, 4),
  []);
  const nearestAccount = useMemo(() =>
    [...mockAccounts].sort((a, b) => a.distanceMiles - b.distanceMiles)[0],
  []);
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

  // ── Mini search pill (lives in section headers in home mode) ───────────────
  function MiniSearchPill({ onClick }: { onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          height: 28, paddingLeft: 9, paddingRight: 11,
          borderRadius: 999,
          background: "var(--color-dark-secondary)",
          border: "1px solid var(--color-dark-tertiary)",
          cursor: "pointer",
        }}
      >
        <Icon name="search" size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          Search
        </span>
      </button>
    );
  }

  // ── Profile button (reused in both header states) ──────────────────────────
  const ProfileButton = (
    <Link href="/profile">
      <button className="active:opacity-60 transition-opacity flex-shrink-0" aria-label="Profile">
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--color-dark-secondary)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
              stroke="var(--color-text-muted)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
    </Link>
  );

  return (
    <div className="relative flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3" style={{ flexShrink: 0 }}>
        <AnimatePresence mode="wait" initial={false}>
          {mode === "home" ? (
            <motion.button
              key="hamburger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(true)}
              className="active:opacity-60 transition-opacity p-1 flex-shrink-0"
              aria-label="Engagements"
            >
              <MenuIcon size={24} />
            </motion.button>
          ) : (
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              onClick={goHome}
              className="active:opacity-60 transition-opacity flex-shrink-0"
              aria-label="Back"
              style={{ padding: "4px 2px" }}
            >
              <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-secondary)" }} />
            </motion.button>
          )}
        </AnimatePresence>

        <div style={{ flex: 1, overflow: "hidden", padding: "0 10px" }}>
          <AnimatePresence mode="wait" initial={false}>
            {mode === "home" && (
              <motion.h1
                key="greeting"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: "Roboto Slab, Georgia, serif",
                  fontSize: 20, fontWeight: 500,
                  color: "var(--color-text-primary)",
                  margin: 0, lineHeight: 1.15, textAlign: "center",
                }}
              >
                {greeting()}, Nate
              </motion.h1>
            )}
            {mode === "accounts" && (
              <motion.h1
                key="accounts-title"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: "Roboto Slab, Georgia, serif",
                  fontSize: 22, fontWeight: 500,
                  color: "var(--color-text-primary)",
                  margin: 0, lineHeight: 1.15, textAlign: "center",
                }}
              >
                Accounts
              </motion.h1>
            )}
            {mode === "priorities" && (
              <motion.h1
                key="priorities-title"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: "Roboto Slab, Georgia, serif",
                  fontSize: 22, fontWeight: 500,
                  color: "var(--color-text-primary)",
                  margin: 0, lineHeight: 1.15, textAlign: "center",
                }}
              >
                Top Priorities
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {ProfileButton}
      </div>

      {/* ── PINNED SEARCH BAR (expands from mini pill via layoutId) ───── */}
      <AnimatePresence>
        {mode === "accounts" && (
          <motion.div
            key="accounts-search-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-2 h-11 px-3"
            style={{
              margin: "0 16px 12px",
              borderRadius: 999,
              background: "var(--color-dark-secondary)",
              outline: showSystemSection ? "1.5px solid var(--color-brand-purple)" : "none",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7.5" cy="7.5" r="6" stroke={showSystemSection ? "var(--color-brand-purple)" : "var(--color-text-muted)"} strokeWidth="1.75" style={{ transition: "stroke 0.2s" }} />
              <path d="M12 12L16 16" stroke={showSystemSection ? "var(--color-brand-purple)" : "var(--color-text-muted)"} strokeWidth="1.75" strokeLinecap="round" style={{ transition: "stroke 0.2s" }} />
            </svg>
            <input
              ref={accountsInputRef}
              type="text"
              placeholder={showSystemSection ? "Searching all accounts…" : "Search accounts…"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] outline-none"
              style={{ color: "var(--color-text-primary)", caretColor: "var(--color-brand-coral)" }}
            />
            {showSystemSection && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-brand-purple)", background: "rgba(139,146,255,0.12)", borderRadius: 6, padding: "2px 6px", flexShrink: 0 }}>
                ALL
              </span>
            )}
            {query && (
              <button onClick={() => setQuery("")} className="active:opacity-60 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="var(--color-text-disabled)" />
                  <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <SortMenu current={sort} onChange={setSort} />
          </motion.div>
        )}

        {mode === "priorities" && (
          <motion.div
            key="priorities-search-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-2 h-11 px-3"
            style={{
              margin: "0 16px 12px",
              borderRadius: 999,
              background: "var(--color-dark-secondary)",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7.5" cy="7.5" r="6" stroke="var(--color-text-muted)" strokeWidth="1.75" />
              <path d="M12 12L16 16" stroke="var(--color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <input
              ref={prioritiesInputRef}
              type="text"
              placeholder="Search priorities…"
              value={prioritiesQuery}
              onChange={(e) => setPrioritiesQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] outline-none"
              style={{ color: "var(--color-text-primary)", caretColor: "var(--color-brand-coral)" }}
            />
            {prioritiesQuery && (
              <button onClick={() => setPrioritiesQuery("")} className="active:opacity-60 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="var(--color-text-disabled)" />
                  <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <AnimatePresence initial={false}>

          {/* HOME VIEW */}
          {mode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 48 }}
            >
              {preview === "loading" && <AccountListSkeleton rows={6} />}
              {preview === "error" && (
                <ErrorState title="Couldn't load accounts" message="We had trouble reaching the server." onRetry={() => {}} />
              )}
              {!preview && (
                <>
                  {/* Dashboard */}
                  <DashboardGrid
                    openTaskCount={availableTasks.length}
                    nearestAccount={nearestAccount}
                    onStartVisit={() => startCapture(topAccounts[0].id, topAccounts[0].name)}
                  />

                  {/* Accounts section */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                        Accounts
                      </span>
                      <MiniSearchPill onClick={() => goToMode("accounts")} />
                    </div>
                    <div style={{ background: "var(--color-dark-secondary)", borderRadius: 16, overflow: "hidden", marginLeft: 16, marginRight: 16 }}>
                      {topAccounts.map((account, i) => (
                        <CompactAccountRow key={account.id} account={account} isLast={i === topAccounts.length - 1} />
                      ))}
                    </div>
                  </div>

                  {/* Priorities section */}
                  <div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                        Top Priorities
                      </span>
                      <MiniSearchPill onClick={() => goToMode("priorities")} />
                    </div>
                    <TaskStrip tasks={availableTasks} pendingId={pendingTaskId} onCheck={handleCheck} />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ACCOUNTS EXPANDED VIEW */}
          {mode === "accounts" && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.32, 0, 0.18, 1] }}
              style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 48 }}
            >
              {/* My accounts */}
              {showSystemSection && <SectionHeader label="Your Accounts" count={myFiltered.length} />}
              {!showSystemSection && myFiltered.length > 0 && <SectionHeader label="Your Accounts" count={myFiltered.length} />}

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
                  className="mx-4 mt-2 mb-1 rounded-xl text-xs font-semibold active:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
                  style={{ background: "transparent", border: "1px solid var(--color-dark-tertiary)", color: "var(--color-text-muted)", padding: "10px 16px", width: "calc(100% - 32px)" }}>
                  <Icon name="public" size={13} style={{ color: "var(--color-text-muted)" }} />
                  Also search all Halosight accounts
                </button>
              )}

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
            </motion.div>
          )}

          {/* PRIORITIES EXPANDED VIEW */}
          {mode === "priorities" && (
            <motion.div
              key="priorities"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.32, 0, 0.18, 1] }}
              style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 48 }}
            >
              {/* Filter pills */}
              <div className="flex items-center gap-2 px-4 pt-1 pb-3">
                <FilterDropdown
                  options={[
                    { value: "open" as TaskStatusFilter, label: "Open" },
                    { value: "done" as TaskStatusFilter, label: "Done" },
                  ]}
                  value={taskStatusFilter}
                  onChange={setTaskStatusFilter}
                />
                <FilterDropdown
                  options={[
                    { value: "dueDate" as TaskSortMode, label: "Due Date" },
                    { value: "account" as TaskSortMode, label: "Account" },
                  ]}
                  value={taskSortMode}
                  onChange={setTaskSortMode}
                />
              </div>

              {/* Groups */}
              {taskGroups.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-16">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(46,204,113,0.12)" }}>
                    <Icon name="task_alt" size={20} style={{ color: "#2ECC71" }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {prioritiesQuery ? "No matching priorities" : taskStatusFilter === "done" ? "Nothing completed yet" : "All caught up!"}
                  </p>
                </div>
              ) : (
                taskGroups.map((group) => (
                  <section key={group.label} className="mb-5">
                    {/* Group label */}
                    <div className="flex items-center gap-2 px-4 mb-1 mt-1">
                      <span className="eyebrow-text" style={{ color: "var(--color-text-disabled)" }}>
                        {group.label.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--color-brand-purple)" }}>
                        {group.items.length}
                      </span>
                    </div>

                    {/* Task rows */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      {group.items.map((item, i) => {
                        const isPending = item.id === pendingTaskId;
                        const dueToday = !item.dueDate || item.dueDate.getTime() < new Date().setHours(24,0,0,0);
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="flex items-center gap-3 px-4 relative"
                          >
                            {i < group.items.length - 1 && (
                              <div className="absolute bottom-0 left-3 right-3"
                                style={{ height: 1, background: "var(--color-dark-tertiary)" }} />
                            )}
                            {/* Check circle */}
                            <div className="py-3.5">
                              <button
                                onClick={() => {
                                  if (pendingTaskId) return;
                                  setPendingTaskId(item.id);
                                  timerRef.current = setTimeout(() => {
                                    updateItem(item.accountId, { ...item, status: "done" });
                                    setPendingTaskId(null);
                                  }, 5000);
                                }}
                                className="relative flex-shrink-0 w-5 h-5 rounded-full active:scale-90 transition-transform"
                              >
                                <div className="absolute inset-0 rounded-full transition-opacity duration-150"
                                  style={{ border: "1.5px solid var(--color-text-disabled)", opacity: isPending ? 0 : 1 }} />
                                <AnimatePresence>
                                  {isPending && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                                      className="absolute inset-0 rounded-full flex items-center justify-center"
                                      style={{ background: "#2ECC71" }}
                                    >
                                      <Icon name="check" size={12} style={{ color: "#fff" }} />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>
                            {/* Row content */}
                            <Link href={`/accounts/${item.accountId}/action-items/${item.id}`}
                              className="flex-1 flex items-center gap-3 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-[16px] font-semibold leading-snug mb-1"
                                  style={{ color: "var(--color-text-primary)" }}>
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Icon name="calendar_today" size={12} style={{ color: "var(--color-brand-purple-dark)" }} />
                                    <span className="text-xs font-medium" style={{ color: dueToday ? "var(--color-brand-coral)" : "var(--color-text-disabled)" }}>
                                      {item.dueDate ? item.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Due Today"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                      <path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
                                        stroke="var(--color-text-disabled)" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
                                      {mockAccounts.find(a => a.id === item.accountId)?.name ?? item.accountId}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </section>
                ))
              )}
            </motion.div>
          )}

        </AnimatePresence>
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
