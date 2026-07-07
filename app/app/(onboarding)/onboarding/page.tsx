"use client";

/**
 * FLUTTER HANDOFF: OnboardingFlow
 * Route: /onboarding
 * Widget: StatefulWidget + PageView
 * Purpose: First-run welcome slideshow — 3 screens, skip + swipe navigation.
 *
 * SCREENS
 *   1. Walk In Prepared — AI surfaces account history + ideas in 30 seconds
 *   2. Record It. Done. — Voice capture → Salesforce automatically
 *   3. Nothing Falls Through — Action items tracked after every visit
 *
 * NAVIGATION
 *   Skip → /home (any screen)
 *   Next → advance slide
 *   Get Started → /home (last screen)
 *   Drag / swipe → advance or go back
 *
 * Flutter notes:
 *   - Use PageView.builder with PageController
 *   - SmoothPageIndicator package for dots
 *   - Hero or SharedAxisTransition for slide motion
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";

// ── Slide definitions ─────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: "prep",
    label: "BEFORE EVERY VISIT",
    headline: "Walk in like\nyou never left.",
    body: "AI surfaces your account history, open action items, and exactly what to bring up — before you step through the door.",
    proof: "30-second briefing per account",
    accent: "#8B92FF",
    accentSoft: "rgba(139,146,255,0.15)",
    accentGlow: "rgba(139,146,255,0.18)",
    glowColor: "rgba(139,146,255,0.22)",
    illustrationPaddingTop: 120,
  },
  {
    id: "capture",
    label: "AFTER EVERY MEETING",
    headline: "Record it.\nWe'll handle the rest.",
    body: "Walk out of the meeting, tap record, say what happened. AI writes your notes and updates Salesforce automatically.",
    proof: "No manual CRM entry. Ever.",
    accent: "#FF6B5A",
    accentSoft: "rgba(255,107,90,0.15)",
    accentGlow: "rgba(255,107,90,0.18)",
    glowColor: "rgba(255,107,90,0.22)",
    illustrationPaddingTop: 72,
  },
  {
    id: "followthrough",
    label: "BETWEEN EVERY STOP",
    headline: "Nothing\nfalls through.",
    body: "Every action item you make is captured automatically. Follow-ups ready. Your manager sees it all.",
    proof: "Zero dropped commitments",
    accent: "#2ECC71",
    accentSoft: "rgba(46,204,113,0.15)",
    accentGlow: "rgba(46,204,113,0.18)",
    glowColor: "rgba(46,204,113,0.22)",
    illustrationPaddingTop: 120,
  },
] as const;

type SlideId = typeof SLIDES[number]["id"];

// ── Illustration: Prep ────────────────────────────────────────────────────────

function IllustrationPrep({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 240 }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 240, height: 240,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,146,255,0.2) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Back card */}
      <motion.div
        initial={false}
        animate={active ? { y: 0, opacity: 1, rotate: -6 } : { y: 24, opacity: 0, rotate: -6 }}
        transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          width: 192, height: 84,
          background: "rgba(26,29,41,0.6)",
          border: "1px solid rgba(139,146,255,0.12)",
          borderRadius: 18,
          top: 52, left: "50%",
          marginLeft: -96,
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Mid card */}
      <motion.div
        initial={false}
        animate={active ? { y: 0, opacity: 1, rotate: 3 } : { y: 24, opacity: 0, rotate: 3 }}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          width: 192, height: 84,
          background: "rgba(26,29,41,0.8)",
          border: "1px solid rgba(139,146,255,0.18)",
          borderRadius: 18,
          top: 46, left: "50%",
          marginLeft: -96,
          padding: "14px 16px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ width: "55%", height: 7, borderRadius: 4, background: "rgba(139,146,255,0.35)", marginBottom: 10 }} />
        <div style={{ width: "85%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)", marginBottom: 6 }} />
        <div style={{ width: "65%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
      </motion.div>

      {/* Front card — account brief */}
      <motion.div
        initial={false}
        animate={active ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          width: 210, height: 110,
          background: "rgba(22,25,40,0.97)",
          border: "1px solid rgba(139,146,255,0.38)",
          borderRadius: 20,
          top: 38, left: "50%",
          marginLeft: -105,
          padding: "16px 18px",
          boxShadow: "0 12px 40px rgba(139,146,255,0.14), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {/* Account header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: "rgba(139,146,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
              <path d="M5.5 0C3.57 0 2 1.57 2 3.5C2 6.125 5.5 11 5.5 11C5.5 11 9 6.125 9 3.5C9 1.57 7.43 0 5.5 0ZM5.5 4.75C4.81 4.75 4.25 4.19 4.25 3.5C4.25 2.81 4.81 2.25 5.5 2.25C6.19 2.25 6.75 2.81 6.75 3.5C6.75 4.19 6.19 4.75 5.5 4.75Z" fill="#8B92FF"/>
            </svg>
          </div>
          <div>
            <div style={{ width: 88, height: 7, borderRadius: 4, background: "rgba(247,248,255,0.55)", marginBottom: 4 }} />
            <div style={{ width: 60, height: 5, borderRadius: 3, background: "rgba(139,146,255,0.4)" }} />
          </div>
        </div>

        {/* Brief lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[80, 65, 72].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B92FF", opacity: 0.7, flexShrink: 0 }} />
              <div style={{ width: `${w}%`, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.14)" }} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sparkle */}
      <motion.div
        initial={false}
        animate={active ? { scale: 1, opacity: 0.9, rotate: 0 } : { scale: 0, opacity: 0, rotate: -30 }}
        transition={{ duration: 0.5, delay: 0.65, type: "spring" }}
        style={{
          position: "absolute",
          top: 22, right: 36,
          fontSize: 20, color: "#8B92FF",
          lineHeight: 1,
        }}
      >
        ✦
      </motion.div>
    </div>
  );
}

// ── Illustration: Capture ─────────────────────────────────────────────────────

function IllustrationCapture({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 240 }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 240, height: 240,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,107,90,0.18) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Outer ring 2 */}
      <motion.div
        initial={false}
        animate={active ? { scale: 1, opacity: 0.18 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          position: "absolute",
          width: 160, height: 160,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,107,90,0.5)",
          top: "50%", left: "50%",
          marginTop: -80, marginLeft: -80,
          pointerEvents: "none",
        }}
      />
      {/* Outer ring 1 */}
      <motion.div
        initial={false}
        animate={active ? { scale: 1, opacity: 0.35 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.65, delay: 0.2 }}
        style={{
          position: "absolute",
          width: 112, height: 112,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,107,90,0.55)",
          top: "50%", left: "50%",
          marginTop: -56, marginLeft: -56,
          pointerEvents: "none",
        }}
      />

      {/* Record button */}
      <motion.div
        initial={false}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.55, delay: 0.05, type: "spring", bounce: 0.3 }}
        style={{
          position: "absolute",
          width: 72, height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF8F82 0%, #FF6B5A 55%, #E64A37 100%)",
          top: "50%", left: "50%",
          marginTop: -36, marginLeft: -36,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(255,107,90,0.35)",
        }}
      >
        {/* Mic icon */}
        <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
          <rect x="8" y="1" width="12" height="18" rx="6" fill="white"/>
          <path d="M4 14C4 19.52 8.48 24 14 24C19.52 24 24 19.52 24 14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="14" y1="24" x2="14" y2="30" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="9" y1="30" x2="19" y2="30" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </motion.div>

      {/* Waveform bars at bottom of illustration */}
      <motion.div
        initial={false}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          marginLeft: -50,
          display: "flex",
          alignItems: "center",
          gap: 4,
          height: 36,
        }}
      >
        {[18, 28, 36, 24, 32, 20, 28, 16, 30, 22, 34, 18, 26].map((h, i) => (
          <motion.div
            key={i}
            animate={active ? { scaleY: [1, 0.4 + Math.random() * 0.6, 1] } : { scaleY: 1 }}
            transition={{ duration: 0.8 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
            style={{
              width: 4, height: h,
              borderRadius: 2,
              background: `rgba(255,107,90,${0.3 + i * 0.04})`,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </motion.div>

    </div>
  );
}

// ── Illustration: Follow-Through ──────────────────────────────────────────────

function IllustrationFollowThrough({ active }: { active: boolean }) {
  const items = [
    { label: "Send updated pricing", done: true,  delay: 0.1 },
    { label: "Check back on inventory",  done: true,  delay: 0.22 },
    { label: "Intro call with buyer",    done: false, delay: 0.34 },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 240 }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 240, height: 240,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,204,113,0.16) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      {/* Main card */}
      <motion.div
        initial={false}
        animate={active ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          width: 228,
          background: "rgba(22,25,40,0.97)",
          border: "1px solid rgba(46,204,113,0.28)",
          borderRadius: 22,
          padding: "18px 18px",
          boxShadow: "0 12px 40px rgba(46,204,113,0.1), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "rgba(247,248,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Action Items
          </p>
          <div style={{
            background: "rgba(46,204,113,0.15)",
            border: "1px solid rgba(46,204,113,0.35)",
            borderRadius: 12,
            padding: "2px 8px",
            fontSize: 11, fontWeight: 700,
            color: "#86EFAC",
          }}>
            3
          </div>
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={active ? { x: 0, opacity: 1 } : { x: -16, opacity: 0 }}
              transition={{ duration: 0.45, delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                background: item.done ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.06)",
                border: `1.5px solid ${item.done ? "rgba(46,204,113,0.6)" : "rgba(255,255,255,0.15)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#2ECC71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={{
                flex: 1, height: 6, borderRadius: 3,
                background: item.done ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.22)",
                width: `${55 + i * 12}%`,
              }} />
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

// ── Slide component ───────────────────────────────────────────────────────────

const ILLUSTRATIONS = {
  prep: IllustrationPrep,
  capture: IllustrationCapture,
  followthrough: IllustrationFollowThrough,
};

function Slide({ slide, active }: { slide: typeof SLIDES[number]; active: boolean }) {
  const Illustration = ILLUSTRATIONS[slide.id];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: `var(--md-sys-color-background)`,
        overflow: "hidden",
      }}
    >
      {/* Top glow */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "55%",
          background: `radial-gradient(ellipse 90% 80% at 50% 0%, ${slide.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Illustration */}
      <div style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: slide.illustrationPaddingTop ?? 120,
        paddingBottom: 8,
        minHeight: 290,
      }}>
        <Illustration active={active} />
      </div>

      {/* Text */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "8px 32px 0",
      }}>
        {/* Label */}
        <motion.p
          initial={false}
          animate={active ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            margin: "0 0 14px",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em",
            color: slide.accent,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          {slide.label}
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={false}
          animate={active ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{
            margin: "0 0 16px",
            fontSize: 32, fontWeight: 700,
            lineHeight: 1.15,
            color: "var(--md-sys-color-text-primary)",
            textAlign: "center",
            fontFamily: "Roboto Slab, Georgia, serif",
            whiteSpace: "pre-line",
          }}
        >
          {slide.headline}
        </motion.h1>

        {/* Body */}
        <motion.p
          initial={false}
          animate={active ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.27 }}
          style={{
            margin: "0 0 20px",
            fontSize: 16, lineHeight: 1.55,
            color: "var(--md-sys-color-text-secondary)",
            textAlign: "center",
          }}
        >
          {slide.body}
        </motion.p>

        {/* Proof */}
        <motion.div
          initial={false}
          animate={active ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div style={{
            background: slide.accentSoft,
            border: `1px solid ${slide.accent}33`,
            borderRadius: 24,
            padding: "6px 16px",
            fontSize: 13, fontWeight: 600,
            color: slide.accent,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            {slide.proof}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragStart = useRef(0);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function goTo(next: number) {
    if (next < 0 || next >= SLIDES.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }

  function handleNext() {
    if (isLast) {
      router.push("/home");
    } else {
      goTo(index + 1);
    }
  }

  function handleSkip() {
    router.push("/home");
  }

  function handleDragStart(_: PointerEvent, info: { point: { x: number } }) {
    dragStart.current = info.point.x;
  }

  function handleDragEnd(_: PointerEvent, info: { point: { x: number }; velocity: { x: number } }) {
    const delta = info.point.x - dragStart.current;
    if (Math.abs(delta) > 50 || Math.abs(info.velocity.x) > 400) {
      if (delta < 0) goTo(index + 1);
      else goTo(index - 1);
    }
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "var(--md-sys-color-background)" }}>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: "absolute",
          top: 52, right: 20,
          zIndex: 20,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 14, fontWeight: 600,
          color: "var(--md-sys-color-text-muted)",
          padding: "8px 4px",
          letterSpacing: "0.01em",
        }}
      >
        Skip
      </button>

      {/* Slides */}
      <div
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
        onPointerDown={(e) => handleDragStart(e.nativeEvent as unknown as PointerEvent, { point: { x: e.clientX } })}
        onPointerUp={(e) => {
          const delta = e.clientX - dragStart.current;
          if (Math.abs(delta) > 50) {
            if (delta < 0) goTo(index + 1);
            else goTo(index - 1);
          }
        }}
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.18, 1] }}
            style={{ position: "absolute", inset: 0, paddingBottom: 112 }}
          >
            <Slide slide={slide} active={true} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 112,
          padding: "0 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          background: `linear-gradient(to top, var(--md-sys-color-background) 70%, transparent)`,
          zIndex: 10,
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex", alignItems: "center",
              }}
            >
              <motion.div
                animate={{
                  width: i === index ? 20 : 6,
                  background: i === index ? slide.accent : "rgba(255,255,255,0.18)",
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: 6,
                  borderRadius: 3,
                }}
              />
            </button>
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          onClick={handleNext}
          animate={{ background: slide.accent }}
          transition={{ duration: 0.35 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 26,
            border: "none",
            cursor: "pointer",
            fontSize: 16, fontWeight: 700,
            color: "#111420",
            letterSpacing: "0.01em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {isLast ? "Get started →" : "Next"}
        </motion.button>
      </div>

    </div>
  );
}
