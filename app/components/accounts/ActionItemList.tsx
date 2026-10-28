"use client";

/**
 * FLUTTER HANDOFF: ActionItemList (+ ActionItemsHeader)
 * Widget: StatefulWidget (expanded/collapsed) containing a ListView of ActionItemRow StatelessWidgets
 * Props (list): entries (item + accountId + optional accountName), pendingId, onComplete(itemId),
 *               showAccountName, collapsedCount, limit, variant
 *       (header): action ({ kind: "add" | "viewAll", onClick })
 * State: expanded (bool) — only when collapsedCount is set. Completion state lives with the caller (pendingId).
 * Data: ActionItem (lib/types) — title, dueDate; the caller supplies accountId and accountName.
 * Flutter equivalent: action_item_list.dart, action_item_row.dart, action_items_header.dart
 *
 * One list, three screens — behaviour is chosen by props, not by copies of the row:
 *   Home        showAccountName, limit=4, header action "viewAll"         (no footer)
 *   Account     collapsedCount=3, header action "add"                     (footer View all N / Show less)
 *   Interaction collapsedCount=3, header action "add"                     (footer View all N / Show less)
 *   Page        variant="page", showAccountName — the full-page Action Items screen: no card, open rows on the page
 *               background, 16px side padding, separators inset 16px each side. Same row content as the others.
 *
 * Row (min 64px, 12px left / 14px right padding, 11px vertical, full-width separator except last):
 *   [20px check circle] 14px [title 16/600, wraps · due text 14 (· account name on home / page)]
 *   - Check circle is its own button; the rest of the row opens the action item drawer (ActionItemDrawer). Pending = filled success + check.
 *   - Due text: coral-light + 600 when urgent (overdue, yesterday, today); muted + 500 otherwise (formatActionItemDue).
 * Footer (collapsedCount only, when there are more items than collapsedCount): "View all N action items" /
 *   "Show less", neonindigo 15/600, 48px tall, separated from rows by the same hairline.
 * Header: 11px uppercase label (text-muted) with a trailing "View all" text button (neonindigo 13/600) or a 20px add icon.
 *
 * Tokens: color.text.primary, color.text.muted, color.text.disabled, color.brand.coral-light, color.semantic.success,
 *         color.text.inverse, color.neonindigo.base, color.alpha.white-10 (+ ListCard tokens)
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useActionItemDrawer } from "@/lib/context/ActionItemDrawerContext";
import ListCard from "@/components/ui/ListCard";
import type { ActionItem } from "@/lib/types";
import { formatActionItemDue } from "@/lib/utils";


export interface ActionItemEntry {
  item: ActionItem;
  /** Account the item belongs to; tapping the row opens its drawer. */
  accountId: string;
  /** The stored item's id when it differs from item.id (home maps task ids). Defaults to item.id. */
  itemId?: string;
  /** Shown after the due text when showAccountName is on (home). */
  accountName?: string;
}

// ── Header ────────────────────────────────────────────────────────────────────

