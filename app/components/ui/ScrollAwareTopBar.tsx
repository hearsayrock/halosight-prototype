"use client";

/**
 * FLUTTER HANDOFF: ScrollAwareTopBar
 * Widget: StatefulWidget (scroll subscription via ref)
 * Tokens: --md-sys-color-text-primary, --md-sys-color-alpha-white-10
 * Flutter equivalent: scroll_aware_top_bar.dart
 *
 * Floating back-button bar that responds to scroll:
 *   - Glass circle appears behind the back arrow once scrolled > 10px
 *   - rightSlot fades out on scroll-down, returns on scroll-up
 *
 * Usage:
 *   const scrollRef = useRef<HTMLDivElement>(null);
 *   <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
 *     <ScrollAwareTopBar onBack={...} rightSlot={<.../>} scrollRef={scrollRef} />
 *     <div ref={scrollRef} style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
 *       <div style={{ paddingTop: 86 }}>...content...</div>
 *     </div>
 *   </div>
 */

import React, { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";

interface ScrollAwareTopBarProps {
  onBack: () => void;
  rightSlot?: React.ReactNode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function ScrollAwareTopBar({ onBack, rightSlot, scrollRef }: ScrollAwareTopBarProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const top = el!.scrollTop;
      setHasScrolled(top > 10);
      setScrollingUp(top < lastScrollTopRef.current);
      lastScrollTopRef.current = top;
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const showRight = !hasScrolled || scrollingUp;

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        zIndex: 10,
        paddingTop: 40,
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}
    >
      <button
        onClick={onBack}
        aria-label="Go back"
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: hasScrolled ? "rgba(20, 23, 38, 0.88)" : "transparent",
          backdropFilter: hasScrolled ? "blur(16px) saturate(180%)" : undefined,
          boxShadow: hasScrolled ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "none",
          transition: "background 180ms ease",
          flexShrink: 0,
          pointerEvents: "auto",
        }}
      >
        <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-primary)" }} />
      </button>

      {rightSlot && (
        <div
          style={{
            opacity: showRight ? 1 : 0,
            pointerEvents: showRight ? "auto" : "none",
            transition: "opacity 160ms ease",
          }}
        >
          {rightSlot}
        </div>
      )}
    </div>
  );
}
