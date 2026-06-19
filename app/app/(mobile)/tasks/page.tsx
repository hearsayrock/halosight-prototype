"use client";

/**
 * FLUTTER HANDOFF: AllItemsScreen
 * Route: /tasks
 * Reachable from: Home → "View All" tasks link
 * Widget: StatefulWidget
 * State: statusFilter, sortMode, pendingItemId
 * Flutter equivalent: all_items_page.dart
 */

import { useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import CompletionToast from "@/components/ui/CompletionToast";
import NoteSheet from "@/components/ui/NoteSheet";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { ActionItem } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "open" | "done";
type SortMode = "dueDate" | "account";
type FlatItem = ActionItem & { accountId: string };
type Group = { key: string; label: string; items: FlatItem[] };

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCOUNT_NAME: Record<string, string> = Object.fromEntries(
  mockAccounts.map((a) => [a.id, a.name])
);

const startOfToday = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

function dueSortKey(date: Date | null): number {
  return date ? date.getTime() : startOfToday.getTime();
}

function isToday(date: Date | null): boolean {
  if (!date) return true;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === startOfToday.getTime();
}

function formatDate(date: Date | null): string {
  if (!date) return "Due Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Person icon ───────────────────────────────────────────────────────────────

function PersonIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
        stroke="var(--color-text-disabled)"
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
    >
      {/* Empty ring */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-150"
        style={{
          border: "1.5px solid var(--color-text-disabled)",
          opacity: checked ? 0 : 1,
        }}
      />
      {/* Filled circle */}
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

function TaskRow({
  item,
  accountId,
  accountName,
  isLast,
  isPending,
  onCheck,
}: {
  item: FlatItem;
  accountId: string;
  accountName: string;
  isLast: boolean;
  isPending: boolean;
  onCheck: () => void;
}) {
  const dueToday = isToday(item.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="flex items-center gap-3 px-4 relative"
    >
      {!isLast && (
        <div
          className="absolute bottom-0 left-3 right-3"
          style={{ height: 1, background: "var(--color-dark-tertiary)" }}
        />
      )}

      {/* Circle — does NOT navigate */}
      <div className="py-3.5">
        <CheckCircle checked={isPending} onCheck={onCheck} />
      </div>

      {/* Content + chevron — navigates to detail */}
      <Link
        href={`/relationships/${accountId}/action-items/${item.id}`}
        className="flex-1 flex items-center gap-3 py-3.5"
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-[16px] font-semibold leading-snug mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            {item.title}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Icon
                name="calendar_today"
                size={12}
                style={{ color: "var(--color-brand-purple-dark)" }}
              />
              <span
                className="text-xs font-medium"
                style={{
                  color: dueToday
                    ? "var(--color-brand-coral)"
                    : "var(--color-text-disabled)",
                }}
              >
                {formatDate(item.dueDate)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <PersonIcon size={12} />
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
                {accountName}
              </span>
            </div>
          </div>
        </div>
        <Icon
          name="chevron_right"
          size={18}
          style={{ color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 2 }}
        />
      </Link>

      {/* Origin activity link icon — outside content Link to avoid nested anchors */}
      {item.originActivityId && (
        <Link
          href={`/relationships/${item.accountId}/activity/${item.originActivityId}`}
          className="flex-shrink-0 flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ width: 44, height: 44 }}
        >
          <Icon name="link" size={16} style={{ color: "var(--color-text-disabled)" }} />
        </Link>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const router = useRouter();
  const { getAllItems, getItems, updateItem } = useActionItems();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [sortMode, setSortMode] = useState<SortMode>("dueDate");
  const [query, setQuery] = useState("");

  // Completion state
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);

  const commitCompletion = useCallback(
    (itemId: string, accountId: string, note?: string) => {
      const item = getItems(accountId).find((i) => i.id === itemId);
      if (item) updateItem(accountId, { ...item, status: "done", ...(note?.trim() ? { note } : {}) });
      setPendingItemId(null);
      setPendingAccountId(null);
      timerRef.current = null;
    },
    [getItems, updateItem]
  );

  function handleCheck(itemId: string, accountId: string) {
    if (pendingItemId) return; // one at a time
    setPendingItemId(itemId);
    setPendingAccountId(accountId);
    timerRef.current = setTimeout(() => commitCompletion(itemId, accountId), 8000);
  }

  function handleUndo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPendingItemId(null);
    setPendingAccountId(null);
  }

  function handleDismissToast() {
    if (!pendingItemId || !pendingAccountId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    commitCompletion(pendingItemId, pendingAccountId);
  }

  function handleAddNote() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setNoteSheetOpen(true);
  }

  function handleNoteDone(note: string) {
    if (pendingItemId && pendingAccountId) {
      commitCompletion(pendingItemId, pendingAccountId, note);
    }
    setNoteSheetOpen(false);
  }

  const groups = useMemo<Group[]>(() => {
    const all = getAllItems();

    const filtered = all
      .filter((item) =>
        statusFilter === "open"
          ? item.status === "open"
          : item.status === "done" || item.status === "canceled"
      )
      .filter((item) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (ACCOUNT_NAME[item.accountId] ?? "").toLowerCase().includes(q)
        );
      });

    if (sortMode === "dueDate") {
      const tomorrow = new Date(startOfToday.getTime() + 86400000);

      const sorted = [...filtered].sort(
        (a, b) => dueSortKey(a.dueDate) - dueSortKey(b.dueDate)
      );

      const bucketMap = new Map<string, FlatItem[]>();
      for (const item of sorted) {
        let label: string;
        if (!item.dueDate) {
          label = "Today";
        } else {
          const d = new Date(item.dueDate);
          d.setHours(0, 0, 0, 0);
          const t = d.getTime();
          if (t < startOfToday.getTime()) {
            label = "Overdue";
          } else if (t === startOfToday.getTime()) {
            label = "Today";
          } else if (t === tomorrow.getTime()) {
            label = "Tomorrow";
          } else {
            label = item.dueDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          }
        }
        const list = bucketMap.get(label) ?? [];
        list.push(item);
        bucketMap.set(label, list);
      }

      return Array.from(bucketMap.entries()).map(([label, items]) => ({
        key: label,
        label,
        items,
      }));
    }

    // Account mode
    const map = new Map<string, FlatItem[]>();
    for (const item of filtered) {
      const list = map.get(item.accountId) ?? [];
      list.push(item);
      map.set(item.accountId, list);
    }

    const result: Group[] = [];
    for (const [accountId, items] of map.entries()) {
      const sorted = [...items].sort(
        (a, b) => dueSortKey(a.dueDate) - dueSortKey(b.dueDate)
      );
      result.push({
        key: accountId,
        label: ACCOUNT_NAME[accountId] ?? accountId,
        items: sorted,
      });
    }

    result.sort((a, b) => a.label.localeCompare(b.label));
    return result;
  }, [getAllItems, statusFilter, sortMode, query]);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-3" style={{ flexShrink: 0 }}>
        <button
          onClick={() => router.back()}
          className="p-1 mb-3 active:opacity-60 transition-opacity"
        >
          <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
        </button>

        <div className="flex items-end justify-between gap-3 mb-3">
          <h1
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize: 30,
              fontWeight: 700,
              lineHeight: "36px",
            }}
          >
            All Items
          </h1>
          <div className="flex items-center gap-2 pb-1">
            <FilterDropdown
              options={[
                { value: "open" as StatusFilter, label: "Open" },
                { value: "done" as StatusFilter, label: "Done" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              options={[
                { value: "dueDate" as SortMode, label: "Due Date" },
                { value: "account" as SortMode, label: "Relationship" },
              ]}
              value={sortMode}
              onChange={setSortMode}
            />
          </div>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-2 h-11 px-3"
          style={{ borderRadius: 999, background: "var(--color-dark-secondary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7.5" cy="7.5" r="6" stroke="var(--color-text-muted)" strokeWidth="1.75" />
            <path d="M12 12L16 16" stroke="var(--color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] outline-none"
            style={{ color: "var(--color-text-primary)", caretColor: "var(--color-brand-coral)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="active:opacity-60 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="var(--color-text-disabled)" />
                <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-6">
        {groups.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
              {query.trim() ? "No matching items" : `No ${statusFilter} items`}
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.key} className="mb-6">
              {/* Group header */}
              <div className="flex items-center gap-2 px-4 mb-1 mt-2">
                <span
                  className="eyebrow-text"
                  style={{ color: "var(--color-text-disabled)" }}
                >
                  {group.label.toUpperCase()}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--color-brand-purple)" }}
                >
                  {group.items.length}
                </span>
              </div>

              {/* Rows */}
              <AnimatePresence mode="popLayout" initial={false}>
                {group.items.map((item, i) => (
                  <TaskRow
                    key={item.id}
                    item={item}
                    accountId={item.accountId}
                    accountName={ACCOUNT_NAME[item.accountId] ?? item.accountId}
                    isLast={i === group.items.length - 1}
                    isPending={item.id === pendingItemId}
                    onCheck={() => handleCheck(item.id, item.accountId)}
                  />
                ))}
              </AnimatePresence>
            </section>
          ))
        )}
      </div>

      {/* Toast — no bottom nav on this page */}
      <CompletionToast
        visible={pendingItemId !== null && !noteSheetOpen}
        bottom={24}
        onUndo={handleUndo}
        onDismiss={handleDismissToast}
        onAddNote={handleAddNote}
      />

      {/* Note sheet */}
      <NoteSheet visible={noteSheetOpen} onDone={handleNoteDone} />

    </div>
  );
}
