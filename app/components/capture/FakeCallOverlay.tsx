"use client";

/**
 * FakeCallOverlay — prototype-only iOS-style incoming call UI.
 * Portals into phone-overlay-root.
 *
 * States driven by FakeCallContext:
 *   ringing   → compact banner at top (slides down from island), z-60
 *   active    → full-screen takeover in front of everything, z-60
 *   voicemail → compact missed-call banner, auto-dismisses
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useFakeCall } from "@/lib/context/FakeCallContext";
import Icon from "@/components/ui/Icon";

// ── Elapsed timer for active call ────────────────────────────────────────────

function useElapsed(active: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!active) { setS(0); return; }
    const id = setInterval(() => setS(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── Compact icon button (ringing / voicemail banners) ────────────────────────

function BannerButton({ icon, bg, onClick }: { icon: string; bg: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        background: bg, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "opacity 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseDown={e => (e.currentTarget.style.opacity = "0.7")}
      onMouseUp={e => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      <Icon name={icon} size={22} fill style={{ color: "#fff" }} />
    </button>
  );
}

// ── Ringing banner (compact, slides from top) ─────────────────────────────────

function RingingBanner({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <motion.div
      key="ringing-banner"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        zIndex: 60,
        pointerEvents: "auto",
        background: "rgba(28, 28, 30, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 20,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 6px 32px rgba(0,0,0,0.55)",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name="person" size={24} fill style={{ color: "rgba(255,255,255,0.55)" }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "system-ui, -apple-system", marginBottom: 2 }}>
          Incoming Call
        </p>
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: "system-ui, -apple-system" }}>
          Unknown
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <BannerButton icon="call_end" bg="#FF3B30" onClick={onDecline} />
        <BannerButton icon="call"     bg="#34C759" onClick={onAccept}  />
      </div>
    </motion.div>
  );
}

// ── Missed call banner (voicemail) ────────────────────────────────────────────

function VoicemailBanner() {
  return (
    <motion.div
      key="voicemail-banner"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        zIndex: 60,
        pointerEvents: "none",
        background: "rgba(28, 28, 30, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 20,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 6px 32px rgba(0,0,0,0.55)",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name="voicemail" size={22} style={{ color: "rgba(255,255,255,0.45)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "system-ui, -apple-system", marginBottom: 2 }}>
          Missed Call
        </p>
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: "system-ui, -apple-system" }}>
          Sent to voicemail
        </p>
      </div>
    </motion.div>
  );
}

// ── Active call: compact island widget ───────────────────────────────────────

function ActiveCallBanner({ elapsed, onEnd }: { elapsed: string; onEnd: () => void }) {
  return (
    <motion.div
      key="active-call-banner"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        zIndex: 60,
        pointerEvents: "auto",
        background: "rgba(28, 28, 30, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 20,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 6px 32px rgba(0,0,0,0.55)",
      }}
    >
      {/* Green active-call dot + caller */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#34C759",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="call" size={18} fill style={{ color: "#fff" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "system-ui, -apple-system", lineHeight: 1.2 }}>
            Unknown
          </p>
          <p style={{ color: "#34C759", fontSize: 12, fontFamily: "system-ui, -apple-system", fontVariantNumeric: "tabular-nums" }}>
            {elapsed}
          </p>
        </div>
      </div>

      {/* End button */}
      <BannerButton icon="call_end" bg="#FF3B30" onClick={onEnd} />
    </motion.div>
  );
}

// ── Overlay root ──────────────────────────────────────────────────────────────

export default function FakeCallOverlay() {
  const { callStatus, acceptCall, rejectCall, endCall } = useFakeCall();
  const elapsed = useElapsed(callStatus === "active");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const overlayRoot = mounted ? document.getElementById("phone-overlay-root") : null;
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence>
      {callStatus === "ringing" && (
        <RingingBanner key="ringing" onAccept={acceptCall} onDecline={rejectCall} />
      )}
      {callStatus === "active" && (
        <ActiveCallBanner key="active" elapsed={elapsed} onEnd={endCall} />
      )}
      {callStatus === "voicemail" && (
        <VoicemailBanner key="voicemail" />
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
