"use client";

/**
 * FakeCallOverlay — prototype-only iOS-style incoming call UI.
 * Portals into phone-overlay-root at z-40, below CaptureWidget (z-50),
 * so the capture widget remains visible above the call screen.
 *
 * States driven by FakeCallContext:
 *   ringing  → incoming call UI (decline / accept)
 *   active   → in-call UI (mute/keypad grid + end call)
 *   voicemail→ brief "sent to voicemail" notice, auto-dismisses
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

// ── Shared iOS status bar ─────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px 0", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "system-ui, -apple-system" }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <Icon name="signal_cellular_alt" size={15} fill style={{ color: "#fff" }} />
        <Icon name="wifi" size={15} fill style={{ color: "#fff" }} />
        <Icon name="battery_5_bar" size={15} fill style={{ color: "#fff" }} />
      </div>
    </div>
  );
}

// ── Action button (in-call grid) ──────────────────────────────────────────────

function CallAction({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={26} fill style={{ color: "#fff" }} />
      </div>
      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "system-ui, -apple-system", textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}

// ── Round call button (decline / accept / end) ────────────────────────────────

function CallButton({ icon, bg, label, onClick }: { icon: string; bg: string; label: string; onClick: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button
        onClick={onClick}
        style={{
          width: 72, height: 72, borderRadius: "50%",
          background: bg, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.15s", WebkitTapHighlightColor: "transparent",
        }}
        onMouseDown={e => (e.currentTarget.style.opacity = "0.75")}
        onMouseUp={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <Icon name={icon} size={32} fill style={{ color: "#fff" }} />
      </button>
      <span style={{ color: "#fff", fontSize: 13, fontFamily: "system-ui, -apple-system", fontWeight: 400 }}>
        {label}
      </span>
    </div>
  );
}

// ── Ringing screen ────────────────────────────────────────────────────────────

function RingingUI({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 108 }}>
      {/* Contact info */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <Icon name="person" size={44} fill style={{ color: "rgba(255,255,255,0.6)" }} />
        </div>
        <span style={{ color: "#fff", fontSize: 30, fontWeight: 600, fontFamily: "system-ui, -apple-system", letterSpacing: -0.5 }}>
          Unknown
        </span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, fontFamily: "system-ui, -apple-system", marginTop: 6 }}>
          Incoming Call
        </span>
      </div>

      {/* Decline / Accept */}
      <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: 24, paddingRight: 24 }}>
        <CallButton icon="call_end" bg="#FF3B30" label="Decline" onClick={onDecline} />
        <CallButton icon="call"     bg="#34C759" label="Accept"  onClick={onAccept}  />
      </div>
    </div>
  );
}

// ── Active call screen ────────────────────────────────────────────────────────

const IN_CALL_ACTIONS = [
  { icon: "mic_off",    label: "mute"     },
  { icon: "dialpad",    label: "keypad"   },
  { icon: "volume_up",  label: "audio"    },
  { icon: "add_call",   label: "add"      },
  { icon: "pause",      label: "hold"     },
  { icon: "videocam",   label: "FaceTime" },
];

function ActiveCallUI({ elapsed, onEnd }: { elapsed: string; onEnd: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 108 }}>
      {/* Call header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32 }}>
        <span style={{ color: "#fff", fontSize: 26, fontWeight: 600, fontFamily: "system-ui, -apple-system", letterSpacing: -0.5 }}>
          Unknown
        </span>
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, fontFamily: "system-ui, -apple-system", marginTop: 4 }}>
          {elapsed}
        </span>
      </div>

      {/* Action grid — 3×2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px 0", padding: "0 32px" }}>
        {IN_CALL_ACTIONS.map(a => <CallAction key={a.label} icon={a.icon} label={a.label} />)}
      </div>

      {/* End call */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CallButton icon="call_end" bg="#FF3B30" label="End Call" onClick={onEnd} />
      </div>
    </div>
  );
}

// ── Voicemail notice ──────────────────────────────────────────────────────────

function VoicemailUI() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <Icon name="voicemail" size={36} style={{ color: "rgba(255,255,255,0.5)" }} />
      <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, fontFamily: "system-ui, -apple-system" }}>
        Missed Call
      </span>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "system-ui, -apple-system" }}>
        Sent to voicemail
      </span>
    </div>
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
      {callStatus !== "idle" && (
        <motion.div
          key="fake-call-overlay"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: [0.32, 0, 0.18, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            background: "linear-gradient(160deg, #1a1a2e 0%, #0d1117 60%, #141824 100%)",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StatusBar />
          {callStatus === "ringing"  && <RingingUI  onAccept={acceptCall} onDecline={rejectCall} />}
          {callStatus === "active"   && <ActiveCallUI elapsed={elapsed} onEnd={endCall} />}
          {callStatus === "voicemail"&& <VoicemailUI />}
        </motion.div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
