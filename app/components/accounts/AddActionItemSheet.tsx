"use client";

/**
 * AddActionItemSheet — bottom sheet for creating a new action item.
 * Portals into #phone-overlay-root so it sits above PageTransition + BottomNav.
 * Slides up from the bottom using framer-motion spring.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{
          background: "var(--md-sys-color-background)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "88%",
          overflowY: "auto",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
        </div>

        <div className="px-5 pt-3 pb-8">
          {/* Heading */}
          <h2
            className="text-[22px] font-semibold mb-5"
            style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
          >
            Add an item
          </h2>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-15 outline-none px-4 py-3.5"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
              color: "var(--md-sys-color-text-primary)",
            }}
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
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="w-full h-12 text-15-bold flex items-center justify-center transition-opacity"
            style={{
              background: "var(--md-sys-color-brand-coral)",
              color: "var(--md-sys-color-text-primary)",
              borderRadius: "var(--radius-full)",
              opacity: title.trim() ? 1 : 0.4,
            }}
          >
            Add action item
          </button>
        </div>
      </motion.div>

    </div>
    )}
    </AnimatePresence>,
    overlayRoot
  );
}
