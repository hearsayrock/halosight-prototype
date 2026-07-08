"use client";

/**
 * MiniCalendar — inline date picker used in AddActionItemSheet and the edit page.
 * - Month/year label on left with dropdown chevron (opens month picker)
 * - "Today" button + prev/next chevrons grouped on the right
 * - Past days greyed out and not selectable
 * - Can't navigate backwards past the current month
 */

import { useState } from "react";
import Icon from "@/components/ui/Icon";

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

// 18 months from current month
function buildMonthOptions(from: Date): Date[] {
  return Array.from({ length: 18 }, (_, i) =>
    new Date(from.getFullYear(), from.getMonth() + i, 1)
  );
}

interface Props {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

export default function MiniCalendar({ selected, onSelect }: Props) {
  const todayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const thisMonthStart = new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), 1);

  const [viewDate, setViewDate] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedMidnight = selected
    ? (() => { const d = new Date(selected); d.setHours(0, 0, 0, 0); return d; })()
    : null;

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthOptions = buildMonthOptions(thisMonthStart);

  const isToday    = (d: number) => new Date(year, month, d).getTime() === todayMidnight.getTime();
  const isSelected = (d: number) => !!selectedMidnight && new Date(year, month, d).getTime() === selectedMidnight.getTime();
  const isPast     = (d: number) => new Date(year, month, d).getTime() < todayMidnight.getTime();

  const isCurrentMonth = viewDate.getTime() === thisMonthStart.getTime();

  function goNext()  { setViewDate(new Date(year, month + 1, 1)); }
  function goPrev()  { if (!isCurrentMonth) setViewDate(new Date(year, month - 1, 1)); }
  function goToday() { setViewDate(new Date(thisMonthStart)); setShowMonthPicker(false); }

  function pickMonth(m: Date) {
    setViewDate(m);
    setShowMonthPicker(false);
  }

  return (
    <div
      className="relative p-4"
      style={{ background: "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-md)" }}
    >
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">

        {/* Month/year + dropdown indicator */}
        <button
          onClick={() => setShowMonthPicker((v) => !v)}
          className="flex items-center gap-0.5 active:opacity-60"
        >
          <span className="text-sm-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
            {monthLabel}
          </span>
          <Icon
            name={showMonthPicker ? "arrow_drop_up" : "arrow_drop_down"}
            size={20}
            style={{ color: "var(--md-sys-color-text-primary)" }}
          />
        </button>

        {/* Today + chevrons */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="px-2 py-0.5 text-xs-bold active:opacity-60"
            style={{
              color: "var(--md-sys-color-text-primary)",
              border: "1px solid var(--md-sys-color-dark-tertiary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            Today
          </button>
          <button
            onClick={goPrev}
            disabled={isCurrentMonth}
            className="p-1 active:opacity-60"
            style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
          >
            <Icon name="chevron_left" size={18} style={{ color: "var(--md-sys-color-text-primary)" }} />
          </button>
          <button onClick={goNext} className="p-1 active:opacity-60">
            <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-primary)" }} />
          </button>
        </div>
      </div>

      {/* Month picker dropdown */}
      {showMonthPicker && (
        <div
          className="absolute left-0 right-0 z-10 overflow-y-auto"
          style={{
            top: 52,
            maxHeight: 220,
            background: "var(--md-sys-color-dark-secondary)",
            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
            borderTop: "1px solid var(--md-sys-color-dark-tertiary)",
          }}
        >
          {monthOptions.map((m, i) => {
            const isCurrent = m.getTime() === viewDate.getTime();
            const label = m.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            return (
              <button
                key={i}
                onClick={() => pickMonth(m)}
                className="w-full text-left px-4 py-2.5 text-sm active:opacity-60"
                style={{
                  color: isCurrent ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-primary)",
                  fontWeight: isCurrent ? 700 : 400,
                  background: isCurrent
                    ? "color-mix(in srgb, var(--md-sys-color-neonindigo) 10%, transparent)"
                    : "transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const sel  = isSelected(day);
          const tod  = isToday(day);
          const past = isPast(day);
          return (
            <button
              key={i}
              onClick={() => !past && onSelect(new Date(year, month, day))}
              disabled={past}
              className="flex items-center justify-center mx-auto"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                cursor: past ? "default" : "pointer",
                background: sel
                  ? "var(--md-sys-color-neonindigo)"
                  : tod
                  ? "var(--md-sys-color-dark-tertiary)"
                  : "transparent",
                color: "var(--md-sys-color-text-primary)",
                opacity: past ? 0.35 : 1,
                fontSize: 14,
                fontWeight: past ? 400 : 600,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
