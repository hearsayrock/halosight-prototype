"use client";

/**
 * Design-system page previews for Button loading states — NOT part of the mobile app UX.
 * Static rows show each variant mid-load; the "Try it" buttons toggle loading for 2 seconds so the animation can be seen in context.
 */

import { useEffect, useRef, useState } from "react";
import Button, { type ButtonTone, type ButtonVariant } from "@/components/ui/Button";
import ThinkingDots from "@/components/ui/ThinkingDots";

/** A button that loads for 2s when tapped. */
export function TryItButton({
  variant, tone, size = "md", label, loadingLabel,
}: { variant: ButtonVariant; tone?: ButtonTone; size?: "md" | "sm"; label: string; loadingLabel?: string }) {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <Button
      variant={variant} tone={tone} size={size} loading={loading} loadingLabel={loadingLabel}
      onClick={() => { setLoading(true); timer.current = setTimeout(() => setLoading(false), 2000); }}
    >
      {label}
    </Button>
  );
}

/** Loading row for one variant: dots only, dots + label, and a small one. All static (loading). */
export function LoadingRow({
  variant, tone, label, loadingLabel = "Saving",
}: { variant: ButtonVariant; tone?: ButtonTone; label: string; loadingLabel?: string }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant={variant} tone={tone} loading>{label}</Button>
      <Button variant={variant} tone={tone} loading loadingLabel={loadingLabel}>{label}</Button>
      <Button variant={variant} tone={tone} size="sm" loading>{label}</Button>
      <TryItButton variant={variant} tone={tone} label={`${label} — try it`} loadingLabel={loadingLabel} />
    </div>
  );
}

/** Standalone ThinkingDots on the surfaces they appear over. */
export function DotsOnSurfaces() {
  const surfaces: { name: string; bg: string; fg: string }[] = [
    { name: "on filled (coral)",    bg: "var(--md-sys-color-brand-coral-dark)",   fg: "var(--md-sys-color-text-on-coral)" },
    { name: "on tonal (tertiary)",  bg: "var(--md-sys-color-dark-tertiary)", fg: "var(--md-sys-color-neonindigo)" },
    { name: "on the page",          bg: "var(--md-sys-color-dark-primary)",  fg: "var(--md-sys-color-text-muted)" },
    { name: "on indigo",            bg: "var(--md-sys-color-neonindigo-dark)", fg: "var(--md-sys-color-text-primary)" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-2" style={{ minWidth: 88 }}>
            <div className="flex items-center justify-center" style={{ height: 56, color: "var(--md-sys-color-neonindigo)" }}>
              <ThinkingDots size={size} />
            </div>
            <span className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-muted)" }}>{size}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2" style={{ minWidth: 88 }}>
          <div className="flex items-center justify-center" style={{ height: 56, color: "var(--md-sys-color-neonindigo)" }}>
            <ThinkingDots size="lg" bars={5} />
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-muted)" }}>lg · bars=5</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {surfaces.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center" style={{ width: 120, height: 56, borderRadius: "var(--radius-full)", background: s.bg, color: s.fg }}>
              <ThinkingDots size="sm" />
            </div>
            <span className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-muted)" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
