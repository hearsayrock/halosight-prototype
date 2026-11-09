"use client";

/**
 * FLUTTER HANDOFF: AddActionItemSheet
 * Widget: StatefulWidget (bottom sheet, opened with showModalBottomSheet)
 * Props: accountId, onClose
 * State: title, selectedDate (Date | null), showCalendar, isVisible (exit animation)
 * Data: useActionItems().addItem(accountId, { id, title, dueDate, status: "open" }). Nothing is saved until "Add action item" is tapped.
 * Flutter equivalent: add_action_item_sheet.dart (a DrawerPanel-style sheet; the date step uses the platform date picker, not MiniCalendar)
 *
 * Create an action item in one field and one tap:
 *   - Heading "Add an item", then a TextField ("What needs to be done?"), focused ~300ms after the sheet starts to slide up
 *   - Due date: a row of five day chips (today plus four days, 64px wide) and "Pick another date", which swaps (opacity only, 150ms)
 *     to a MiniCalendar with "Hide calendar" and the chosen date. The date is optional
 *   - "Add action item" (Button, md, full width) is disabled until the title has text, then closes the sheet
 *
 * Portals into #phone-overlay-root so it sits above the page transition. Built on DrawerBackdrop and DrawerPanel (maxHeight 88%).
 * Known drift: the day chips are hand-built. When a chip component exists (the edit drawer has DateChips), use that one.
 *
 * Tokens: color.dark.secondary (title field, unselected chip), color.dark.tertiary (outlines), color.neonindigo.base (selected chip),
 *         color.neonindigo.dark (calendar icon), color.text.primary / muted, radius.md (chips), radius.full (outline pills)
 */

import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DrawerBackdrop, DrawerPanel } from "@/components/ui/Drawer";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import MiniCalendar from "./MiniCalendar";
import { useActionItems } from "@/lib/context/ActionItemsContext";

function formatQuickDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function getDayLabel(date: Date, today: Date): string {
  if (date.toDateString() === today.toDateString()) return "Today";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

interface Props {
  accountId: string;
  onClose: () => void;
}

export default function AddActionItemSheet({ accountId, onClose }: Props) {
  const { addItem } = useActionItems();

  const [title, setTitle]           = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isVisible, setIsVisible]   = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setIsVisible(false);
  }

  // Focus input after the slide-up animation has started
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const quickDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  function handleAdd() {
    if (!title.trim()) return;
    addItem(accountId, {
      id: `item-${Date.now()}`,
      title: title.trim(),
      dueDate: selectedDate,
      status: "open",
    });
    handleClose();
  }

  // Read portal root synchronously — safe because this component only ever
  // renders on the client (it's gated behind user interaction).
  const overlayRoot = typeof document !== "undefined"
    ? document.getElementById("phone-overlay-root")
    : null;

  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
    {isVisible && (
    <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>

      {/* Backdrop + panel (shared drawer chrome) */}
      <DrawerBackdrop onClick={handleClose} />
      <DrawerPanel maxHeight="88%">

        <div className="px-5 pt-3 pb-8">
          {/* Heading */}
          <h2
            className="text-[22px] font-semibold mb-5"
            style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
          >
            Add an item
          </h2>

          {/* Text input */}
          <TextField
            inputRef={inputRef}
            ariaLabel="Action item"
            placeholder="What needs to be done?"
            value={title}
            onChange={setTitle}
          />

          {/* Due date section */}
          <div className="mt-5 mb-3 flex items-center gap-1.5">
            <Icon name="calendar_today" size={13} style={{ color: "var(--md-sys-color-neonindigo-dark)" }} />
            <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>Due Date</span>
          </div>

          {/* Pills ↔ Calendar swap — single AnimatePresence, mode=wait, opacity only */}
          <AnimatePresence mode="wait" initial={false}>
            {!showCalendar ? (
              <motion.div
                key="pills"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {quickDates.map((date, i) => {
                    const isSel = selectedDate?.toDateString() === date.toDateString();
                    return (
                      <button
                        key={i}
                        onClick={() => { setSelectedDate(date); setShowCalendar(false); }}
                        className="flex flex-col items-center flex-shrink-0 py-2 transition-colors"
                        style={{
                          width: 64,
                          borderRadius: "var(--radius-md)",
                          background: isSel ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-secondary)",
                        }}
                      >
                        <span className="text-xs-bold" style={{ color: isSel ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)" }}>
                          {getDayLabel(date, today)}
                        </span>
                        <span className="text-lg-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                          {date.getDate()}
                        </span>
                        <span className="text-xs" style={{ color: isSel ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)" }}>
                          {formatQuickDate(date)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex items-center gap-2 px-3 py-2 mb-4 active:opacity-70 transition-opacity"
                  style={{
                    border: "1px solid var(--md-sys-color-dark-tertiary)",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  <Icon name="calendar_today" size={14} style={{ color: "var(--md-sys-color-text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>Pick another date</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 active:opacity-70 transition-opacity"
                    style={{
                      border: "1px solid var(--md-sys-color-dark-tertiary)",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    <Icon name="close" size={13} style={{ color: "var(--md-sys-color-text-muted)" }} />
                    <span className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>Hide calendar</span>
                  </button>
                  {selectedDate && (
                    <p className="text-sm-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                      {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
                <MiniCalendar
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add button */}
          <Button size="md" fullWidth disabled={!title.trim()} onClick={handleAdd}>
            Add action item
          </Button>
        </div>
      </DrawerPanel>

    </div>
    )}
    </AnimatePresence>,
    overlayRoot
  );
}
