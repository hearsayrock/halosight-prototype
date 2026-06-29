"use client";

/**
 * FLUTTER HANDOFF: CreateAccountSheet
 * Widget: StatefulWidget (bottom sheet, step: "form")
 * State: name, contactName, phone, address, city, state, showDetails
 * Tokens: --color-background, --color-dark-secondary, --color-dark-tertiary,
 *         --color-text-primary, --color-text-muted, --color-text-disabled,
 *         --color-brand-teal, --color-brand-purple, --color-brand-coral,
 *         --radius-xl, --radius-full, --radius-sm
 *
 * Portals into #phone-overlay-root.
 * Design: company name only upfront. AI disclosure explains required CRM fields
 * will be populated after the first meeting. "More details" expands optional fields.
 * All new companies created as halosightType "prospect" (CRM lead).
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
  const [name,         setName]         = useState(initialName);
  const [contactName,  setContactName]  = useState("");
  const [phone,        setPhone]        = useState("");
  const [address,      setAddress]      = useState("");
  const [city,         setCity]         = useState("");
  const [stateVal,     setStateVal]     = useState("");
  const [showDetails,  setShowDetails]  = useState(false);
  const [isVisible,    setIsVisible]    = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newAccount: Account = {
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
    };

    onCreated(newAccount);
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
            className="absolute left-0 right-0 bottom-0"
            style={{
              background: "var(--color-background)",
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
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-dark-tertiary)" }} />
            </div>

            <div className="px-5 pt-3 pb-10">

              <h2
                className="text-[22px] font-semibold mb-1"
                style={{ color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
              >
                New Lead
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
                What's the company name?
              </p>

              {/* Company name — only required field */}
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Saddleback Fleet Services"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleCreate(); }}
                className="w-full text-[17px] outline-none px-4 py-4 mb-5"
                style={{
                  background: "var(--color-dark-secondary)",
                  borderRadius: "var(--radius-xl)",
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                }}
              />

              {/* AI disclosure */}
              <div
                className="flex items-start gap-2.5 px-3.5 py-3 mb-5"
                style={{
                  background: "rgba(139,146,255,0.07)",
                  border: "1px solid rgba(139,146,255,0.16)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)", flexShrink: 0, marginTop: 1 }} />
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  AI will complete required CRM fields after your first visit — you don't need to fill them in now.
                </p>
              </div>

              {/* More details toggle */}
              <button
                onClick={() => setShowDetails((s) => !s)}
                className="flex items-center gap-1.5 mb-4 active:opacity-60 transition-opacity"
              >
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon name="expand_more" size={18} style={{ color: "var(--color-brand-purple)" }} />
                </motion.div>
                <span className="text-sm font-semibold" style={{ color: "var(--color-brand-purple)" }}>
                  {showDetails ? "Hide details" : "Add more details"}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
                  (optional)
                </span>
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 pb-5">
                      <OptionalField
                        label="Contact Name"
                        placeholder="Who are you meeting with?"
                        value={contactName}
                        onChange={setContactName}
                      />
                      <OptionalField
                        label="Phone"
                        placeholder="Phone number"
                        value={phone}
                        onChange={setPhone}
                        type="tel"
                      />
                      <OptionalField
                        label="Address"
                        placeholder="Street address"
                        value={address}
                        onChange={setAddress}
                      />
                      <div>
                        <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--color-text-disabled)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          City / State
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="flex-1 text-[14px] outline-none px-3 py-2.5 min-w-0"
                            style={{
                              background: "var(--color-dark-secondary)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--color-text-primary)",
                            }}
                          />
                          <select
                            value={stateVal}
                            onChange={(e) => setStateVal(e.target.value)}
                            className="text-[14px] outline-none px-2 py-2.5"
                            style={{
                              width: 80,
                              background: "var(--color-dark-secondary)",
                              borderRadius: "var(--radius-sm)",
                              color: stateVal ? "var(--color-text-primary)" : "var(--color-text-disabled)",
                              appearance: "none",
                              WebkitAppearance: "none",
                              textAlign: "center",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="" disabled>State</option>
                            {US_STATES.map((s) => (
                              <option key={s} value={s} style={{ background: "var(--color-dark-secondary)", color: "var(--color-text-primary)" }}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Create Lead CTA */}
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full h-12 font-semibold text-[15px] flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: "var(--color-brand-teal)",
                  color: "var(--color-text-primary)",
                  borderRadius: "var(--radius-full)",
                  opacity: name.trim() ? 1 : 0.4,
                }}
              >
                <Icon name="add" size={18} style={{ color: "var(--color-text-primary)" }} />
                Create Lead
              </button>

            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

function OptionalField({
  label, placeholder, value, onChange, type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--color-text-disabled)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </p>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[14px] outline-none px-3 py-2.5"
        style={{
          background: "var(--color-dark-secondary)",
          borderRadius: "var(--radius-sm)",
          color: "var(--color-text-primary)",
        }}
      />
    </div>
  );
}
