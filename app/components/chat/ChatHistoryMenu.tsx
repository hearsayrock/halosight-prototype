"use client";

/**
 * FLUTTER HANDOFF: ChatHistoryMenu
 * Widget: StatefulWidget (search text only)
 * Props: threads, onSelect, onTogglePin, onDelete, onSeeAll
 * State: query — filters thread titles; sections are Pinned then Recent, empty sections hidden
 * Flutter equivalent: chat_history_menu.dart (popover from the history icon; showMenu / OverlayPortal)
 * Tokens: panel from Menu (MenuPanel); color.dark.secondary (search field), color.text.* , color.neonindigo (pinned, See all),
 *         color.alpha.white-10 (footer divider), radius.full, spacing.2/3/4
 */

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { MenuPanel, MenuSectionLabel } from "@/components/ui/Menu";
import type { ChatThread } from "@/lib/types";

function ThreadRow({
  thread, onSelect, onTogglePin, onDelete,
}: {
  thread: ChatThread;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center" style={{ gap: "var(--spacing-2)", padding: "var(--spacing-2) 0" }}>
      <button type="button" onClick={onSelect} className="flex-1 min-w-0 text-left active:opacity-70 transition-opacity">
        <p className="truncate" style={{ fontSize: 17, lineHeight: "22px", color: "var(--md-sys-color-text-primary)" }}>{thread.title}</p>
        <p style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)" }}>{thread.whenLabel} · {thread.messageCount} messages</p>
      </button>
      <button
        type="button"
        aria-label={thread.pinned ? "Unpin chat" : "Pin chat"}
        aria-pressed={thread.pinned}
        onClick={onTogglePin}
        className="flex items-center justify-center active:opacity-60 transition-opacity"
        style={{ width: 36, height: 36, color: thread.pinned ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-muted)" }}
      >
        <Icon name="keep" fill={thread.pinned} size={20} />
      </button>
      <button
        type="button"
        aria-label="Delete chat"
        onClick={onDelete}
        className="flex items-center justify-center active:opacity-60 transition-opacity"
        style={{ width: 36, height: 36, color: "var(--md-sys-color-text-muted)" }}
      >
        <Icon name="delete" size={20} />
      </button>
    </div>
  );
}

export default function ChatHistoryMenu({
  threads, onSelect, onTogglePin, onDelete, onSeeAll, className, style,
}: {
  threads: ChatThread[];
  onSelect: (t: ChatThread) => void;
  onTogglePin: (t: ChatThread) => void;
  onDelete: (t: ChatThread) => void;
  onSeeAll: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? threads.filter((t) => t.title.toLowerCase().includes(q)) : threads;
  const pinned = shown.filter((t) => t.pinned);
  const recent = shown.filter((t) => !t.pinned);

  const section = (label: string, list: ChatThread[]) =>
    list.length > 0 && (
      <>
        <MenuSectionLabel>{label}</MenuSectionLabel>
        {list.map((t) => (
          <ThreadRow
            key={t.id}
            thread={t}
            onSelect={() => onSelect(t)}
            onTogglePin={() => onTogglePin(t)}
            onDelete={() => onDelete(t)}
          />
        ))}
      </>
    );

  return (
    <MenuPanel minWidth={0} className={className} style={{ paddingLeft: "var(--spacing-4)", paddingRight: "var(--spacing-4)", paddingTop: "var(--spacing-3)", ...style }}>
      <div
        className="flex items-center"
        style={{
          gap: "var(--spacing-3)", padding: "0 var(--spacing-4)", height: 44,
          borderRadius: "var(--radius-full)",
          background: "var(--md-sys-color-dark-secondary)",
          border: "1px solid var(--md-sys-color-alpha-white-10)",
          marginBottom: "var(--spacing-2)",
        }}
      >
        <Icon name="search" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          className="flex-1 min-w-0 outline-none"
          style={{ background: "transparent", fontSize: 17, color: "var(--md-sys-color-text-primary)" }}
        />
      </div>
      {section("Pinned", pinned)}
      {section("Recent", recent)}
      {shown.length === 0 && (
        <p style={{ fontSize: 15, color: "var(--md-sys-color-text-muted)", padding: "var(--spacing-4) 0", textAlign: "center" }}>No chats match.</p>
      )}
      <div style={{ borderTop: "1px solid var(--md-sys-color-alpha-white-10)", marginTop: "var(--spacing-2)" }}>
        <button
          type="button"
          onClick={onSeeAll}
          className="w-full active:opacity-70 transition-opacity"
          style={{ padding: "var(--spacing-3) 0", fontSize: 17, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}
        >
          See all chats
        </button>
      </div>
    </MenuPanel>
  );
}
