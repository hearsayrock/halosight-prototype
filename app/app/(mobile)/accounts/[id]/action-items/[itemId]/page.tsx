"use client";

/**
 * FLUTTER HANDOFF: ActionItemDetailScreen
 * Route: /accounts/[id]/action-items/[itemId]
 * Widget: StatefulWidget
 * State: isEditing, title, status, dueDate — edit mode auto-saves on 800ms debounce
 * Flutter equivalent: action_item_detail_page.dart
 */

import { use, useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import MiniCalendar from "@/components/accounts/MiniCalendar";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { ActionItemStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ActionItemStatus; label: string; color: string }[] = [
  { value: "open",     label: "Open",     color: "var(--color-brand-purple)" },
  { value: "done",     label: "Done",     color: "var(--color-success)" },
  { value: "canceled", label: "Canceled", color: "var(--color-brand-coral)" },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
}

function ActionItemDetailPageContent({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id: accountId, itemId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // "account" | "activity"
  const fromActivityId = searchParams.get("activityId");
  const { getItems, updateItem, deleteItem } = useActionItems();

  const item = getItems(accountId).find((i) => i.id === itemId);
  const account = mockAccounts.find((a) => a.id === accountId);

  const [isEditing, setIsEditing] = useState(false);
  const [title,     setTitle]     = useState(item?.title    ?? "");
  const [status,    setStatus]    = useState<ActionItemStatus>(item?.status ?? "open");
  const [dueDate,   setDueDate]   = useState<Date | null>(item?.dueDate ?? null);
  const [saved,     setSaved]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  // Auto-save while editing
  const triggerSave = useCallback(() => {
    if (!item) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateItem(accountId, { ...item, title, status, dueDate });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }, [item, title, status, dueDate, accountId, updateItem]);

  useEffect(() => { if (isEditing) triggerSave(); }, [title, status, dueDate]); // eslint-disable-line
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function handleComplete() {
    if (!item) return;
    const backUrl = from === "activity" && fromActivityId
      ? `/accounts/${accountId}/activity/${fromActivityId}?just_completed=${itemId}`
      : `/accounts/${accountId}?just_completed=${itemId}`;
    router.push(backUrl);
  }

  function handleDelete() {
    deleteItem(accountId, itemId);
    router.push(`/accounts/${accountId}`);
  }

  function handleDoneEditing() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      if (item) updateItem(accountId, { ...item, title, status, dueDate });
    }
    setIsEditing(false);
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--color-text-muted)" }}>Item not found</p>
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-10 pb-4">
          <button onClick={handleDoneEditing} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-1">
                <Icon name="check" size={14} style={{ color: "var(--color-success)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>Saved</span>
              </div>
            )}
            <button
              onClick={handleDoneEditing}
              className="px-4 h-8 text-sm font-semibold rounded-full active:opacity-70 transition-opacity"
              style={{ background: "var(--color-dark-secondary)", color: "var(--color-text-primary)" }}
            >
              Done
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">

          {/* Title */}
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="check_box_outline_blank" size={13} style={{ color: "var(--color-brand-purple-dark)" }} />
            <span className="eyebrow-text" style={{ color: "var(--color-text-muted)" }}>Action Item</span>
          </div>
          <textarea
            ref={textareaRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={1}
            className="w-full text-[16px] font-semibold outline-none resize-none px-4 py-3.5 mb-6"
            style={{
              background: "var(--color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
              color: "var(--color-text-primary)",
              lineHeight: "1.5",
              overflow: "hidden",
            }}
          />

          {/* Status */}
          <div className="flex items-center gap-1.5 mb-3">
            <Icon name="flag" size={13} style={{ color: "var(--color-brand-purple-dark)" }} />
            <span className="eyebrow-text" style={{ color: "var(--color-text-muted)" }}>Status</span>
          </div>
          <div
            className="flex p-1 gap-1 mb-6"
            style={{ background: "var(--color-dark-primary)", borderRadius: "var(--radius-full)" }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-all"
                style={{
                  borderRadius: "var(--radius-full)",
                  background: status === opt.value ? "var(--color-dark-secondary)" : "transparent",
                  color: status === opt.value ? "var(--color-text-primary)" : "var(--color-text-muted)",
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Due date */}
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="calendar_today" size={13} style={{ color: "var(--color-brand-purple-dark)" }} />
            <span className="eyebrow-text" style={{ color: "var(--color-text-muted)" }}>Due Date</span>
          </div>
          {dueDate && (
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>
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
              border: "1px solid color-mix(in srgb, var(--color-brand-coral) 60%, transparent)",
              borderRadius: "var(--radius-full)",
              color: "var(--color-brand-coral)",
              background: "color-mix(in srgb, var(--color-brand-coral) 10%, transparent)",
            }}
          >
            <Icon name="delete" size={16} style={{ color: "var(--color-brand-coral)" }} />
            Delete item
          </button>
        </div>

        {/* Delete confirmation */}
        {showDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
            <div
              className="w-full p-6 flex flex-col gap-4"
              style={{
                background: "var(--color-dark-secondary)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid color-mix(in srgb, var(--color-brand-coral) 40%, transparent)",
              }}
            >
              <div className="text-center">
                <p className="text-lg font-bold mb-1" style={{ color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}>
                  Delete item?
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  This will be permanent and cannot be undone
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="w-full h-12 font-semibold text-[15px] rounded-full active:opacity-70 transition-opacity"
                style={{ background: "color-mix(in srgb, var(--color-brand-purple) 30%, var(--color-dark-tertiary))", color: "var(--color-text-primary)" }}
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="w-full h-12 font-semibold text-[15px] rounded-full active:opacity-70 transition-opacity"
                style={{ background: "var(--color-dark-tertiary)", color: "var(--color-text-primary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── Read-only mode ─────────────────────────────────────────────────────────
  const isDone = item.status === "done";

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button onClick={() => router.push(`/accounts/${accountId}`)} className="p-1 active:opacity-60 transition-opacity">
          <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 px-4 h-8 text-sm font-semibold rounded-full active:opacity-70 transition-opacity"
          style={{ background: "var(--color-dark-secondary)", color: "var(--color-text-primary)" }}
        >
          <Icon name="border_color" size={13} style={{ color: "var(--color-text-muted)" }} />
          Edit
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">

        {/* Status badge + eyebrow */}
        <div className="flex items-center gap-2 mb-3">
          <Icon name="check_box_outline_blank" size={13} style={{ color: "var(--color-brand-purple-dark)" }} />
          <span className="eyebrow-text" style={{ color: "var(--color-text-muted)" }}>Action Item</span>
          {isDone && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1"
              style={{ background: "rgba(46,204,113,0.12)", color: "var(--color-success)", border: "1px solid rgba(46,204,113,0.25)" }}
            >
              Completed
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-[22px] font-bold leading-snug mb-4"
          style={{ color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
        >
          {item.title}
        </h1>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2 mb-7">
          {account && (
            <Link href={`/accounts/${accountId}`}>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 active:opacity-70 transition-opacity"
                style={{ background: "var(--color-dark-secondary)", borderRadius: "var(--radius-full)" }}
              >
                <Icon name="domain" size={13} style={{ color: "var(--color-text-disabled)" }} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>{account.name}</span>
              </div>
            </Link>
          )}
          {item.originActivity && item.originActivityId && (
            <Link href={`/accounts/${accountId}/activity/${item.originActivityId}`}>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 active:opacity-70 transition-opacity"
                style={{ background: "var(--color-dark-secondary)", borderRadius: "var(--radius-full)" }}
              >
                <Icon name="link" size={13} style={{ color: "var(--color-text-disabled)" }} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>{item.originActivity}</span>
              </div>
            </Link>
          )}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5"
            style={{ background: "var(--color-dark-secondary)", borderRadius: "var(--radius-full)" }}
          >
            <Icon name="calendar_today" size={13} style={{ color: "var(--color-text-disabled)" }} />
            <span className="text-[13px] font-semibold" style={{ color: item.dueDate ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
              {item.dueDate ? formatDate(item.dueDate) : "No date set"}
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <>
            <p className="eyebrow-text mb-2 px-1" style={{ color: "var(--color-text-muted)" }}>Why this was created</p>
            <p
              className="text-sm leading-relaxed px-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item.description}
            </p>
          </>
        )}

      </div>

      {/* Bottom CTA */}
      {!isDone && (
        <div
          className="absolute left-0 right-0 px-4"
          style={{
            bottom: 32,
            background: "linear-gradient(to bottom, transparent, var(--color-background) 40%)",
            paddingTop: 20,
          }}
        >
          <button
            onClick={handleComplete}
            className="w-full h-12 font-semibold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
            style={{
              background: "var(--color-brand-teal)",
              borderRadius: "var(--radius-full)",
              color: "var(--color-text-primary)",
            }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Icon name="check" size={13} style={{ color: "#fff" }} />
            </div>
            Mark as Complete
          </button>
        </div>
      )}

    </div>
  );
}

export default function ActionItemDetailPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  return (
    <Suspense>
      <ActionItemDetailPageContent params={params} />
    </Suspense>
  );
}