export function ActionItemsHeader({
  action,
}: {
  action: { kind: "add" | "viewAll"; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2" style={{ minHeight: 40 }}>
      <span
        className="text-11-bold"
        style={{ letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--md-sys-color-text-muted)" }}
      >
        Action Items
      </span>
      {action.kind === "viewAll" ? (
        <button
          onClick={action.onClick}
          className="text-13-bold active:opacity-50 transition-opacity"
          style={{ color: "var(--md-sys-color-neonindigo)", cursor: "pointer" }}
        >
          View all
        </button>
      ) : (
        <button
          onClick={action.onClick}
          aria-label="Add action item"
          className="flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ width: 32, height: 32, marginRight: -4, color: "var(--md-sys-color-text-primary)" }}
        >
          <Icon name="add" size={20} />
        </button>
      )}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function ActionItemRow({
  entry, isLast, openRow, pending, showAccountName, onComplete,
}: {
  entry: ActionItemEntry;
  isLast: boolean;
  /** page variant: open row on the page background, 16px side padding, separator inset 16px each side. */
  openRow: boolean;
  pending: boolean;
  showAccountName: boolean;
  onComplete?: (itemId: string) => void;
}) {
  const { item, accountName } = entry;
  const drawer = useActionItemDrawer();
  const due = formatActionItemDue(item.dueDate);
  const dot = <span style={{ color: "var(--md-sys-color-text-disabled)" }}>·</span>;

  return (
    <div className="relative flex items-center" style={{ minHeight: 64, padding: openRow ? "11px 16px" : "11px 14px 11px 12px", gap: 14 }}>
      {!isLast && (
        <div
          className={`absolute bottom-0 ${openRow ? "left-4 right-4" : "left-0 right-0"}`}
          style={{ height: 1, background: "var(--md-sys-color-alpha-white-10)" }}
        />
      )}

      {/* Check circle — its own tap target, outside the link */}
      <button
        onClick={() => onComplete?.(item.id)}
        aria-label={`Complete: ${item.title}`}
        className="flex-shrink-0 flex items-center justify-center rounded-full active:scale-90 transition-all"
        style={{
          width: 20, height: 20,
          border: `1.5px solid ${pending ? "var(--md-sys-color-semantic-success)" : "var(--md-sys-color-text-disabled)"}`,
          background: pending ? "var(--md-sys-color-semantic-success)" : "transparent",
        }}
      >
        {pending && <Icon name="check" size={12} style={{ color: "var(--md-sys-color-text-inverse)" }} />}
      </button>

      <button
        onClick={() => drawer.open(entry.accountId, entry.itemId ?? item.id, () => onComplete?.(item.id))}
        className="flex-1 min-w-0 flex items-center text-left active:opacity-70 transition-opacity"
        style={{ gap: "var(--spacing-3)" }}
      >
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: "22px", color: "var(--md-sys-color-text-primary)" }}>
            {item.title}
          </p>
          <p className="flex items-center gap-1.5 min-w-0" style={{ fontSize: 14, lineHeight: "20px", marginTop: 1 }}>
            <span
              className="flex-shrink-0"
              style={{
                fontWeight: due.urgent ? 600 : 500,
                color: due.urgent ? "var(--md-sys-color-brand-coral-light)" : "var(--md-sys-color-text-muted)",
              }}
            >
              {due.text}
            </span>
            {showAccountName && accountName && (
              <>
                {dot}
                <span className="truncate" style={{ color: "var(--md-sys-color-text-muted)" }}>{accountName}</span>
              </>
            )}
          </p>
        </div>

      </button>
    </div>
  );
}

// ── List ──────────────────────────────────────────────────────────────────────

export default function ActionItemList({
  entries, pendingId = null, onComplete, showAccountName = false, collapsedCount, limit, variant = "card", className,
}: {
  entries: ActionItemEntry[];
  /** Id of the item currently shown as just-completed (filled check). */
  pendingId?: string | null;
  onComplete?: (itemId: string) => void;
  /** Home: show "<due> · <account>" on the second line. */
  showAccountName?: boolean;
  /** Account + interaction pages: rows shown before the "View all N action items" footer. Omit for no footer. */
  collapsedCount?: number;
  /** Hard cap with no footer (home). */
  limit?: number;
  /** "card" (default): rows inside a ListCard. "page": open rows on the page background (full-page Action Items screen). */
  variant?: "card" | "page";
  /** Outer spacing for the card variant. Defaults to "mx-4". */
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (entries.length === 0) return null;

  const capped = limit ? entries.slice(0, limit) : entries;
  const canCollapse = collapsedCount !== undefined && capped.length > collapsedCount;
  const visible = canCollapse && !expanded ? capped.slice(0, collapsedCount) : capped;

  const openRow = variant === "page";

  const content = (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((entry, i) => (
          <motion.div
            key={entry.item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
          >
            <ActionItemRow
              entry={entry}
              isLast={i === visible.length - 1 && !canCollapse}
              openRow={openRow}
              pending={entry.item.id === pendingId}
              showAccountName={showAccountName}
              onComplete={onComplete}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {canCollapse && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ minHeight: 48, fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}
        >
          {expanded ? "Show less" : `View all ${capped.length} action items`}
        </button>
      )}
    </>
  );

  return openRow
    ? <div className="flex flex-col">{content}</div>
    : <ListCard className={className ?? "mx-4"}>{content}</ListCard>;
}
