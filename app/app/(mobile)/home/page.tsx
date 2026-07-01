"use client";

/**
 * FLUTTER HANDOFF: HomeScreen
 * Route: /home
 * Widget: StatefulWidget
 * State: pendingTaskId, completedTaskIds
 * Flutter equivalent: home_page.dart
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import CompletionToast from "@/components/ui/CompletionToast";
import { mockTasks, mockActivities } from "@/lib/mock-data/home";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import type { HomeTask, HomeActivity } from "@/lib/mock-data/home";

// ── User icon ─────────────────────────────────────────────────────────────────

function UserIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
        stroke="var(--md-sys-color-brand-teal)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Greeting ──────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── AccountsIcon (profile button) ─────────────────────────────────────────────

function AccountsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
        stroke="var(--md-sys-color-text-muted)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Check circle ──────────────────────────────────────────────────────────────

function CheckCircle({ checked, onCheck }: { checked: boolean; onCheck: () => void }) {
  return (
    <button
      onClick={onCheck}
      className="relative flex-shrink-0 w-5 h-5 rounded-full active:scale-90 transition-transform"
      style={{ flexShrink: 0 }}
    >
      {/* Empty ring */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-150"
        style={{
          border: "1.5px solid var(--md-sys-color-text-disabled)",
          opacity: checked ? 0 : 1,
        }}
      />
      {/* Filled green circle */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

function formatTaskDue(dueDate: Date | null): string {
  if (!dueDate) return "Due Today";
  return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskRow({
  task,
  isLast,
  isPending,
  onCheck,
}: {
  task: HomeTask;
  isLast: boolean;
  isPending: boolean;
  onCheck: () => void;
}) {
  const isToday = task.dueDate === null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="flex items-center gap-3 px-4 relative"
    >
      {/* Separator */}
      {!isLast && (
        <div
          className="absolute bottom-0 left-3 right-3"
          style={{ height: 1, background: "var(--md-sys-color-dark-tertiary)" }}
        />
      )}

      {/* Circle — standalone button, does NOT navigate */}
      <div className="py-3.5">
        <CheckCircle checked={isPending} onCheck={onCheck} />
      </div>

      {/* Content + chevron — navigates to detail */}
      <Link
        href={`/accounts/${task.accountId}/action-items/${task.itemId}`}
        className="flex-1 flex items-center gap-3 py-3.5"
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-[16px] font-semibold leading-snug"
            style={{ color: "var(--md-sys-color-text-primary)" }}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
              <Icon
                name="calendar_today"
                size={12}
                style={{ color: "var(--md-sys-color-neonindigo-dark)" }}
              />
              <span
                className="text-xs font-medium"
                style={{
                  color: isToday
                    ? "var(--md-sys-color-brand-coral)"
                    : "var(--md-sys-color-text-disabled)",
                }}
              >
                {formatTaskDue(task.dueDate)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <UserIcon size={12} />
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                {task.accountName}
              </span>
            </div>
          </div>
        </div>
        <Icon
          name="chevron_right"
          size={18}
          style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }}
        />
      </Link>
    </motion.div>
  );
}

// ── Activity card ─────────────────────────────────────────────────────────────

function formatActivityDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) +
    ", " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}hr ${m} min` : `${h}hr`;
}

function ActivityCard({ activity }: { activity: HomeActivity }) {
  return (
    <Link href={`/accounts/${activity.accountId}/activity/${activity.activityId}`}>
      <div
        className="flex items-start gap-3 p-4 active:opacity-70 transition-opacity"
        style={{
          background: "var(--md-sys-color-dark-secondary)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-[16px] font-semibold mb-1"
            style={{ color: "var(--md-sys-color-text-primary)" }}
          >
            {activity.title}
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
            {activity.description}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <UserIcon size={12} />
            <span className="text-xs" style={{ color: "var(--md-sys-color-text-secondary)" }}>
              {activity.accountName}
            </span>
            <span style={{ display: "inline-block", width: 4 }} />
            <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
              {formatActivityDate(activity.date)}
            </span>
            <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
              •
            </span>
            <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
              {formatDuration(activity.durationMinutes)}
            </span>
          </div>
        </div>
        <Icon
          name="chevron_right"
          size={18}
          style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0, marginTop: 2 }}
        />
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { getItems, updateItem } = useActionItems();

  // Home-level completion state (separate from context — home uses its own task list)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tasks available for the upcoming section (not yet removed)
  const availableTasks = mockTasks.filter((t) => !completedTaskIds.includes(t.id));
  // Always show up to 3, including the currently pending one
  const visibleTasks = availableTasks.slice(0, 3);

  const commitCompletion = useCallback(
    (task: HomeTask) => {
      // Mark the underlying action item as done in the context
      const item = getItems(task.accountId).find((i) => i.id === task.itemId);
      if (item) updateItem(task.accountId, { ...item, status: "done" });
      // Remove from home task list
      setCompletedTaskIds((prev) => [...prev, task.id]);
      setPendingTaskId(null);
      timerRef.current = null;
    },
    [getItems, updateItem]
  );

  function handleCheck(task: HomeTask) {
    // Only one pending at a time
    if (pendingTaskId) return;
    setPendingTaskId(task.id);
    timerRef.current = setTimeout(() => commitCompletion(task), 5000);
  }

  function handleUndo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPendingTaskId(null);
  }

  function handleDismissToast() {
    if (!pendingTaskId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const task = mockTasks.find((t) => t.id === pendingTaskId);
    if (task) commitCompletion(task);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-10 pb-4">
        <div>
          <p
            className="eyebrow-text mb-1"
            style={{ color: "var(--md-sys-color-text-disabled)" }}
          >
            {greeting()}, Nate!
          </p>
          <h1
            style={{
              color: "var(--md-sys-color-text-primary)",
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize: 30,
              fontWeight: 500,
              lineHeight: "38px",
            }}
          >
            Today
          </h1>
        </div>
        <Link href="/profile">
          <button
            className="active:opacity-60 transition-opacity mt-1"
            aria-label="Profile"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--md-sys-color-dark-secondary)" }}
            >
              <AccountsIcon />
            </div>
          </button>
        </Link>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-28">

        {/* ── Upcoming tasks ─────────────────────────────────────────── */}
        {availableTasks.length > 0 ? (
          <section className="mb-6">
            <div className="flex items-center justify-between px-4 mb-1">
              <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>
                Upcoming
              </span>
              <Link
                href="/tasks"
                className="text-sm font-semibold active:opacity-60 transition-opacity"
                style={{ color: "var(--md-sys-color-neonindigo)" }}
              >
                View All
              </Link>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {visibleTasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isLast={i === visibleTasks.length - 1}
                  isPending={task.id === pendingTaskId}
                  onCheck={() => handleCheck(task)}
                />
              ))}
            </AnimatePresence>
          </section>
        ) : (
          <section className="mb-6 px-4">
            <div className="flex items-center gap-3 px-4 py-3.5" style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
            }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, #2ECC71 15%, transparent)" }}>
                <span style={{ fontSize: 16 }}>✓</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                All caught up!
              </p>
              <Link href="/tasks" className="ml-auto text-sm font-semibold"
                style={{ color: "var(--md-sys-color-neonindigo)" }}>
                View All
              </Link>
            </div>
          </section>
        )}

        {/* ── Recently logged ───────────────────────────────────────── */}
        <section>
          <div className="px-4 mb-3">
            <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Recently Logged
            </span>
          </div>
          <div className="flex flex-col gap-2 px-4">
            {mockActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>

      </div>

      {/* Toast — portaled above bottom nav */}
      <CompletionToast
        visible={pendingTaskId !== null}
        bottom={106}
        onUndo={handleUndo}
        onDismiss={handleDismissToast}
      />

    </div>
  );
}
