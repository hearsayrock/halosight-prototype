"use client";

/**
 * FLUTTER HANDOFF: CreateLeadSheet
 * Widget: StatefulWidget (bottom sheet)
 * State: name, isVisible, duplicates, dupeState, dismissed
 * Props: onClose, onCreated(Account), initialName?, duplicateDetection? (default true)
 * Fields: one TextField ("Company"); the warning stroke shows while a possible duplicate is on screen. The checking spinner is its trailing slot.
 * Tokens: color.dark.secondary (field, via TextField), color.neonindigo.base (active stroke, AI hint), color.alpha.neonindigo-10 (AI hint fill),
 *         color.semantic.warning * (duplicate callout and field stroke), color.text.primary / muted, radius.lg, radius.sm *
 * Portals into #phone-overlay-root.
 * Duplicate detection is configurable for search-created leads; the search flow can skip it:
 *   - 400ms after typing stops, fuzzy-matches against all accounts
 *   - Shows amber callout if matches found (max 2 shown)
 *   - "View existing" navigates to account detail
 *   - "Create anyway" dismisses callout and continues normally
 */

import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { DrawerBackdrop, DrawerPanel } from "@/components/ui/Drawer";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import type { Account } from "@/lib/types";
import { mockAccounts } from "@/lib/mock-data/accounts";

interface Props {
  onClose: () => void;
  onCreated: (account: Account) => void;
  initialName?: string;
  duplicateDetection?: boolean;
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
        background: "color-mix(in srgb, var(--md-sys-color-warning) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--md-sys-color-warning) 30%, transparent)",
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
              background: "color-mix(in srgb, var(--md-sys-color-warning) 8%, transparent)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid color-mix(in srgb, var(--md-sys-color-warning) 18%, transparent)",
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

export default function CreateLeadSheet({ onClose, onCreated, initialName = "", duplicateDetection = true }: Props) {
  const router = useRouter();
  const [name,       setName]       = useState(initialName);
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
    if (!duplicateDetection) {
      if (dupeTimerRef.current) clearTimeout(dupeTimerRef.current);
      setDupeState("idle");
      setDuplicates([]);
      setDismissed(false);
      return;
    }
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
  }, [duplicateDetection]);

  useEffect(() => { runDupeCheck(initialName); }, [initialName, runDupeCheck]);

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

  const showDupeCallout = duplicateDetection && dupeState === "found" && !dismissed;

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>

          {/* Backdrop + panel (shared drawer chrome) */}
      <DrawerBackdrop onClick={() => setIsVisible(false)} />
      <DrawerPanel maxHeight="88%" keyboardAware>

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
                <TextField
                  inputRef={inputRef}
                  label="Company"
                  placeholder="e.g. Saddleback Fleet Services"
                  value={name}
                  onChange={handleNameChange}
                  onSubmit={() => { if (name.trim() && !showDupeCallout) handleCreate(); }}
                  status={showDupeCallout ? "warning" : undefined}
                  trailing={dupeState === "checking" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      style={{
                        width: 16, height: 16,
                        borderRadius: "50%",
                        border: "2px solid color-mix(in srgb, var(--md-sys-color-neonindigo) 25%, transparent)",
                        borderTopColor: "var(--md-sys-color-neonindigo)",
                      }}
                    />
                  ) : undefined}
                />
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
              <Button fill="indigo" size="lg" fullWidth keepFocus disabled={!name.trim()} onClick={handleCreate}>
                Create a lead
              </Button>

            </div>
          </DrawerPanel>

        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
