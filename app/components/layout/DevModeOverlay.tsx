"use client";

/**
 * FLUTTER HANDOFF: DevModeOverlay
 * Web-only dev tool — no Flutter equivalent.
 *
 * Press D (or click the DEV badge) to toggle.
 * Highlights the hovered element with an indigo outline and shows a tooltip with:
 * Fill / Text color / Border / Corner Radius / Font / Padding / Margin.
 * Color values are resolved back to CSS token names where possible.
 *
 * Token resolution: applies var(--token) to a hidden element and reads
 * getComputedStyle() — reliably maps rgb(...) → token name.
 *
 * Portals to document.body so it floats above everything.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ── Token map ─────────────────────────────────────────────────────────────────

interface TokenMaps {
  colors: Map<string, string>; // "rgb(139, 146, 255)" → "--md-sys-color-neonindigo"
  radii:  Map<string, string>; // "9999px" → "--radius-full"
}

let cachedMaps: TokenMaps | null = null;

function buildTokenMaps(): TokenMaps {
  if (cachedMaps) return cachedMaps;
  const colors = new Map<string, string>();
  const radii  = new Map<string, string>();

  const props: string[] = [];

  // Recursively collect all CSS vars from :root / :host rules (handles @layer nesting)
  function collectProps(rules: CSSRuleList) {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText?.includes(":root")) {
        for (const p of Array.from(rule.style)) {
          if (p.startsWith("--")) props.push(p);
        }
      }
      // Recurse into @layer, @media, @supports, etc.
      if ("cssRules" in rule && (rule as CSSGroupingRule).cssRules) {
        try { collectProps((rule as CSSGroupingRule).cssRules); } catch { /* ignore */ }
      }
    }
  }

  try {
    for (const sheet of document.styleSheets) {
      try { collectProps(sheet.cssRules); } catch { /* cross-origin */ }
    }
  } catch { /* ignore */ }

  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:100px;height:100px;pointer-events:none;visibility:hidden;";
  document.body.appendChild(el);

  for (const prop of props) {
    el.style.backgroundColor = `var(${prop})`;
    const bg = getComputedStyle(el).backgroundColor;
    el.style.backgroundColor = "";
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      if (!colors.has(bg)) colors.set(bg, prop);
    }

    if (prop.startsWith("--radius-")) {
      el.style.borderRadius = `var(${prop})`;
      const r = getComputedStyle(el).borderRadius;
      el.style.borderRadius = "";
      if (r && r !== "0px") {
        if (!radii.has(r)) radii.set(r, prop);
      }
    }
  }

  document.body.removeChild(el);
  cachedMaps = { colors, radii };
  return cachedMaps;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface BoxSpacing { top: string; right: string; bottom: string; left: string }

function fmtSpacing({ top, right, bottom, left }: BoxSpacing): string {
  const v = [top, right, bottom, left].map(x => x === "0px" ? "0" : x);
  if (v[0] === v[1] && v[1] === v[2] && v[2] === v[3]) return v[0];
  if (v[0] === v[2] && v[1] === v[3]) return `${v[0]} ${v[1]}`;
  if (v[1] === v[3]) return `${v[0]} ${v[1]} ${v[2]}`;
  return v.join(" ");
}

const isTransparent = (c: string) =>
  !c || c === "rgba(0, 0, 0, 0)" || c === "transparent";

const TEXT_TAGS = new Set([
  "span","p","h1","h2","h3","h4","h5","h6","a","label","button","li","td","th","em","strong",
]);

// ── HoverInfo ─────────────────────────────────────────────────────────────────

interface HoverInfo {
  mouseX: number;
  mouseY: number;
  rect: DOMRect;
  tag: string;
  width: number;
  height: number;
  // Fill
  fillColor: string;
  fillToken: string | null;
  // Text
  textColor: string;
  textToken: string | null;
  // Border
  hasBorder: boolean;
  borderWidth: string;
  borderColor: string;
  borderToken: string | null;
  // Radius
  borderRadius: string;
  radiusToken: string | null;
  // Font (only if text-bearing element)
  showFont: boolean;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  fontFamily: string;
  // Box model
  padding: BoxSpacing;
  margin: BoxSpacing;
  // Opacity
  opacity: string;
}

// ── Tooltip sub-components ────────────────────────────────────────────────────

function Swatch({ color }: { color: string }) {
  return (
    <span style={{
      display: "inline-block", width: 9, height: 9, borderRadius: "50%",
      background: color, border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0,
    }} />
  );
}

