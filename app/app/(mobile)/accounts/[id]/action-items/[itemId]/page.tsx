"use client";

/**
 * FLUTTER HANDOFF: ActionItemEditScreen
 * Route: /accounts/[id]/action-items/[itemId]
 * Widget: StatefulWidget
 * State: title, status, dueDate — auto-saves on 800ms debounce
 * Flutter equivalent: action_item_edit_page.dart
 */

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import MiniCalendar from "@/components/accounts/MiniCalendar";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import type { ActionItemStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ActionItemStatus; label: string; color: string }[] = [
  { value: "open",     label: "Open",     color: "var(--md-sys-color-neonindigo)" },
  { value: "done",     label: "Done",     color: "var(--md-sys-color-success)" },
  { value: "canceled", label: "Canceled", color: "var(--md-sys-color-brand-coral)" },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
}

export default function ActionItemEditPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id: accountId, itemId } = use(params);
  const router = useRouter();
  const { getItems, updateItem, deleteItem } = useActionItems();

  const item = getItems(accountId).find((i) => i.id === itemId);

  const [title,    setTitle]    = useState(item?.title    ?? "");
  const [status,   setStatus]   = useState<ActionItemStatus>(item?.status ?? "open");
  const [dueDate,  setDueDate]  = useState<Date | null>(item?.dueDate ?? null);
  const [saved,    setSaved]    = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  // Auto-save on debounce
  const triggerSave = useCallback(() => {
    if (!item) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateItem(accountId, { ...item, title, status, dueDate });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }, [item, title, status, dueDate, accountId, updateItem]);

  useEffect(() => { triggerSave(); }, [title, status, dueDate]); // eslint-disable-line

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function handleDelete() {
    deleteItem(accountId, itemId);
    router.back();
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--md-sys-color-text-muted)" }}>Item not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-10 pb-4">
        <button onClick={() => router.back()} className="p-1 active:opacity-60 transition-opacity">
          <Icon name="chevron_left" size={24} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        {saved && (
          <div className="flex items-center gap-1">
            <Icon name="check" size={14} style={{ color: "var(--md-sys-color-success)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--md-sys-color-success)" }}>Saved</span>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">

        {/* Action item label + textarea */}
        <div className="flex items-center gap-1.5 mb-2">
          <Icon name="check_box_outline_blank" size={13} style={{ color: "var(--md-sys-color-neonindigo-dark)" }} />
          <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>Action Item</span>
        </div>
        <textarea
          ref={textareaRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={1}
          className="w-full text-[16px] font-semibold outline-none resize-none px-4 py-3.5 mb-6"
          style={{
            background: "var(--md-sys-color-dark-secondary)",
            borderRadius: "var(--radius-xl)",
            color: "var(--md-sys-color-text-primary)",
            lineHeight: "1.5",
            overflow: "hidden",
          }}
        />

        {/* Status */}
        <div className="flex items-center gap-1.5 mb-3">
          <Icon name="flag" size={13} style={{ color: "var(--md-sys-color-neonindigo-dark)" }} />
          <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>Status</span>
        </div>
        <div
          className="flex p-1 gap-1 mb-6"
          style={{ background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-full)" }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-all"
              style={{
                borderRadius: "var(--radius-full)",
                background: status === opt.value ? "var(--md-sys-color-dark-secondary)" : "transparent",
                color: status === opt.value ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: opt.color }}
              />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1.5 mb-2">
          <Icon name="calendar_today" size={13} style={{ color: "var(--md-sys-color-neonindigo-dark)" }} />
          <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>Due Date</span>
        </div>
        {dueDate && (
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--md-sys-color-text-muted)" }}>
            {formatDate(dueDate)}
          </p>
        )}
        <MiniCalendar selected={dueDate} onSelect={setDueDate} />

      </div>

      {/* Delete button */}
      <div className="absolute left-0 right-0 px-4" style={{ bottom: 32 }}>
        <button
          onClick={() => setShowDelete(true)}
          className="w-full h-12 font-semibold text-[14px] flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
          style={{
            border: "1px solid color-mix(in srgb, var(--md-sys-color-brand-coral) 60%, transparent)",
            borderRadius: "var(--radius-full)",
            color: "var(--md-sys-color-brand-coral)",
            background: "color-mix(in srgb, var(--md-sys-color-brand-coral) 10%, transparent)",
          }}
        >
          <Icon name="delete" size={16} style={{ color: "var(--md-sys-color-brand-coral)" }} />
          Delete item
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full p-6 flex flex-col gap-4"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid color-mix(in srgb, var(--md-sys-color-brand-coral) 40%, transparent)",
            }}
          >
            <div className="text-center">
              <p className="text-lg font-bold mb-1" style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}>
                Delete item?
              </p>
              <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
                This will be permanent and cannot be undone
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="w-full h-12 font-semibold text-[15px] rounded-full active:opacity-70 transition-opacity"
              style={{
                background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 30%, var(--md-sys-color-dark-tertiary))",
                color: "var(--md-sys-color-text-primary)",
              }}
            >
              Yes, delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="w-full h-12 font-semibold text-[15px] rounded-full active:opacity-70 transition-opacity"
              style={{
                background: "var(--md-sys-color-dark-tertiary)",
                color: "var(--md-sys-color-text-primary)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
