"use client";

/**
 * FLUTTER HANDOFF: VoiceAtmosphere
 * Widget: StatefulWidget with two AnimationControllers (one repeating, one driven by the voice level) painting behind the chat
 * Props: phase ("listening" | "thinking" | "speaking"), level? (MotionValue 0–1; omitted = a simulated speech level)
 * Flutter equivalent: voice_atmosphere.dart (CustomPaint or ShaderMask over a Stack, ignoring pointers)
 *
 * The coloured haze behind a voice conversation. It sits behind the messages, over the whole panel, and changes with the phase:
 *   listening — an indigo haze rises from the bottom edge and follows the sound of the person talking: its height and brightness
 *               track the microphone level (speech-like bursts and pauses in the prototype), two soft blobs drift sideways inside it
 *   thinking  — coral and indigo blobs flow along the bottom edge, sweeping side to side on 6–9.5s loops, ~200px tall, so it feels like
 *               the screen is working; it stays at the bottom
 *   speaking  — a low coral bloom hugging the bottom edge (about 150px tall, breathing on a 3s cycle); it stays near the bottom so it
 *               never covers the reply text
 *   Everything stays at the bottom of the panel; nothing wraps the edges. Colours cross-fade (~0.7s) between phases.
 *   Reduced motion: levels and drifting hold still.
 * Tokens: color.neonindigo / neonindigo-light / neonindigo-dark, color.brand.coral / coral-dark (all mixed to transparent)
 */

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import type { VoicePhase } from "@/components/chat/ChatVoiceDock";

/** A believable speech level: bursts of 0.35–1 lasting ~0.1–0.3s, separated by short pauses, with a fast rise and slow fall. */
export function useSpeechLevel(active: boolean): MotionValue<number> {
  const level = useMotionValue(0.25);
  const reduce = useReducedMotion() ?? false;
  useEffect(() => {
    if (!active || reduce) { level.set(0.35); return; }
    let raf = 0;
    let target = 0.2;
    let next = 0;
    let v = level.get();
    const tick = (t: number) => {
      if (t > next) {
        const burst = Math.random() < 0.72;
        target = burst ? 0.35 + Math.random() * 0.65 : 0.05 + Math.random() * 0.1;
        next = t + (burst ? 90 + Math.random() * 220 : 140 + Math.random() * 260);
      }
      v += (target - v) * (target > v ? 0.25 : 0.08);
      level.set(v);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce, level]);
  return level;
}

const fade = { duration: 0.7, ease: "easeInOut" as const };

export default function VoiceAtmosphere({ phase, level }: { phase: VoicePhase; level?: MotionValue<number> }) {
  const reduce = useReducedMotion() ?? false;
  const own = useSpeechLevel(phase === "listening" && !level);
  const lv = level ?? own;
  const scaleY = useTransform(lv, [0, 1], [0.45, 1.25]);
  const glow = useTransform(lv, [0, 1], [0.5, 1]);

  const listening = phase === "listening";
  const thinking = phase === "thinking";
  const speaking = phase === "speaking";

    return (
    <div aria-hidden className="absolute inset-0" style={{ pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {/* Listening: haze that rises with the voice */}
      <motion.div className="absolute left-0 right-0 bottom-0" animate={{ opacity: listening ? 1 : 0 }} transition={fade} style={{ height: 300 }}>
        <motion.div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: 300, scaleY, opacity: glow, transformOrigin: "50% 100%", filter: "blur(22px)",
            background:
              "radial-gradient(120% 100% at 50% 110%, color-mix(in srgb, var(--md-sys-color-neonindigo-light) 70%, transparent) 0%, color-mix(in srgb, var(--md-sys-color-neonindigo) 38%, transparent) 42%, transparent 78%)",
          }}
        />
        {[
          { left: "-12%", size: 220, x: [0, 60, -20, 0], dur: 8 },
          { left: "58%",  size: 200, x: [0, -70, 25, 0],  dur: 10 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: b.left, bottom: -90, width: b.size, height: b.size, borderRadius: "var(--radius-full)", filter: "blur(34px)", opacity: glow,
              background: "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-neonindigo) 55%, transparent) 0%, transparent 70%)" }}
            animate={reduce ? undefined : { x: b.x }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* Speaking: a low coral bloom at the bottom edge */}
      <motion.div className="absolute left-0 right-0 bottom-0" animate={{ opacity: speaking ? 1 : 0 }} transition={fade} style={{ height: 150 }}>
        <motion.div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: 150, transformOrigin: "50% 100%", filter: "blur(18px)",
            background:
              "radial-gradient(110% 100% at 50% 115%, color-mix(in srgb, var(--md-sys-color-brand-coral) 62%, transparent) 0%, color-mix(in srgb, var(--md-sys-color-brand-coral-dark) 32%, transparent) 45%, transparent 78%)",
          }}
          animate={reduce ? undefined : { scaleY: [0.85, 1.1, 0.85], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Thinking: coral and indigo flow along the bottom edge, sweeping side to side */}
      <motion.div className="absolute left-0 right-0 bottom-0" animate={{ opacity: thinking ? 1 : 0 }} transition={fade} style={{ height: 200 }}>
        {[
          { color: "var(--md-sys-color-brand-coral)",       size: 240, x: ["-20%", "70%", "-20%"],  dur: 7,   delay: 0 },
          { color: "var(--md-sys-color-neonindigo)",         size: 260, x: ["60%", "-15%", "60%"],   dur: 8.5, delay: 0 },
          { color: "var(--md-sys-color-brand-coral-dark)",   size: 210, x: ["20%", "85%", "20%"],    dur: 6,   delay: 0 },
          { color: "var(--md-sys-color-neonindigo-light)",   size: 220, x: ["80%", "5%", "80%"],     dur: 9.5, delay: 0 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              bottom: -110, left: 0, width: b.size, height: b.size, borderRadius: "var(--radius-full)", filter: "blur(30px)",
              background: `radial-gradient(circle, color-mix(in srgb, ${b.color} 62%, transparent) 0%, transparent 70%)`,
            }}
            animate={reduce ? undefined : { left: b.x, y: [0, -14, 6, 0], scale: [1, 1.12, 0.94, 1] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>
    </div>
  );
}
