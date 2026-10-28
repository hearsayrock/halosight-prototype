"use client";

/**
 * FLUTTER HANDOFF: ActionItemDrawer
 * Widget: StatefulWidget shown with Drawer (showModalBottomSheet)
 * Props: accountId, itemId, open, onClose, onComplete (called after "Mark complete")
 * State: mode ("view" | "edit"), draft title / description / dueDate, showCalendar, confirmDelete
 * Data: ActionItemsContext (getItems / updateItem / deleteItem), mockAccounts (account chip),
 *       mockAccountDetails.recentActivity (the interaction it came from)
 * Flutter equivalent: action_item_drawer.dart (+ action_item_edit_view.dart)
 *
 * Replaces the old full-page detail route. Opened from any ActionItemList row via useActionItemDrawer().
 *
 * View: title (Roboto Slab 22/700) with an edit button · chips (account, due date) · description (16/23, text.secondary) ·
 *       interaction card (inset, taps through to the interaction) · "Mark complete" (neonindigo-dark, hidden once done).
 * Edit: DrawerHeader (Cancel · "Edit item" · check) · TITLE input with 200 counter · DESCRIPTION box with 2000 counter ·
 *       interaction card · DUE DATE chip carousel + "Show calendar" (MiniCalendar here; Flutter uses the platform date
 *       picker) · "Delete action item". Cancel discards; the check saves. Delete asks first.
 * Spacing (spacing tokens): 16 sides · 16 title→chips · 20 between content blocks · 24 before the primary button ·
 *       24 between edit fields · 32 before Delete and at the bottom.
 * Fields sit inset on the drawer: color.dark.base fill, 1px color.dark.tertiary border (neonindigo while focused).
 *
 * Tokens: color.dark.base, color.dark.secondary, color.dark.tertiary, color.text.primary/secondary/muted/disabled,
 *         color.neonindigo.base, color.neonindigo.dark, color.semantic.error-light, color.alpha.scrim,
 *         radius.lg, radius.xl, radius.full, spacing.1–8
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { CompanyIcon } from "@/components/ui/CustomIcons";
import Drawer, { DrawerBackdrop, DrawerBody, DrawerHeader, useOverlayRoot } from "@/components/ui/Drawer";
import MiniCalendar from "@/components/accounts/MiniCalendar";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import type { ActionItem, ActionItemOriginType } from "@/lib/types";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

const ORIGIN_LABEL: Record<ActionItemOriginType, string> = { "meeting": "Meeting", "spoken-note": "Spoken note" };

const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const longDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const eyebrow = { fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--md-sys-color-text-muted)" };

function Chip({ icon, label, muted }: { icon: React.ReactNode; label: string; muted?: boolean }) {
  return (
    <span
      className="flex items-center"
      style={{
        gap: "var(--spacing-2)", minHeight: 32, padding: "0 var(--spacing-3)", borderRadius: "var(--radius-full)",
        background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)",
        fontSize: 15, fontWeight: 500, color: muted ? "var(--md-sys-color-text-muted)" : "var(--md-sys-color-text-secondary)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

export function InteractionCard({ item, activityDate, onOpen }: { item: ActionItem; activityDate?: Date; onOpen: () => void }) {
  if (!item.originActivity) return null;
  const kind = item.originType ? ORIGIN_LABEL[item.originType] : "Interaction";
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center text-left active:opacity-70 transition-opacity"
      style={{
        gap: "var(--spacing-3)", padding: "var(--spacing-3) var(--spacing-4)", borderRadius: "var(--radius-lg)",
        background: "var(--md-sys-color-dark-base)", border: "1px solid var(--md-sys-color-dark-tertiary)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="flex items-center" style={{ gap: "var(--spacing-2)", fontSize: 14, color: "var(--md-sys-color-text-muted)" }}>
          <Icon name="person" size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />
          <span style={{ fontWeight: 600 }}>{kind}</span>
          {activityDate && <><span aria-hidden>·</span><span>{longDate(activityDate)}</span></>}
        </p>
        <p className="truncate" style={{ marginTop: "var(--spacing-1)", fontSize: 17, color: "var(--md-sys-color-text-primary)" }}>
          {item.originActivity}
        </p>
      </div>
      <Icon name="chevron_right" size={22} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
    </button>
  );
}

export function DateChips({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = selected && selected < today ? new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()) : today;
  const days = Array.from({ length: 28 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const rowRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  // Scroll only the carousel (scrollIntoView would also scroll the drawer). Keep the selected chip on the 16px gutter.
  useEffect(() => {
    const row = rowRef.current, chip = selectedRef.current;
    if (row && chip) row.scrollLeft = Math.max(0, chip.offsetLeft - 16);
  }, []);

  return (
    <div ref={rowRef} className="flex overflow-x-auto relative" style={{ gap: "var(--spacing-2)", margin: "0 calc(var(--spacing-4) * -1)", padding: "0 var(--spacing-4)", scrollbarWidth: "none" }}>
      {days.map((d) => {
        const on = !!selected && sameDay(d, selected);
        return (
          <button
            key={d.toISOString()}
            ref={on ? selectedRef : undefined}
            onClick={() => onSelect(d)}
            className="flex-shrink-0 flex flex-col items-center justify-center active:opacity-80 transition-opacity"
            style={{
              width: 78, height: 86, borderRadius: "var(--radius-lg)",
              background: on ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-base)",
              border: `1px solid ${on ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-tertiary)"}`,
              color: on ? "var(--md-sys-color-text-inverse)" : "var(--md-sys-color-text-muted)",
              fontSize: 14,
            }}
          >
            <span>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
            <span style={{ fontSize: 24, fontWeight: 700, lineHeight: "30px", color: on ? "var(--md-sys-color-text-inverse)" : "var(--md-sys-color-text-primary)" }}>
              {d.getDate()}
            </span>
            <span>{d.toLocaleDateString("en-US", { month: "short" })}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Bodies (presentational — also rendered statically on the design-system page) ──────────────

export function ActionItemDrawerView({
  item, accountName, interactionDate, onEdit, onOpenInteraction, onComplete,
}: {
  item: ActionItem;
  accountName?: string;
  interactionDate?: Date;
  onEdit: () => void;
  onOpenInteraction: () => void;
  onComplete: () => void;
}) {
  const isDone = item.status === "done";
  return (
    <DrawerBody>
      <div className="flex items-start" style={{ gap: "var(--spacing-3)" }}>
        <h2 className="flex-1" style={{ fontSize: 22, fontWeight: 700, lineHeight: "28px", color: "var(--md-sys-color-text-primary)", fontFamily: "var(--font-serif)" }}>
          {item.title}
        </h2>
        <button
          onClick={onEdit}
          aria-label="Edit action item"
          className="flex items-center justify-center flex-shrink-0 active:opacity-60 transition-opacity"
          style={{ width: 44, height: 44, margin: "calc(var(--spacing-2) * -1) calc(var(--spacing-2) * -1) 0 0", color: "var(--md-sys-color-neonindigo)" }}
        >
          <Icon name="edit" size={24} />
        </button>
      </div>

      <div className="flex flex-wrap" style={{ gap: "var(--spacing-2)", marginTop: "var(--spacing-4)" }}>
        {accountName && <Chip icon={<CompanyIcon size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />} label={accountName} />}
        <Chip
          icon={<Icon name="calendar_today" size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />}
          label={item.dueDate ? `Due ${shortDate(item.dueDate)}` : "No due date"}
          muted={!item.dueDate}
        />
        {isDone && <Chip icon={<Icon name="check_circle" size={18} style={{ color: "var(--md-sys-color-semantic-success)" }} />} label="Completed" />}
      </div>

      {item.description && (
        <p style={{ marginTop: "var(--spacing-5)", fontSize: 16, lineHeight: "23px", color: "var(--md-sys-color-text-secondary)" }}>
          {item.description}
        </p>
      )}

      {item.originActivity && (
        <div style={{ marginTop: "var(--spacing-5)" }}>
          <InteractionCard item={item} activityDate={interactionDate} onOpen={onOpenInteraction} />
        </div>
      )}

      {!isDone && (
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center active:opacity-80 transition-opacity"
          style={{
            gap: "var(--spacing-3)", height: 48, marginTop: "var(--spacing-6)", borderRadius: "var(--radius-full)",
            background: "var(--md-sys-color-neonindigo-dark)", color: "var(--md-sys-color-text-primary)", fontSize: 17, fontWeight: 600,
          }}
        >
          <Icon name="check_circle" size={24} />
          Mark complete
        </button>
      )}
    </DrawerBody>
  );
}

export function ActionItemDrawerEdit({
  item, interactionDate, title, onTitle, description, onDescription, dueDate, onDueDate,
  showCalendar, onToggleCalendar, focus, onFocus, onCancel, onSave, onOpenInteraction, onDelete,
}: {
  item: ActionItem;
  interactionDate?: Date;
  title: string; onTitle: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  dueDate: Date | null; onDueDate: (d: Date) => void;
  showCalendar: boolean; onToggleCalendar: () => void;
  focus: "title" | "description" | null; onFocus: (f: "title" | "description" | null) => void;
  onCancel: () => void; onSave: () => void; onOpenInteraction: () => void; onDelete: () => void;
}) {
  const field = (focused: boolean) => ({
    background: "var(--md-sys-color-dark-base)",
    border: `1.5px solid ${focused ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-tertiary)"}`,
    color: "var(--md-sys-color-text-primary)",
  });
  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--md-sys-color-dark-primary)" }}>
        <DrawerHeader title="Edit item" onCancel={onCancel} onConfirm={onSave} confirmLabel="Save changes" />
      </div>
      <div style={{ padding: "var(--spacing-5) var(--spacing-4) var(--spacing-8)" }}>
        {/* Title */}
        <p style={{ ...eyebrow, marginBottom: "var(--spacing-2)" }}>Title</p>
        <input
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => onTitle(e.target.value)}
          onFocus={() => onFocus("title")}
          onBlur={() => onFocus(null)}
          className="w-full outline-none"
          style={{ height: 50, padding: "0 var(--spacing-5)", borderRadius: "var(--radius-full)", fontSize: 17, ...field(focus === "title") }}
        />
        <p className="text-right" style={{ marginTop: "var(--spacing-1)", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>{title.length}/{TITLE_MAX}</p>

        {/* Description */}
        <p style={{ ...eyebrow, marginTop: "var(--spacing-6)", marginBottom: "var(--spacing-2)" }}>Description</p>
        <textarea
          value={description}
          maxLength={DESCRIPTION_MAX}
          rows={5}
          onChange={(e) => onDescription(e.target.value)}
          onFocus={() => onFocus("description")}
          onBlur={() => onFocus(null)}
          className="w-full outline-none resize-none block"
          style={{ padding: "var(--spacing-4) var(--spacing-5)", borderRadius: "var(--radius-xl)", fontSize: 16, lineHeight: "23px", ...field(focus === "description") }}
        />
        <p className="text-right" style={{ marginTop: "var(--spacing-1)", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>{description.length}/{DESCRIPTION_MAX}</p>

        {item.originActivity && (
          <div style={{ marginTop: "var(--spacing-6)" }}>
            <InteractionCard item={item} activityDate={interactionDate} onOpen={onOpenInteraction} />
          </div>
        )}

        {/* Due date */}
        <p style={{ ...eyebrow, marginTop: "var(--spacing-6)", marginBottom: "var(--spacing-3)" }}>Due date</p>
        <DateChips selected={dueDate} onSelect={onDueDate} />
        <button
          onClick={onToggleCalendar}
          className="flex items-center active:opacity-70 transition-opacity"
          style={{
            gap: "var(--spacing-3)", height: 48, marginTop: "var(--spacing-4)", padding: "0 var(--spacing-5)",
            borderRadius: "var(--radius-full)", border: "1px solid var(--md-sys-color-dark-tertiary)",
            fontSize: 16, color: "var(--md-sys-color-text-secondary)",
          }}
        >
          <Icon name="calendar_month" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          {showCalendar ? "Hide calendar" : "Show calendar"}
        </button>
        {showCalendar && (
          <div style={{ marginTop: "var(--spacing-4)" }}>
            <MiniCalendar selected={dueDate} onSelect={onDueDate} />
          </div>
        )}

        {/* Delete */}
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center active:opacity-70 transition-opacity"
          style={{
            gap: "var(--spacing-2)", height: 48, marginTop: "var(--spacing-8)", borderRadius: "var(--radius-full)",
            border: "1px solid color-mix(in srgb, var(--md-sys-color-error) 40%, transparent)",
            color: "var(--md-sys-color-error-light)", fontSize: 16, fontWeight: 600,
          }}
        >
          <Icon name="delete" size={20} />
          Delete action item
        </button>
      </div>
    </>
  );
}

/** The confirmation card (without the dim). */
export function DeleteConfirmCard({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      className="relative w-full flex flex-col"
      style={{ gap: "var(--spacing-4)", padding: "var(--spacing-6)", borderRadius: "var(--radius-xl)", background: "var(--md-sys-color-dark-primary)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}
    >
      <div className="text-center">
        <p className="heading-6" style={{ color: "var(--md-sys-color-text-primary)", marginBottom: "var(--spacing-1)" }}>Delete action item?</p>
        <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>This is permanent and can&apos;t be undone.</p>
      </div>
      <button
        onClick={onConfirm}
        className="w-full h-12 text-15-bold active:opacity-70 transition-opacity"
        style={{ borderRadius: "var(--radius-full)", background: "var(--md-sys-color-error)", color: "var(--md-sys-color-text-primary)" }}
      >
        Yes, delete
      </button>
      <button
        onClick={onCancel}
        className="w-full h-12 text-15-bold active:opacity-70 transition-opacity"
        style={{ borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-primary)" }}
      >
        Cancel
      </button>
    </div>
  );
}

// ── Drawer (state + wiring) ────────────────────────────────────────────────────────────────

export default function ActionItemDrawer({
  accountId, itemId, open, onClose, onComplete,
}: {
  accountId: string | null;
  itemId: string | null;
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const router = useRouter();
  const { getItems, updateItem, deleteItem } = useActionItems();
  const item = accountId && itemId ? getItems(accountId).find((i) => i.id === itemId) : undefined;
  const account = mockAccounts.find((a) => a.id === accountId);
  const interactionDate = accountId && item?.originActivityId
    ? mockAccountDetails[accountId]?.recentActivity.find((a) => a.id === item.originActivityId)?.date
    : undefined;

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [focus, setFocus] = useState<"title" | "description" | null>(null);

  // State resets because the provider remounts this component (key) each time a drawer opens.

  if (!item || !accountId) return <Drawer open={false} onClose={onClose}>{null}</Drawer>;

  function startEdit() {
    if (!item) return;
    setTitle(item.title); setDescription(item.description ?? ""); setDueDate(item.dueDate); setMode("edit");
  }
  function save() {
    if (!item || !accountId || !title.trim()) return;
    updateItem(accountId, { ...item, title: title.trim(), description: description.trim() || undefined, dueDate });
    setMode("view"); setShowCalendar(false);
  }
  function openInteraction() {
    if (!item?.originActivityId || !accountId) return;
    onClose();
    router.push(`/relationships/${accountId}/activity/${item.originActivityId}`);
  }
  function remove() {
    if (!accountId || !item) return;
    deleteItem(accountId, item.id);
    setConfirmDelete(false);
    onClose();
  }

  return (
    <>
      <Drawer open={open} onClose={mode === "edit" ? () => setMode("view") : onClose}>
        {mode === "view" ? (
          <ActionItemDrawerView
            item={item}
            accountName={account?.name}
            interactionDate={interactionDate}
            onEdit={startEdit}
            onOpenInteraction={openInteraction}
            onComplete={() => { onComplete?.(); onClose(); }}
          />
        ) : (
          <ActionItemDrawerEdit
            item={item}
            interactionDate={interactionDate}
            title={title} onTitle={setTitle}
            description={description} onDescription={setDescription}
            dueDate={dueDate} onDueDate={setDueDate}
            showCalendar={showCalendar} onToggleCalendar={() => setShowCalendar((v) => !v)}
            focus={focus} onFocus={setFocus}
            onCancel={() => setMode("view")} onSave={save}
            onOpenInteraction={openInteraction}
            onDelete={() => setConfirmDelete(true)}
          />
        )}
      </Drawer>

      <ConfirmDelete open={confirmDelete} onCancel={() => setConfirmDelete(false)} onConfirm={remove} />
    </>
  );
}

function ConfirmDelete({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const root = useOverlayRoot();
  if (!root || !open) return null;
  return (
    <Portal root={root}>
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 80, padding: "0 var(--spacing-6)", pointerEvents: "auto" }}>
        <DrawerBackdrop onClick={onCancel} />
        <DeleteConfirmCard onCancel={onCancel} onConfirm={onConfirm} />
      </div>
    </Portal>
  );
}

function Portal({ root, children }: { root: Element; children: React.ReactNode }) {
  return createPortal(children, root);
}
