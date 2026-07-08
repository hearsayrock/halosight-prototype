"use client";

/**
 * FLUTTER HANDOFF: MobileKeyboard
 * Web-only prototype chrome — simulates an iOS-style keyboard that slides up
 * whenever a text field is focused, for demo realism. The keys are visual only
 * (users still type on their real keyboard). Remove in production.
 * Renders inside .phone-screen (position: relative), pinned to the bottom.
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-text-primary,
 *         --md-sys-color-text-secondary, --radius-sm
 */

import { useEffect, useRef, useState } from "react";

const ROW1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const ROW3 = ["Z", "X", "C", "V", "B", "N", "M"];
const QUICKTYPE = ["I", "The", "I'm"];

function isTextField(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return !["button", "submit", "reset", "checkbox", "radio", "range", "color", "file", "image"].includes(type);
  }
  return (el as HTMLElement).isContentEditable;
}

function Key({
  label,
  flex = 1,
  muted = false,
  fontSize = 22,
}: {
  label: React.ReactNode;
  flex?: number;
  muted?: boolean;
  fontSize?: number;
}) {
  return (
    <div
      style={{
        flex,
        minWidth: 0,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: muted ? "var(--md-sys-color-dark-secondary)" : "var(--md-sys-color-dark-tertiary)",
        color: "var(--md-sys-color-text-primary)",
        borderRadius: "var(--radius-sm)",
        fontSize,
        fontWeight: 400,
        boxShadow: "0 1px 0 rgba(0,0,0,0.5)",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}

export default function MobileKeyboard() {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Publish the keyboard height as a CSS var so sticky CTAs can pin above it.
  useEffect(() => {
    const h = visible && rootRef.current ? rootRef.current.offsetHeight : 0;
    document.documentElement.style.setProperty("--keyboard-inset", `${h}px`);
    return () => document.documentElement.style.setProperty("--keyboard-inset", "0px");
  }, [visible]);

  useEffect(() => {
    const sync = () => setVisible(isTextField(document.activeElement));
    // focusout fires before the next focus lands — defer the read.
    const onFocusOut = () => setTimeout(sync, 0);
    // Scrolling dismisses the keyboard, like iOS.
    const onScroll = () => {
      const el = document.activeElement;
      if (isTextField(el)) (el as HTMLElement).blur();
      setVisible(false);
    };
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  const rowStyle: React.CSSProperties = { display: "flex", gap: 6, marginBottom: 11 };

  return (
    <div
      ref={rootRef}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--md-sys-color-background)",
        transform: visible ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 110,
        boxShadow: "0 -1px 12px rgba(0,0,0,0.35)",
      }}
    >
      {/* QuickType / predictive suggestion bar */}
      <div style={{ display: "flex", height: 44, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {QUICKTYPE.map((word, i) => (
          <div
            key={word}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              color: "var(--md-sys-color-text-secondary)",
              borderRight: i < QUICKTYPE.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            {word}
          </div>
        ))}
      </div>

      {/* Keys */}
      <div style={{ padding: "8px 6px 0" }}>
        <div style={rowStyle}>
          {ROW1.map((k) => <Key key={k} label={k} />)}
        </div>
        <div style={{ ...rowStyle, paddingLeft: 18, paddingRight: 18 }}>
          {ROW2.map((k) => <Key key={k} label={k} />)}
        </div>
        <div style={rowStyle}>
          <Key label="⇧" flex={1.5} muted fontSize={18} />
          {ROW3.map((k) => <Key key={k} label={k} />)}
          <Key label="⌫" flex={1.5} muted fontSize={18} />
        </div>
        <div style={{ ...rowStyle, marginBottom: 0 }}>
          <Key label="123" flex={1.5} muted fontSize={15} />
          <Key label="🌐" flex={1} muted fontSize={16} />
          <Key label="space" flex={5} fontSize={15} />
          <Key label="return" flex={2} muted fontSize={15} />
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
        <div style={{ width: 134, height: 5, borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.3)" }} />
      </div>
    </div>
  );
}
