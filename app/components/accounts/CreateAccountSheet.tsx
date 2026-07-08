"use client";

/**
 * FLUTTER HANDOFF: CreateAccountSheet
 * Widget: StatefulWidget (bottom sheet)
 * State: name, contactName, phone, address, city, state, showDetails
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --md-sys-color-brand-coral,
 *         --radius-xl, --radius-full, --radius-sm
 *
 * Portals into #phone-overlay-root.
 * Design: company name only upfront; AI pill hint; purple CTA.
 * "Add more details" expands optional contact/address fields below the CTA.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import type { Account } from "@/lib/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface Props {
  initialName?: string;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

export default function CreateAccountSheet({ initialName = "", onClose, onCreated }: Props) {
  const [name,        setName]        = useState(initialName);
  const [contactName, setContactName] = useState("");
  const [phone,       setPhone]       = useState("");
  const [address,     setAddress]     = useState("");
  const [city,        setCity]        = useState("");
  const [stateVal,    setStateVal]    = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible,   setIsVisible]   = useState(true);
  const [focused,     setFocused]     = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreated({
      id: `hs-${Date.now()}`,
      name: trimmed,
      type: "standalone",
      halosightType: "prospect",
      contactName: contactName.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: stateVal.trim() || undefined,
      distanceMiles: 0,
      lastVisited: new Date(),
      taskCount: 0,
    });
    setIsVisible(false);
  }

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
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. Saddleback Fleet Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleCreate(); }}
                  className="w-full text-[17px] font-medium outline-none px-4 py-4"
                  style={{
                    background: "var(--md-sys-color-dark-secondary)",
                    borderRadius: "var(--radius-lg)",
                    color: "var(--md-sys-color-text-primary)",
                    border: `1.5px solid ${focused ? "rgba(139,146,255,0.55)" : "rgba(255,255,255,0.08)"}`,
                    transition: "border-color 0.15s",
                  }}
                />
              </div>

              {/* AI hint — informational only, not a field */}
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

              {/* Create CTA */}
              <button
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

function OptionalField({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--md-sys-color-text-disabled)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </p>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[14px] outline-none px-3 py-2.5"
        style={{ background: "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-sm)", color: "var(--md-sys-color-text-primary)" }}
      />
    </div>
  );
}
