"use client";

/**
 * FLUTTER HANDOFF: ProfileScreen
 * Route: /profile
 * Reached via the profile button on Home or Accounts.
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-text-primary,
 *         --md-sys-color-text-muted, --md-sys-color-text-disabled, --md-sys-color-brand-coral,
 *         --md-sys-color-error, --md-sys-color-dark-primary, --md-sys-color-alpha-white-10, --radius-md
 * Flutter equivalent: profile_page.dart
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

function RequestDeleteSheet({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const root = typeof document !== "undefined" ? document.getElementById("phone-overlay-root") : null;

  function handleClose() {
    setIsVisible(false);
  }

  function handleSend() {
    setSending(true);
    setTimeout(() => { onSent(); }, 900);
  }

  if (!root) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="absolute left-0 right-0 flex flex-col"
            style={{
              bottom: "max(0px, calc(876px - 100vh))",
              background: "var(--md-sys-color-dark-primary)",
              borderRadius: "20px 20px 0 0",
              padding: "22px 20px 32px",
              maxHeight: "85%",
              overflowY: "auto",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--md-sys-color-text-primary)",
                textAlign: "center",
                marginBottom: 10,
                fontFamily: "Roboto Slab, Georgia, serif",
              }}
            >
              Request data deletion
            </h2>

            <p
              style={{
                fontSize: 14.5,
                color: "var(--md-sys-color-text-secondary)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              Data deletion is managed by your team admin. Send them a request and they'll take care of it — usually within one business day.
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for your admin (optional)"
              rows={3}
              style={{
                width: "100%",
                background: "var(--md-sys-color-dark-secondary)",
                border: "1px solid var(--md-sys-color-alpha-white-10)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                fontSize: 14,
                color: "var(--md-sys-color-text-primary)",
                resize: "none",
                outline: "none",
                marginBottom: 14,
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full flex items-center justify-center active:opacity-80 transition-opacity"
              style={{
                height: 50,
                borderRadius: "var(--radius-full)",
                background: "var(--md-sys-color-error)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? "Sending…" : "Send deletion request"}
            </button>

            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center active:opacity-60 transition-opacity"
              style={{ height: 44, fontSize: 15, color: "var(--md-sys-color-text-muted)" }}
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    root
  );
}

function RequestSentSheet({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const root = typeof document !== "undefined" ? document.getElementById("phone-overlay-root") : null;

  if (!root) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
          />
          <motion.div
            className="absolute left-0 right-0 flex flex-col items-center"
            style={{
              bottom: "max(0px, calc(876px - 100vh))",
              background: "var(--md-sys-color-dark-primary)",
              borderRadius: "20px 20px 0 0",
              padding: "36px 20px 44px",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(46,204,113,0.12)",
                border: "1px solid rgba(46,204,113,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Icon name="check" size={26} style={{ color: "var(--md-sys-color-success)" }} />
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--md-sys-color-text-primary)",
                marginBottom: 10,
                fontFamily: "Roboto Slab, Georgia, serif",
              }}
            >
              Request sent
            </h2>
            <p
              style={{
                fontSize: 14.5,
                color: "var(--md-sys-color-text-secondary)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: 28,
                maxWidth: 280,
              }}
            >
              Your admin has been notified and will process your deletion request.
            </p>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full flex items-center justify-center active:opacity-80 transition-opacity"
              style={{
                height: 50,
                borderRadius: "var(--radius-full)",
                background: "var(--md-sys-color-dark-secondary)",
                border: "1px solid var(--md-sys-color-alpha-white-10)",
                color: "var(--md-sys-color-text-primary)",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    root
  );
}

const MENU_ITEMS = [
  { label: "Report a Bug" },
  { label: "Suggest a Feature" },
  { label: "Support" },
  { label: "Switch Tenant" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [showSentSheet, setShowSentSheet] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-6">
        <button
          onClick={() => router.back()}
          className="p-1 active:opacity-60 transition-opacity"
        >
          <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <h1
          className="text-[18px] font-bold"
          style={{ color: "var(--md-sys-color-text-primary)" }}
        >
          Profile
        </h1>
        <button
          className="text-sm-bold active:opacity-60 transition-opacity"
          style={{ color: "var(--md-sys-color-brand-coral)" }}
        >
          Log Out
        </button>
      </div>

      {/* Avatar + user info */}
      <div className="flex flex-col items-center px-4 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#607D8B" }}
        >
          <span className="text-[32px] font-bold" style={{ color: "#fff" }}>N</span>
        </div>
        <h2
          className="text-[22px] font-bold mb-1"
          style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
        >
          Nate Smith
        </h2>
        <p className="text-sm mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>
          nsmith@halosight.com
        </p>
        <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
          Halosight - Area51
        </p>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 px-4 mb-6">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span className="text-base-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
              {item.label}
            </span>
            <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
          </button>
        ))}
      </div>

      {/* App version */}
      <p className="text-center text-xs mb-8" style={{ color: "var(--md-sys-color-text-disabled)" }}>
        App Version 1.3.5+163
      </p>

      {/* Delete all data */}
      <button
        onClick={() => setShowDeleteSheet(true)}
        className="w-full flex justify-center pb-8 active:opacity-60 transition-opacity"
      >
        <span style={{ fontSize: 13, color: "var(--md-sys-color-error)", opacity: 0.7 }}>
          Delete all data
        </span>
      </button>

      {/* Sheets */}
      {showDeleteSheet && (
        <RequestDeleteSheet
          onClose={() => setShowDeleteSheet(false)}
          onSent={() => { setShowDeleteSheet(false); setShowSentSheet(true); }}
        />
      )}
      {showSentSheet && (
        <RequestSentSheet onClose={() => setShowSentSheet(false)} />
      )}

    </div>
  );
}
