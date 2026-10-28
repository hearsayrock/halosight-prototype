"use client";

/**
 * FLUTTER HANDOFF: ChatInput
 * Widget: StatelessWidget (text lives in the parent's TextEditingController)
 * Props: value, onChange, onSubmit, onVoiceMode, onDictate, placeholder, autoFocus
 * State: none; the trailing round button is "voice mode" (waveform) when empty and "send" once there is text
 * Flutter equivalent: chat_input_bar.dart
 * Tokens: color.dark.secondary (pill), color.dark.tertiary (mic), color.neonindigo.dark (action button),
 *         color.text.primary / muted / disabled, radius.full, spacing.2/3/4
 */

import { useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";

export default function ChatInput({
  value, onChange, onSubmit, onVoiceMode, onDictate, placeholder = "Ask about this account", autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onVoiceMode: () => void;
  onDictate?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const hasText = value.trim().length > 0;

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => ref.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [autoFocus]);

  return (
    <div
      className="flex items-center"
      style={{
        background: "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-full)",
        padding: "var(--spacing-2)",
        paddingLeft: "var(--spacing-5)",
        gap: "var(--spacing-2)",
      }}
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && hasText) onSubmit(); }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 min-w-0 outline-none"
        style={{
          background: "transparent",
          fontSize: 17,
          color: "var(--md-sys-color-text-primary)",
          height: 40,
        }}
      />
      <button
        type="button"
        aria-label="Dictate"
        onClick={onDictate}
        className="flex items-center justify-center active:opacity-70 transition-opacity"
        style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-secondary)" }}
      >
        <Icon name="mic" size={20} />
      </button>
      <button
        type="button"
        aria-label={hasText ? "Send" : "Start voice conversation"}
        onClick={hasText ? onSubmit : onVoiceMode}
        className="flex items-center justify-center active:opacity-70 transition-opacity"
        style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-neonindigo-dark)", color: "var(--md-sys-color-text-primary)" }}
      >
        <Icon name={hasText ? "arrow_upward" : "graphic_eq"} size={22} />
      </button>
    </div>
  );
}
