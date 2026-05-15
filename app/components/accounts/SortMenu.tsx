"use client";

/**
 * FLUTTER HANDOFF: SortMenu
 * Widget: StatefulWidget (manages open/close)
 * Props: currentSort (SortOption), onSortChange callback
 * Flutter equivalent: PopupMenuButton or custom overlay
 * Tokens: surface/elevated, text/primary, text/muted, border, elevation-3
 */

import { useState } from "react";
import type { SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "alphabetical", label: "Sort Alphabetically" },
  { value: "distance",     label: "Sort by Distance" },
  { value: "lastVisited",  label: "Sort by Last Visited" },
  { value: "company",      label: "Sort by Company" },
];

interface Props {
  current: SortOption;
  onChange: (sort: SortOption) => void;
}

export default function SortMenu({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 flex items-center justify-center rounded-xl transition-opacity active:opacity-60"
        style={{ background: "#202535" }}
        aria-label="Sort accounts"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17" stroke="#8B94A8" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M6 10H14" stroke="#8B94A8" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M9 15H11" stroke="#8B94A8" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-12 z-20 w-52 rounded-2xl overflow-hidden py-1"
            style={{
              background: "#2A3042",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              border: "1px solid #343B4F",
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-[15px] transition-colors"
                style={{ color: current === opt.value ? "#F7F8FF" : "#8B94A8", background: "transparent" }}
              >
                {opt.label}
                {current === opt.value && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="#F7F8FF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
