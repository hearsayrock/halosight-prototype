"use client";

/**
 * FLUTTER HANDOFF: ChatVoiceDock
 * Widget: StatelessWidget (the screen's controller owns the phase and timers)
 * Props: phase ("listening" | "thinking" | "speaking"), transcript, muted, onMicTap, onToggleMute, onAdd, onClose
 * Replaces the text input while a voice conversation is live. The message list above it keeps scrolling.
 *   listening: italic "Listening…" over the mic orb; blue glow rises from the bottom edge; orb has a soft halo
 *   thinking:  the transcript of what was just said, italic, over the orb
 *   speaking:  no label; coral glow; orb is a flat ring; the reply streams into the list with a lyric-style highlight
 * Controls: "+" (left), speaker mute toggle and a white close button (right). Close returns to the text input.
 * Flutter equivalent: chat_voice_dock.dart (Stack: gradient glow + Column)
 * Tokens: color.neonindigo / color.brand.coral (glow, mixed to transparent), color.neonindigo-dark (orb),
 *         color.alpha.white-18 (ring), color.text.primary / secondary / muted, color.text.inverse (close icon),
 *         radius.full, spacing.3/4/5/8
 */

import Icon from "@/components/ui/Icon";

export type VoicePhase = "listening" | "thinking" | "speaking";

function RoundButton({
  label, onClick, children, filled = false, flat = false,
}: { label: string; onClick?: () => void; children: React.ReactNode; filled?: boolean; flat?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center active:opacity-70 transition-opacity"
      style={{
        width: 48, height: 48, borderRadius: "var(--radius-full)",
        background: filled ? "var(--md-sys-color-text-primary)" : flat ? "transparent" : "color-mix(in srgb, var(--md-sys-color-neonindigo-dark) 45%, transparent)",
        border: filled ? "none" : "1px solid var(--md-sys-color-alpha-white-18)",
        color: filled ? "var(--md-sys-color-text-inverse)" : "var(--md-sys-color-text-primary)",
      }}
    >
      {children}
    </button>
  );
}

export default function ChatVoiceDock({
  phase, transcript, muted = false, onMicTap, onToggleMute, onAdd, onClose,
}: {
  phase: VoicePhase;
  transcript?: string;
  muted?: boolean;
  onMicTap?: () => void;
  onToggleMute?: () => void;
  onAdd?: () => void;
  onClose?: () => void;
}) {
  const speaking = phase === "speaking";
  const glow = speaking ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-neonindigo)";
  const label = phase === "listening" ? "Listening…" : phase === "thinking" ? transcript : null;

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        padding: "var(--spacing-8) var(--spacing-4) var(--spacing-4)",
        background: `radial-gradient(120% 90% at 50% 100%, color-mix(in srgb, ${glow} 28%, transparent), transparent 70%)`,
        transition: "background 0.4s",
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: "var(--spacing-4)" }}>
        <p
          style={{
            minHeight: 24, fontSize: 19, lineHeight: "24px", fontStyle: "italic", textAlign: "center",
            color: "var(--md-sys-color-text-secondary)", opacity: label ? 1 : 0, transition: "opacity 0.2s",
          }}
        >
          {label ?? " "}
        </p>
        <button
          type="button"
          aria-label={phase === "listening" ? "Stop listening" : "Microphone"}
          onClick={onMicTap}
          className="flex items-center justify-center"
          style={{
            width: 64, height: 64, borderRadius: "var(--radius-full)",
            background: speaking ? "transparent" : "color-mix(in srgb, var(--md-sys-color-neonindigo-dark) 55%, transparent)",
            border: "1px solid var(--md-sys-color-alpha-white-18)",
            boxShadow: phase === "listening" ? "0 0 32px color-mix(in srgb, var(--md-sys-color-neonindigo) 45%, transparent)" : "none",
            color: "var(--md-sys-color-text-primary)",
            transition: "background 0.3s, box-shadow 0.3s",
          }}
        >
          <Icon name="mic" size={26} />
        </button>
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: "var(--spacing-3)" }}>
        <RoundButton label="Add" onClick={onAdd} flat={speaking}><Icon name="add" size={24} /></RoundButton>
        <div className="flex items-center" style={{ gap: "var(--spacing-3)" }}>
          <RoundButton label={muted ? "Unmute replies" : "Mute replies"} onClick={onToggleMute} flat={speaking}>
            <Icon name={muted ? "volume_off" : "volume_up"} size={22} />
          </RoundButton>
          <RoundButton label="End voice conversation" onClick={onClose} filled><Icon name="close" size={24} /></RoundButton>
        </div>
      </div>
    </div>
  );
}
