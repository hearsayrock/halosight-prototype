"use client";

/**
 * FLUTTER HANDOFF: ChatHeader
 * Widget: StatelessWidget
 * Props: historyOpen, onHistory, onNewChat, onMinimize
 * Layout: history icon left; new chat and minimize right. Sits under the drawer handle, no divider.
 * Flutter equivalent: chat_header.dart
 * Tokens: color.text.secondary (icons), color.neonindigo (history while its menu is open), spacing.2/4
 */

import Icon from "@/components/ui/Icon";

function HeaderButton({ label, onClick, active = false, children }: { label: string; onClick?: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className="flex items-center justify-center active:opacity-60 transition-opacity"
      style={{ width: 44, height: 44, color: active ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-secondary)" }}
    >
      {children}
    </button>
  );
}

export default function ChatHeader({
  historyOpen = false, onHistory, onNewChat, onMinimize,
}: {
  historyOpen?: boolean;
  onHistory?: () => void;
  onNewChat?: () => void;
  onMinimize?: () => void;
}) {
  return (
    <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "0 var(--spacing-3)" }}>
      <HeaderButton label="Chat history" active={historyOpen} onClick={onHistory}><Icon name="history" size={26} /></HeaderButton>
      <div className="flex items-center">
        <HeaderButton label="New chat" onClick={onNewChat}><Icon name="edit_square" size={26} /></HeaderButton>
        <HeaderButton label="Minimize" onClick={onMinimize}><Icon name="remove" size={26} /></HeaderButton>
      </div>
    </div>
  );
}
