"use client";

/**
 * Design-system previews for ErrorState, ScrollAwareTopBar and the custom icons. Prototype-only; the scroll preview is live (scroll inside it).
 */

import { useRef } from "react";
import ErrorState from "@/components/ui/ErrorState";
import ScrollAwareTopBar from "@/components/ui/ScrollAwareTopBar";
import ThumbsDownIcon from "@/components/ui/ThumbsDownIcon";
import { LeadStarIcon, CompanyIcon, AiChatIcon } from "@/components/ui/CustomIcons";

export function ErrorStatePreview({ custom = false }: { custom?: boolean }) {
  return (
    <div className="flex" style={{ height: 300, background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-lg)" }}>
      {custom
        ? <ErrorState title="Couldn't load accounts" message="We had trouble reaching the server." onRetry={() => {}} />
        : <ErrorState onRetry={() => {}} />}
    </div>
  );
}

export function ScrollTopBarPreview() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: "relative", height: 340, overflow: "hidden", borderRadius: "var(--radius-lg)", background: "var(--md-sys-color-background)" }}>
      <ScrollAwareTopBar
        onBack={() => {}}
        scrollRef={ref}
        rightSlot={<span className="text-sm-bold" style={{ color: "var(--md-sys-color-brand-coral)" }}>Edit</span>}
      />
      <div ref={ref} style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        <div style={{ paddingTop: 86, paddingLeft: 16, paddingRight: 16, paddingBottom: 24 }}>
          <p className="heading-5" style={{ color: "var(--md-sys-color-text-primary)", marginBottom: 12 }}>Acme Co</p>
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i} className="text-sm" style={{ color: "var(--md-sys-color-text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
              Scroll down: the back arrow gets a glass circle and Edit fades out. Scroll up and Edit returns.
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomIconsPreview() {
  const cell = (label: string, node: React.ReactNode) => (
    <div className="flex flex-col items-center" style={{ gap: 8, minWidth: 84 }}>
      <div className="flex items-center justify-center" style={{ height: 40, color: "var(--md-sys-color-text-primary)" }}>{node}</div>
      <span className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-muted)" }}>{label}</span>
    </div>
  );
  return (
    <div className="flex flex-wrap" style={{ padding: 16, gap: 16 }}>
      {cell("LeadStarIcon", <LeadStarIcon size={24} />)}
      {cell("CompanyIcon", <CompanyIcon size={24} />)}
      {cell("AiChatIcon", <AiChatIcon size={28} />)}
      {cell("ThumbsDownIcon", <ThumbsDownIcon size={24} />)}
      {cell("filled", <ThumbsDownIcon size={24} filled />)}
    </div>
  );
}
