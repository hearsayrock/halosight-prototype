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
import Icon from "@/components/ui/Icon";
import CompletionToast from "@/components/ui/CompletionToast";
import NoteSheet from "@/components/ui/NoteSheet";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { ActionItem } from "@/lib/types";
import ActionItemList from "@/components/accounts/ActionItemList";

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
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-3" style={{ flexShrink: 0 }}>
        <button
          onClick={() => router.back()}
          className="p-1 mb-3 active:opacity-60 transition-opacity"
        >
          <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>

        <div className="flex items-end justify-between gap-3 mb-3">
          <h1
            style={{
              color: "var(--md-sys-color-text-primary)",
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
                { value: "account" as SortMode, label: "Company" },
              ]}
              value={sortMode}
              onChange={setSortMode}
            />
          </div>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-2 h-11 px-3"
          style={{ borderRadius: 999, background: "var(--md-sys-color-dark-secondary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7.5" cy="7.5" r="6" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" />
            <path d="M12 12L16 16" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-15 outline-none"
            style={{ color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="active:opacity-60 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="var(--md-sys-color-text-disabled)" />
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
            <p className="text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>
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
                  style={{ color: "var(--md-sys-color-text-disabled)" }}
                >
                  {group.label.toUpperCase()}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--md-sys-color-neonindigo)" }}
                >
                  {group.items.length}
                </span>
              </div>

              {/* Rows — shared list, open "page" variant */}
              <ActionItemList
                variant="page"
                showAccountName
                entries={group.items.map((item) => ({
                  item: { ...item, dueDate: item.dueDate ?? new Date() },
                  accountId: item.accountId,
                  accountName: ACCOUNT_NAME[item.accountId] ?? item.accountId,
                }))}
                pendingId={pendingItemId}
                onComplete={(id) => {
                  const item = group.items.find((x) => x.id === id);
                  if (item) handleCheck(item.id, item.accountId);
                }}
              />
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
