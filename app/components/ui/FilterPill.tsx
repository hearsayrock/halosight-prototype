"use client";

import Icon from "@/components/ui/Icon";

/** Shared trigger atom for filters that open a menu. */
export default function FilterPill({ label, open, filtered, onClick }: { label: string; open: boolean; filtered: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={onClick} className="flex items-center h-8 px-3 text-sm-bold active:opacity-70 transition-opacity" style={{ gap: filtered ? 4 : 2, background: open ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-full)", color: open ? "var(--md-sys-color-text-on-accent)" : "var(--md-sys-color-text-primary)" }}>
      {filtered && !open && <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginRight: 1 }}><path d="M3 8L6.5 11.5L13 5" stroke="var(--md-sys-color-neonindigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {label}
      <Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={18} style={{ color: open ? "color-mix(in srgb, var(--md-sys-color-text-on-accent) 70%, transparent)" : "var(--md-sys-color-text-muted)" }} />
    </button>
  );
}