const LABEL_W = 52;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{
        width: LABEL_W, flexShrink: 0, textAlign: "right",
        color: "rgba(255,255,255,0.3)", fontSize: 10,
      }}>
        {label}
      </span>
      <span style={{
        display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        color: "#c4c8d8", fontSize: 11,
      }}>
        {children}
      </span>
    </div>
  );
}

function TokenValue({ token, raw }: { token: string | null; raw: string }) {
  return (
    <span style={{ color: token ? "#a5b4fc" : "#c4c8d8" }}>
      {token ?? raw}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />;
}

function DevTooltip({ hover }: { hover: HoverInfo }) {
  const TW = 296;
  const TH = 260;
  const OFF = 18;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let tx = hover.mouseX + OFF;
  let ty = hover.mouseY + OFF;
  if (tx + TW > vw - 8) tx = hover.mouseX - TW - OFF;
  if (ty + TH > vh - 8) ty = hover.mouseY - TH - OFF;
  tx = Math.max(8, tx);
  ty = Math.max(8, ty);

  const padStr = fmtSpacing(hover.padding);
  const marStr = fmtSpacing(hover.margin);
  const hasRadius = hover.borderRadius && hover.borderRadius !== "0px";

  return (
    <div
      data-dev-overlay="true"
      style={{
        position: "fixed", left: tx, top: ty, width: TW,
        zIndex: 10000, pointerEvents: "none",
        background: "rgba(10, 11, 20, 0.97)",
        border: "1px solid rgba(139, 146, 255, 0.25)",
        borderRadius: 9,
        fontFamily: "'SFMono-Regular', 'Consolas', 'ui-monospace', monospace",
        fontSize: 11, color: "#c4c8d8", overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.75)",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 12px",
        background: "rgba(139, 146, 255, 0.09)",
        borderBottom: "1px solid rgba(139, 146, 255, 0.13)",
      }}>
        <span style={{ color: "rgba(139, 146, 255, 0.8)", fontWeight: 700, fontSize: 11 }}>
          &lt;{hover.tag}&gt;
        </span>
        <span style={{ color: "#fff", fontWeight: 600, letterSpacing: "0.03em" }}>
          {hover.width} × {hover.height}
          {hover.opacity !== "1" && (
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400, marginLeft: 6 }}>
              {Math.round(parseFloat(hover.opacity) * 100)}%
            </span>
          )}
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "9px 12px 10px", display: "flex", flexDirection: "column", gap: 5 }}>

        {/* Fill */}
        {!isTransparent(hover.fillColor) && (
          <Row label="Fill">
            <Swatch color={hover.fillColor} />
            <TokenValue token={hover.fillToken} raw={hover.fillColor} />
          </Row>
        )}

        {/* Text color — shown in Font section for text elements, here for containers */}
        {!hover.showFont && (
          <Row label="Text">
            <Swatch color={hover.textColor} />
            <TokenValue token={hover.textToken} raw={hover.textColor} />
          </Row>
        )}

        {/* Border/Stroke */}
        {hover.hasBorder && (
          <Row label="Stroke">
            <Swatch color={hover.borderColor} />
            <span style={{ color: "rgba(255,255,255,0.4)", marginRight: 2 }}>
              {hover.borderWidth} ·{" "}
            </span>
            <TokenValue token={hover.borderToken} raw={hover.borderColor} />
          </Row>
        )}

        {/* Corner radius */}
        {hasRadius && (
          <Row label="Radius">
            <TokenValue token={hover.radiusToken} raw={hover.borderRadius} />
          </Row>
        )}

        <Divider />

        {/* Typography */}
        {hover.showFont && (() => {
          const sep = <span style={{ color: "rgba(255,255,255,0.25)" }}> · </span>;
          const wt = hover.fontWeight === "400" ? "regular"
            : hover.fontWeight === "500" ? "medium"
            : hover.fontWeight === "600" ? "semibold"
            : hover.fontWeight === "700" ? "bold"
            : hover.fontWeight;
          // First font in the stack, strip quotes
          const family = hover.fontFamily.split(",")[0].trim().replace(/['"]/g, "");
          return (
            <>
              <Row label="Font">
                <span style={{ color: "#c4c8d8" }}>
                  {hover.fontSize}{sep}{wt}
                  {hover.lineHeight !== "normal" && <>{sep}{hover.lineHeight}</>}
                </span>
              </Row>
              <Row label="Typeface">
                <span style={{ color: "#c4c8d8" }}>{family}</span>
              </Row>
              <Row label="Color">
                <Swatch color={hover.textColor} />
                <TokenValue token={hover.textToken} raw={hover.textColor} />
              </Row>
            </>
          );
        })()}

        <Divider />

        {/* Box model */}
        <Row label="Padding">{padStr || "0"}</Row>
        {marStr !== "0" && <Row label="Margin">{marStr}</Row>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DevModeOverlay() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive]   = useState(false);
  const [hover, setHover]     = useState<HoverInfo | null>(null);
  const activeRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { activeRef.current = active; }, [active]);

  // D key toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as Element)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "d" || e.key === "D") setActive(a => !a);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (active) {
      cachedMaps = null; // always rebuild on activation so hot-reload never serves stale tokens
      buildTokenMaps();
    } else {
      setHover(null);
    }
  }, [active]);

  // Mousemove inspector
  useEffect(() => {
    if (!active) return;
    buildTokenMaps();

    function onMove(e: MouseEvent) {
      if (!activeRef.current) return;

      const candidates = document.elementsFromPoint(e.clientX, e.clientY);
      let target: Element | null = null;
      for (const el of candidates) {
        if (!el.closest("[data-dev-overlay]")) { target = el; break; }
      }
      if (!target || target === document.documentElement || target === document.body) {
        setHover(null);
        return;
      }

      const maps = buildTokenMaps();
      const rect = target.getBoundingClientRect();
      const cs   = getComputedStyle(target);
      const tag  = target.tagName.toLowerCase();

      const fillColor   = cs.backgroundColor;
      const textColor   = cs.color;
      const bw          = cs.borderTopWidth;
      const bs          = cs.borderTopStyle;
      const bc          = cs.borderTopColor;
      const hasBorder   = bs !== "none" && bw !== "0px";
      const radius      = cs.borderRadius;

      // Show font info for text-bearing elements or elements with direct text
      const hasTextChild = Array.from(target.childNodes).some(
        n => n.nodeType === Node.TEXT_NODE && (n.textContent?.trim() ?? "").length > 0
      );
      const showFont = TEXT_TAGS.has(tag) || hasTextChild;

      // Line height: only show if it's a px value (not "normal")
      const lhRaw = cs.lineHeight;
      const lineHeight = lhRaw === "normal" ? "normal" : lhRaw;

      setHover({
        mouseX: e.clientX, mouseY: e.clientY,
        rect, tag,
        width:  Math.round(rect.width),
        height: Math.round(rect.height),
        fillColor,
        fillToken: maps.colors.get(fillColor) ?? null,
        textColor,
        textToken: maps.colors.get(textColor) ?? null,
        hasBorder,
        borderWidth: bw,
        borderColor: bc,
        borderToken: hasBorder ? (maps.colors.get(bc) ?? null) : null,
        borderRadius: radius,
        radiusToken: maps.radii.get(radius) ?? null,
        showFont,
        fontSize:   cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight,
        fontFamily: cs.fontFamily,
        padding: { top: cs.paddingTop, right: cs.paddingRight, bottom: cs.paddingBottom, left: cs.paddingLeft },
        margin:  { top: cs.marginTop,  right: cs.marginRight,  bottom: cs.marginBottom,  left: cs.marginLeft },
        opacity: cs.opacity,
      });
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Badge — clickable toggle */}
      <button
        data-dev-overlay="true"
        onClick={() => setActive(a => !a)}
        style={{
          position: "fixed", bottom: 16, right: 16, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px 4px 8px",
          borderRadius: 99,
          background: active ? "rgba(139, 146, 255, 0.88)" : "rgba(139, 146, 255, 0.12)",
          border: "1px solid rgba(139, 146, 255, 0.35)",
          color: active ? "#fff" : "rgba(139, 146, 255, 0.6)",
          fontSize: 10, fontWeight: 700,
          fontFamily: "'SFMono-Regular', 'Consolas', monospace",
          letterSpacing: "0.12em",
          cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
          userSelect: "none",
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: active ? "#fff" : "rgba(139, 146, 255, 0.5)",
          transition: "background 0.15s",
        }} />
        DEV
        {!active && (
          <span style={{
            fontSize: 9, padding: "1px 4px", borderRadius: 3, marginLeft: 3,
            border: "1px solid rgba(139, 146, 255, 0.3)",
            color: "rgba(139, 146, 255, 0.45)",
            letterSpacing: "0.05em",
          }}>
            D
          </span>
        )}
      </button>

      {active && hover && (
        <>
          {/* Highlight box */}
          <div
            data-dev-overlay="true"
            style={{
              position: "fixed",
              top: hover.rect.top, left: hover.rect.left,
              width: hover.rect.width, height: hover.rect.height,
              outline: "1.5px solid rgba(99, 102, 241, 0.85)",
              background: "rgba(99, 102, 241, 0.05)",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />
          <DevTooltip hover={hover} />
        </>
      )}
    </>,
    document.body
  );
}
