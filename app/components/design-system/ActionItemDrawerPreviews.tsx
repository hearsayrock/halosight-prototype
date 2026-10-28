"use client";

/**
 * Design-system page previews for ActionItemDrawer — NOT part of the mobile app UX.
 * Renders the real view / edit / confirm bodies (components/accounts/ActionItemDrawer.tsx) inside a static drawer frame,
 * so the reference page can never drift from the live drawer.
 */

import { useState } from "react";
import { DrawerHandle } from "@/components/ui/Drawer";
import { ActionItemDrawerView, ActionItemDrawerEdit, DeleteConfirmCard } from "@/components/accounts/ActionItemDrawer";
import type { ActionItem } from "@/lib/types";

const daysFrom = (n: number) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };

export const SAMPLE_FULL: ActionItem = {
  id: "ds-full", title: "Send Q2 pricing update", dueDate: daysFrom(-2), status: "open",
  description: "Dave asked for a revised pricing sheet reflecting the higher brake pad volumes they're now projecting. He wants to compare our Q2 rates against what their current supplier quoted.",
  originActivity: "Quarterly Review", originActivityId: "x", originType: "meeting",
};
export const SAMPLE_MINIMAL: ActionItem = { id: "ds-min", title: "Compare HaloSight and Microsoft 365 videos", dueDate: null, status: "open" };
export const SAMPLE_DONE: ActionItem = { ...SAMPLE_FULL, id: "ds-done", status: "done", dueDate: daysFrom(-5), originType: "spoken-note" };

const INTERACTION_DATE = daysFrom(-3);

/** Static drawer surface: dark-primary, radius-xl top corners, handle. */
export function DrawerFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "var(--spacing-4)", background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }}>
      <DrawerHandle />
      {children}
    </div>
  );
}

export function ViewPreview({ item }: { item: ActionItem }) {
  return (
    <DrawerFrame>
      <ActionItemDrawerView
        item={item}
        accountName="Acme Co"
        interactionDate={INTERACTION_DATE}
        onEdit={() => {}}
        onOpenInteraction={() => {}}
        onComplete={() => {}}
      />
    </DrawerFrame>
  );
}

export function EditPreview({ focus = null, calendar = false }: { focus?: "title" | "description" | null; calendar?: boolean }) {
  const [title, setTitle] = useState(SAMPLE_FULL.title);
  const [description, setDescription] = useState(SAMPLE_FULL.description ?? "");
  const [dueDate, setDueDate] = useState<Date | null>(daysFrom(2));
  const [showCalendar, setShowCalendar] = useState(calendar);
  const [f, setF] = useState<"title" | "description" | null>(focus);
  return (
    <DrawerFrame>
      <ActionItemDrawerEdit
        item={SAMPLE_FULL}
        interactionDate={INTERACTION_DATE}
        title={title} onTitle={setTitle}
        description={description} onDescription={setDescription}
        dueDate={dueDate} onDueDate={setDueDate}
        showCalendar={showCalendar} onToggleCalendar={() => setShowCalendar((v) => !v)}
        focus={f} onFocus={setF}
        onCancel={() => {}} onSave={() => {}} onOpenInteraction={() => {}} onDelete={() => {}}
      />
    </DrawerFrame>
  );
}

export function DeletePreview() {
  return (
    <div className="relative" style={{ background: "var(--md-sys-color-alpha-scrim)", padding: "var(--spacing-10) var(--spacing-6)" }}>
      <DeleteConfirmCard onCancel={() => {}} onConfirm={() => {}} />
    </div>
  );
}
