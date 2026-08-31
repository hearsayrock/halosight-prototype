"use client";

/**
 * FLUTTER HANDOFF: CreateLeadSheet
 * Widget: StatefulWidget (full-page push overlay)
 * State: name, contactName, contactEmail, contactPhone, contactTitle, leadSource, industry,
 *        nameFocused, isVisible, duplicates, dupeState, dismissed
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --md-sys-color-warning,
 *         --radius-xl, --radius-full, --radius-lg
 *
 * Portals into #phone-overlay-root.
 * Slides in from the right like a push navigation.
 * Debounced duplicate detection on company name.
 * CTA anchored to bottom; rises with keyboard via --keyboard-inset.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import type { Account } from "@/lib/types";
import { mockAccounts } from "@/lib/mock-data/accounts";

const INDUSTRIES = [
  "Agriculture","Construction","Education","Energy","Finance",
  "Healthcare","Hospitality","Manufacturing","Retail","Technology",
  "Transportation","Other",
];

const LEAD_SOURCES = [
  "Cold Call","Email","Referral","Website","Trade Show","Social Media","Other",
];

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
      <div className="flex items-center gap-2 mb-3">
        <Icon name="warning" fill size={16} style={{ color: "var(--md-sys-color-warning)", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--md-sys-color-warning)" }}>
          Possible match{matches.length > 1 ? "es" : ""} found
        </span>
      </div>

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
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }} className="truncate">
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
  const [name,         setName]         = useState("");
  const [contactName,  setContactName]  = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [leadSource,   setLeadSource]   = useState("");
  const [industry,     setIndustry]     = useState("");
  const [nameFocused,  setNameFocused]  = useState(false);
  const [isVisible,    setIsVisible]    = useState(true);
  const [dupeState,    setDupeState]    = useState<DupeState>("idle");
  const [duplicates,   setDuplicates]   = useState<Account[]>([]);
  const [dismissed,    setDismissed]    = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dupeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 380);
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
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      phone: contactPhone.trim() || undefined,
      contactTitle: contactTitle.trim() || undefined,
      leadSource: leadSource || undefined,
      industry: industry || undefined,
      distanceMiles: 0,
      lastVisited: new Date(),
      taskCount: 0,
    });
    setIsVisible(false);
  }

  function handleViewExisting(account: Account) {
    setIsVisible(false);
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
        <motion.div
          className="absolute inset-0 flex flex-col"
          style={{ background: "var(--md-sys-color-background)", pointerEvents: "auto", zIndex: 10 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
        >
          {/* Header */}
          <div style={{ paddingTop: 52, paddingLeft: 8, paddingRight: 20, paddingBottom: 4, flexShrink: 0 }}>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 active:opacity-60 transition-opacity"
            >
              <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
            </button>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--md-sys-color-text-primary)",
                fontFamily: "Roboto Slab, Georgia, serif",
                paddingLeft: 8,
                paddingTop: 8,
                paddingBottom: 4,
              }}
            >
              Add new lead
            </h1>
          </div>

          {/* Scrollable form */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 8px" }}>

            {/* Company Name with dupe detection */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>
                Company Name<span style={{ color: "var(--md-sys-color-neonindigo)", marginLeft: 3 }}>*</span>
              </FieldLabel>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. Saddleback Fleet Services"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && !showDupeCallout) handleCreate(); }}
                  className="w-full outline-none px-4 py-4 text-[17px]"
                  style={{
                    background: "var(--md-sys-color-dark-secondary)",
                    borderRadius: "var(--radius-lg)",
                    color: "var(--md-sys-color-text-primary)",
                    border: `1.5px solid ${
                      showDupeCallout
                        ? "rgba(245, 166, 35, 0.45)"
                        : nameFocused
                          ? "rgba(139,146,255,0.55)"
                          : "rgba(255,255,255,0.08)"
                    }`,
                    transition: "border-color 0.15s",
                    paddingRight: dupeState === "checking" ? 44 : undefined,
                  }}
                />
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

            {/* Primary Contact */}
            <FieldLabel style={{ marginBottom: 10 }}>Primary Contact</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <TextInput
                placeholder="Full Name"
                value={contactName}
                onChange={setContactName}
              />
              <TextInput
                type="email"
                placeholder="Email"
                value={contactEmail}
                onChange={setContactEmail}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <TextInput
                  type="tel"
                  placeholder="Phone"
                  value={contactPhone}
                  onChange={setContactPhone}
                />
                <TextInput
                  placeholder="Title / Role"
                  value={contactTitle}
                  onChange={setContactTitle}
                />
              </div>
            </div>

            {/* Lead Source + Industry */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <div>
                <FieldLabel>Lead Source</FieldLabel>
                <SelectField value={leadSource} onChange={setLeadSource} options={LEAD_SOURCES} placeholder="Select" />
              </div>
              <div>
                <FieldLabel>Industry</FieldLabel>
                <SelectField value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select" />
              </div>
            </div>

          </div>

          {/* Anchored CTA — rises with keyboard */}
          <div
            style={{
              flexShrink: 0,
              padding: "12px 20px",
              paddingBottom: "calc(24px + var(--keyboard-inset, 0px))",
              transition: "padding-bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
              borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
            }}
          >
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
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

function FieldLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      color: "var(--md-sys-color-text-disabled)",
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 6,
      ...style,
    }}>
      {children}
    </p>
  );
}

function TextInput({ type = "text", placeholder, value, onChange }: {
  type?: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full outline-none px-4 py-3.5 text-[15px]"
      style={{
        background: "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-lg)",
        color: "var(--md-sys-color-text-primary)",
        border: "1.5px solid rgba(255,255,255,0.08)",
      }}
    />
  );
}

function SelectField({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="outline-none px-4 py-3.5 text-[15px]"
      style={{
        background: "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-lg)",
        color: value ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)",
        border: "1.5px solid rgba(255,255,255,0.08)",
        width: "100%",
        appearance: "none",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "var(--md-sys-color-background)", color: "var(--md-sys-color-text-primary)" }}>
          {o}
        </option>
      ))}
    </select>
  );
}
