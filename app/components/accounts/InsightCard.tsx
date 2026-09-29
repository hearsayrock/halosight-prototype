"use client";

/**
 * FLUTTER HANDOFF: InsightCard
 * Widget: StatefulWidget (thumbs-down toggle)
 * Tokens: --md-sys-color-dark-primary, --md-sys-color-alpha-white-10,
 *         --md-sys-color-text-disabled, --md-sys-color-text-secondary,
 *         --md-sys-color-brand-teal, --md-sys-color-neonindigo,
 *         --md-sys-color-brand-coral, --md-sys-color-text-muted,
 *         --md-sys-color-dark-tertiary, --md-sys-color-background
 */

import { useState } from "react";
import Icon from "@/components/ui/Icon";

interface SourceBadge {
  type: "meeting" | "call" | "note";
}

interface InsightCardProps {
  eyebrow: string;
  /** If provided, renders "Visited X" meta in the header right */
  visitedDaysAgo?: number;
  /** String = prose paragraph. String[] = teal-bullet list. */
  body: string | string[];
  sources?: SourceBadge[];
}

const SOURCE_ICON: Record<SourceBadge["type"], string> = {
  meeting: "calendar_today",
  call: "phone_in_talk",
  note: "graphic_eq",
};

const DEFAULT_SOURCES: SourceBadge[] = [
  { type: "meeting" },
  { type: "call" },
  { type: "meeting" },
];

export default function InsightCard({
  eyebrow,
  visitedDaysAgo,
  body,
  sources = DEFAULT_SOURCES,
}: InsightCardProps) {
  const [thumbsDown, setThumbsDown] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const isBullets = Array.isArray(body);
  const bodyText = isBullets ? (body as string[]).join("\n") : (body as string);

  // "Visited X days ago" meta with conditional colour
  let visitedLabel: React.ReactNode = null;
  if (visitedDaysAgo !== undefined) {
    const highlight =
      visitedDaysAgo === 0 ? "today" :
      visitedDaysAgo === 1 ? "yesterday" :
      `${visitedDaysAgo} days ago`;
    const highlightColor =
      visitedDaysAgo <= 7
        ? "var(--md-sys-color-neonindigo)"
        : "var(--md-sys-color-text-disabled)";
    visitedLabel = (
      <span
        style={{
          marginLeft: "auto",
          fontSize: 14,
          color: "var(--md-sys-color-text-disabled)",
          fontFamily: "Barlow, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        Visited{" "}
        <span style={{ fontWeight: 700, color: highlightColor }}>{highlight}</span>
      </span>
    );
  }

  return (
    <div
      style={{
        background: "var(--md-sys-color-dark-primary)",
        border: "1px solid var(--md-sys-color-alpha-white-10)",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: isBullets ? 10 : 8,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--md-sys-color-text-disabled)",
            fontFamily: "Barlow, sans-serif",
          }}
        >
          {eyebrow}
        </span>
        {visitedLabel}
      </div>

      {/* Body */}
      {isBullets ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(body as string[]).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--md-sys-color-brand-teal)",
                  flexShrink: 0,
                  marginTop: 9,
                }}
              />
              <span
                style={{
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: "var(--md-sys-color-text-secondary)",
                  fontFamily: "Barlow, sans-serif",
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.5,
            margin: 0,
            color: "var(--md-sys-color-text-secondary)",
            fontFamily: "Barlow, sans-serif",
          }}
        >
          {body as string}
        </p>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Sources group */}
        <button
          onClick={() => setSourcesOpen(!sourcesOpen)}
          aria-label="Show sources"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--md-sys-color-text-muted)",
              fontFamily: "Barlow, sans-serif",
            }}
          >
            Sources
          </span>
          <div style={{ display: "flex", marginLeft: 4, position: "relative", height: 20 }}>
            {sources.map((s, i) => (
              <span
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--md-sys-color-dark-tertiary)",
                  border: "1px solid var(--md-sys-color-background)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: i === 0 ? "relative" : "absolute",
                  left: i === 0 ? undefined : i * 13,
                  zIndex: sources.length - i,
                }}
              >
                <Icon name={SOURCE_ICON[s.type]} size={11} style={{ color: "var(--md-sys-color-brand-teal)" }} />
              </span>
            ))}
            {/* spacer for absolute icons */}
            {sources.length > 1 && (
              <span style={{ width: (sources.length - 1) * 13, display: "inline-block", flexShrink: 0 }} />
            )}
          </div>
          <Icon
            name="expand_more"
            size={16}
            style={{
              color: "var(--md-sys-color-text-disabled)",
              transform: sourcesOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms ease",
              marginLeft: 2,
            }}
          />
        </button>

        {/* Action icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            aria-label="Read aloud"
            style={iconBtnStyle}
          >
            <Icon name="volume_up" size={18} />
          </button>
          <button
            aria-label="Ask AI about this"
            style={iconBtnStyle}
          >
            <Icon name="auto_awesome" size={18} />
          </button>
          <button
            aria-label="Copy"
            onClick={() => navigator.clipboard.writeText(bodyText).catch(() => {})}
            style={iconBtnStyle}
          >
            <Icon name="content_copy" size={18} />
          </button>
          {/* Thumbs down — inline SVG, no wrist cuff */}
          <button
            aria-label="Not helpful"
            aria-pressed={thumbsDown}
            onClick={() => setThumbsDown(!thumbsDown)}
            style={{
              ...iconBtnStyle,
              color: thumbsDown
                ? "var(--md-sys-color-brand-coral)"
                : "var(--md-sys-color-text-disabled)",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill={thumbsDown ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 1.5h7a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H9L7.5 13.5 6 8.5H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 5,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--md-sys-color-text-disabled)",
};
