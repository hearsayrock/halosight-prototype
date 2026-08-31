"use client";

/**
 * FLUTTER HANDOFF: CreateAccountSheet
 * Widget: StatefulWidget (full-page push overlay)
 * State: name, phone, website, industry, accountCategory, address, city, stateVal, zip, isVisible
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo,
 *         --radius-xl, --radius-full, --radius-lg
 *
 * Portals into #phone-overlay-root.
 * Slides in from the right like a push navigation.
 * CTA anchored to bottom; rises with keyboard via --keyboard-inset.
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

const INDUSTRIES = [
  "Agriculture","Construction","Education","Energy","Finance",
  "Healthcare","Hospitality","Manufacturing","Retail","Technology",
  "Transportation","Other",
];

const ACCOUNT_CATEGORIES = ["Customer","Prospect","Partner","Vendor"];

interface Props {
  initialName?: string;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

export default function CreateAccountSheet({ initialName = "", onClose, onCreated }: Props) {
  const [name,            setName]            = useState(initialName);
  const [phone,           setPhone]           = useState("");
  const [website,         setWebsite]         = useState("");
  const [industry,        setIndustry]        = useState("");
  const [accountCategory, setAccountCategory] = useState("");
  const [address,         setAddress]         = useState("");
  const [city,            setCity]            = useState("");
  const [stateVal,        setStateVal]        = useState("");
  const [zip,             setZip]             = useState("");
  const [isVisible,       setIsVisible]       = useState(true);
  const [nameFocused,     setNameFocused]     = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, []);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreated({
      id: `hs-${Date.now()}`,
      name: trimmed,
      type: "standalone",
      halosightType: "account",
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      industry: industry || undefined,
      accountCategory: accountCategory || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: stateVal || undefined,
      zip: zip.trim() || undefined,
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
              Add new account
            </h1>
          </div>

          {/* Scrollable form */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 8px" }}>

            <Field label="Company Name" required>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Saddleback Fleet Services"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleCreate(); }}
                className="w-full outline-none px-4 py-4 text-[17px]"
                style={{
                  background: "var(--md-sys-color-dark-secondary)",
                  borderRadius: "var(--radius-lg)",
                  color: "var(--md-sys-color-text-primary)",
                  border: `1.5px solid ${nameFocused ? "rgba(139,146,255,0.55)" : "rgba(255,255,255,0.08)"}`,
                  transition: "border-color 0.15s",
                }}
              />
            </Field>

            <Field label="Phone">
              <TextInput
                type="tel"
                placeholder="e.g. (555) 867-5309"
                value={phone}
                onChange={setPhone}
              />
            </Field>

            <Field label="Website">
              <TextInput
                placeholder="e.g. saddlebackfleet.com"
                value={website}
                onChange={setWebsite}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <FieldLabel>Industry</FieldLabel>
                <SelectField value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select" />
              </div>
              <div>
                <FieldLabel>Account Type</FieldLabel>
                <SelectField value={accountCategory} onChange={setAccountCategory} options={ACCOUNT_CATEGORIES} placeholder="Select" />
              </div>
            </div>

            <FieldLabel style={{ marginBottom: 10 }}>Billing Address</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <TextInput placeholder="Street" value={address} onChange={setAddress} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <TextInput placeholder="City" value={city} onChange={setCity} />
                <SelectField value={stateVal} onChange={setStateVal} options={US_STATES} placeholder="State" />
              </div>
              <div style={{ maxWidth: "48%" }}>
                <TextInput placeholder="ZIP Code" value={zip} onChange={setZip} />
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
              className="w-full text-base-bold transition-opacity"
              style={{
                height: 52,
                background: "var(--md-sys-color-neonindigo)",
                color: "var(--md-sys-color-text-primary)",
                borderRadius: "var(--radius-full)",
                opacity: name.trim() ? 1 : 0.4,
              }}
            >
              Create account
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FieldLabel>
        {label}{required && <span style={{ color: "var(--md-sys-color-neonindigo)", marginLeft: 3 }}>*</span>}
      </FieldLabel>
      {children}
    </div>
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
