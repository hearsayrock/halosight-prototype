"use client";

/**
 * FLUTTER HANDOFF: ProfileScreen
 * Route: /profile
 * Reached via the profile button on Home or Accounts.
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-primary,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-brand-coral, --md-sys-color-brand-coral-light, --md-sys-color-brand-teal,
 *         --md-sys-color-neonindigo, --md-sys-color-alpha-neonindigo-10, --md-sys-color-alpha-neonindigo-12,
 *         --md-sys-color-alpha-neonindigo-18, --md-sys-color-alpha-neonindigo-25,
 *         --md-sys-color-alpha-coral-12, --md-sys-color-alpha-coral-25,
 *         --md-sys-color-alpha-white-10, --md-sys-color-scrim,
 *         --radius-md, --radius-xl, --radius-full
 * Flutter equivalent: profile_page.dart
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

function DeleteDataSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const confirmed = inputValue.toLowerCase() === "delete";

  // Push the sheet up when the software keyboard appears.
  // On real mobile, visualViewport fires; on desktop we use focus/blur as fallback.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKeyboardOffset(Math.max(0, window.innerHeight - vv.height));
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, []);

  const overlayRoot = typeof document !== "undefined" ? document.getElementById("phone-overlay-root") : null;
  if (!overlayRoot) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--md-sys-color-scrim)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: keyboardOffset,
        zIndex: 80,
        pointerEvents: "auto",
        transition: "padding-bottom 0.15s ease-out",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--md-sys-color-dark-primary)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          padding: "28px 20px 40px",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4,
          background: "var(--md-sys-color-alpha-white-10)",
          borderRadius: "var(--radius-full)",
          margin: "-12px auto 24px",
        }} />

        {/* Warning icon */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56, height: 56,
            borderRadius: "var(--radius-full)",
            background: "var(--md-sys-color-alpha-coral-12)",
            border: "1px solid var(--md-sys-color-alpha-coral-25)",
          }}>
            <Icon name="delete_forever" size={28} style={{ color: "var(--md-sys-color-brand-coral)" }} />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--md-sys-color-text-primary)",
          textAlign: "center",
          marginBottom: 10,
          fontFamily: "Roboto Slab, Georgia, serif",
        }}>
          Delete all data?
        </h2>
        <p style={{
          fontSize: 14,
          color: "var(--md-sys-color-text-muted)",
          textAlign: "center",
          lineHeight: 1.55,
          marginBottom: 28,
        }}>
          This removes all imported accounts, activity, and settings from this session.{" "}
          <strong style={{ color: "var(--md-sys-color-text-secondary)", fontWeight: 600 }}>This cannot be undone.</strong>
        </p>

        {/* Confirm input */}
        <label style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--md-sys-color-text-muted)",
          marginBottom: 8,
        }}>
          Type DELETE to confirm
        </label>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setKeyboardOffset((prev) => Math.max(prev, 260))}
          onBlur={() => setKeyboardOffset(0)}
          placeholder="DELETE"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="placeholder:[color:var(--md-sys-color-text-disabled)]"
          style={{
            display: "block",
            width: "100%",
            background: "var(--md-sys-color-background)",
            border: `1px solid ${confirmed ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-alpha-white-10)"}`,
            borderRadius: "var(--radius-md)",
            padding: "13px 14px",
            fontSize: 15,
            color: "var(--md-sys-color-text-primary)",
            outline: "none",
            letterSpacing: "0.08em",
            marginBottom: 16,
            transition: "border-color 0.15s",
          }}
        />

        {/* Confirm button */}
        <button
          onClick={confirmed ? onConfirm : undefined}
          disabled={!confirmed}
          style={{
            display: "block",
            width: "100%",
            height: 50,
            borderRadius: "var(--radius-full)",
            background: confirmed ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-alpha-white-10)",
            color: confirmed ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)",
            fontSize: 16,
            fontWeight: 600,
            cursor: confirmed ? "pointer" : "not-allowed",
            transition: "background 0.18s, color 0.18s",
            marginBottom: 12,
          }}
        >
          Delete all data
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="active:opacity-60 transition-opacity"
          style={{
            display: "block",
            width: "100%",
            height: 46,
            fontSize: 15,
            fontWeight: 500,
            color: "var(--md-sys-color-text-muted)",
          }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>,
    overlayRoot
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

  function handleDeleteConfirm() {
    try { localStorage.clear(); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("halosight:data_deleted"));
    router.push("/relationships?preview=empty");
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
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
      <div className="flex flex-col items-center px-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ background: "var(--md-sys-color-brand-teal)" }}
        >
          <span className="text-[26px] font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>N</span>
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

      {/* Trial-mode card */}
      <div
        className="mx-4 mb-3 px-4 py-3 flex items-start gap-3"
        style={{
          background: "var(--md-sys-color-alpha-neonindigo-10)",
          border: "1px solid var(--md-sys-color-alpha-neonindigo-18)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <Icon
          name="science"
          size={18}
          style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0, marginTop: 1 }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>
              Halosight Lite
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.55 }}>
            You're exploring without a CRM connection. All data is local to this session.
          </p>
          <button
            onClick={() => router.push("/import/lite-vs-full")}
            className="mt-2 active:opacity-60 transition-opacity"
            style={{ fontSize: 13, color: "var(--md-sys-color-neonindigo)", fontWeight: 500 }}
          >
            See what's included in full Halosight
          </button>
        </div>
      </div>

      {/* Data & Connections row */}
      <div className="px-4 mb-2">
        <button
          onClick={() => router.push("/import/connections")}
          className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity"
          style={{
            background: "var(--md-sys-color-dark-secondary)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-base-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
              Data &amp; Connections
            </span>
            <span style={{ fontSize: 12.5, color: "var(--md-sys-color-text-muted)" }}>
              Salesforce, last imported Aug 24
            </span>
          </div>
          <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
        </button>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 px-4 mb-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity"
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
      <p className="text-center text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
        App Version 1.3.5+163
      </p>

      {/* Delete all data — tucked away at bottom */}
      <div className="flex justify-center mt-0 mb-6">
        <button
          onClick={() => setShowDeleteSheet(true)}
          className="active:opacity-60 transition-opacity px-3 py-2"
          style={{ fontSize: 13, color: "var(--md-sys-color-brand-coral-light)" }}
        >
          Delete all data
        </button>
      </div>

      {/* Delete confirmation sheet */}
      <AnimatePresence>
        {showDeleteSheet && (
          <DeleteDataSheet
            onClose={() => setShowDeleteSheet(false)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
