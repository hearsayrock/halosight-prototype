"use client";

/**
 * FLUTTER HANDOFF: CreateLeadSheet
 * Widget: StatefulWidget (bottom sheet)
 * State: name, focused, isVisible, duplicates, dupeState, dismissed
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --md-sys-color-warning, --md-sys-color-warning-surface,
 *         --md-sys-color-brand-coral, --radius-xl, --radius-full, --radius-lg
 *
 * Portals into #phone-overlay-root.
 * Extends CreateAccountSheet with debounced duplicate detection:
 *   - 400ms after typing stops, fuzzy-matches against all accounts
 *   - Shows amber callout if matches found (max 2 shown)
 *   - "View existing" navigates to account detail
 *   - "Create anyway" dismisses callout and continues normally
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import type { Account } from "@/lib/types";
import { mockAccounts } from "@/lib/mock-data/accounts";

interface Props {
  onClose: () => void;
  onCreated: (account: Account) => void;
}

type DupeState = "idle" | "checking" | "found" | "none";

function findDuplicates(query: string): Account[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return mockAccounts.filter((a) => {
    const name = a.name.toLowerCase();
    return name.includes(q) || q.includes(name);
  });
}

function DuplicateCallout({
  matches,
  onViewExisting,
  onCreateAnyway,
}: {
  matches: Account[];
  onViewExisting: (account: Account) => void;
  onCreateAnyway: () => void;
}) {
  const shown = matches.slice(0, 2);
  const overflow = matches.length - shown.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={{
        background: "rgba(245, 166, 35, 0.10)",
        border: "1px solid rgba(245, 166, 35, 0.30)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 14px",
        marginBottom: 14,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon name="warning" fill size={16} style={{ color: "var(--md-sys-color-warning)", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--md-sys-color-warning)" }}>
          Possible match{matches.length > 1 ? "es" : ""} found
        </span>
      </div>

      {/* Match cards */}
      <div className="flex flex-col gap-1.5 mb-3">
        {shown.map((account) => (
          <button
            key={account.id}
            onClick={() => onViewExisting(account)}
            className="w-full text-left flex items-center justify-between px-3 py-2.5 active:opacity-70 transition-opacity"
            style={{
              background: "rgba(245, 166, 35, 0.08)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(245, 166, 35, 0.18)",
            }}
          >
            <div className="min-w-0">
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}
                className="truncate">
                {account.name}
              </p>
              {(account.city || account.distanceMiles < 999) && (
                <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", marginTop: 1 }}>
                  {[
                    account.distanceMiles < 999 ? `${account.distanceMiles} mi` : null,
                    account.city && account.state ? `${account.city}, ${account.state}` : account.city,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-warning)", flexShrink: 0, marginLeft: 8 }}>
              View →
            </span>
          </button>
        ))}
        {overflow > 0 && (
          <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", textAlign: "center", paddingTop: 2 }}>
            +{overflow} more match{overflow > 1 ? "es" : ""}
          </p>
        )}
      </div>

      {/* Create anyway */}
      <button
        onClick={onCreateAnyway}
        className="w-full flex items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
        style={{ fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-muted)", paddingTop: 2 }}
      >
        <Icon name="add" size={14} style={{ color: "var(--md-sys-color-text-muted)" }} />
        Create anyway
      </button>
    </motion.div>
  );
}

export default function CreateLeadSheet({ onClose, onCreated }: Props) {
  const router = useRouter();
  const [name,       setName]       = useState("");
  const [focused,    setFocused]    = useState(false);
  const [isVisible,  setIsVisible]  = useState(true);
  const [dupeState,  setDupeState]  = useState<DupeState>("idle");
  const [duplicates, setDuplicates] = useState<Account[]>([]);
  const [dismissed,  setDismissed]  = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dupeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  const runDupeCheck = useCallback((value: string) => {
    if (dupeTimerRef.current) clearTimeout(dupeTimerRef.current);
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2) {
      setDupeState("idle");
      setDuplicates([]);
      setDismissed(false);
      return;
    }
    setDupeState("checking");
    dupeTimerRef.current = setTimeout(() => {
      const results = findDuplicates(trimmed);
      setDuplicates(results);
      setDupeState(results.length > 0 ? "found" : "none");
    }, 400);
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    setDismissed(false);
    runDupeCheck(value);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreated({
      id: `hs-${Date.now()}`,
      name: trimmed,
      type: "standalone",
      halosightType: "prospect",
      distanceMiles: 0,
      lastVisited: new Date(),
      taskCount: 0,
    });
    setIsVisible(false);
  }

  function handleViewExisting(account: Account) {
    setIsVisible(false);
    // Navigate after exit animation
    setTimeout(() => router.push(`/relationships/${account.id}`), 300);
  }

  const showDupeCallout = dupeState === "found" && !dismissed;

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>

          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsVisible(false)}
          />

          {/* Sheet */}
          <motion.div
            className="absolute left-0 right-0"
            style={{
              bottom: "var(--keyboard-inset, 0px)",
              transition: "bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
              background: "var(--md-sys-color-background)",
              borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
              maxHeight: "88%",
              overflowY: "auto",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
            </div>

            <div className="px-5 pt-4 pb-10">

              {/* Title */}
              <h2
                className="text-[28px] font-bold mb-6"
                style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
              >
                New Lead
              </h2>

              {/* Company field */}
              <div className="mb-3">
                <p
                  className="text-[11px] font-semibold mb-2"
                  style={{ color: "var(--md-sys-color-text-disabled)", letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  Company
                </p>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. Saddleback Fleet Services"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && !showDupeCallout) handleCreate(); }}
                    className="w-full text-[17px] font-medium outline-none px-4 py-4"
                    style={{
                      background: "var(--md-sys-color-dark-secondary)",
                      borderRadius: "var(--radius-lg)",
                      color: "var(--md-sys-color-text-primary)",
                      border: `1.5px solid ${
                        showDupeCallout
                          ? "rgba(245, 166, 35, 0.45)"
                          : focused
                            ? "rgba(139,146,255,0.55)"
                            : "rgba(255,255,255,0.08)"
                      }`,
                      transition: "border-color 0.15s",
                      paddingRight: dupeState === "checking" ? 44 : undefined,
                    }}
                  />
                  {/* Checking spinner */}
                  {dupeState === "checking" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{
                          width: 16, height: 16,
                          borderRadius: "50%",
                          border: "2px solid rgba(139,146,255,0.25)",
                          borderTopColor: "var(--md-sys-color-neonindigo)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Duplicate callout */}
              <AnimatePresence>
                {showDupeCallout && (
                  <DuplicateCallout
                    matches={duplicates}
                    onViewExisting={handleViewExisting}
                    onCreateAnyway={() => setDismissed(true)}
                  />
                )}
              </AnimatePresence>

              {/* AI hint */}
              {!showDupeCallout && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 mb-5"
                  style={{
                    background: "var(--md-sys-color-alpha-neonindigo-10)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <Icon name="auto_awesome" size={15} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
                  <span className="text-[13px] font-medium" style={{ color: "var(--md-sys-color-neonindigo)" }}>
                    Name it — AI fills the rest.
                  </span>
                </div>
              )}
              {showDupeCallout && <div style={{ height: 5 }} />}

              {/* Create CTA */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full font-semibold text-[16px] transition-opacity"
                style={{
                  height: 52,
                  background: "var(--md-sys-color-neonindigo)",
                  color: "var(--md-sys-color-text-primary)",
                  borderRadius: "var(--radius-full)",
                  opacity: name.trim() ? 1 : 0.4,
                }}
              >
                Create a lead
              </button>

            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
