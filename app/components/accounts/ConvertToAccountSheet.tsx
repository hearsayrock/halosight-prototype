"use client";

/**
 * FLUTTER HANDOFF: ConvertToAccountSheet
 * Widget: StatefulWidget (step: "form" | "success")
 * Props: accountId, accountName, initialContact, onClose, onConverted
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-text-secondary, --md-sys-color-neonindigo, --md-sys-color-brand-teal,
 *         --radius-xl, --radius-md, --radius-sm, --radius-full
 *
 * Covers the standard CRM lead-conversion flow:
 *   1. Account type (customer / fleet / distributor)
 *   2. Primary contact confirmation (pre-filled from captured data)
 *   3. Optional opportunity creation
 * On success, displays a confirmation state then calls onConverted.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

type AccountType = "customer" | "fleet" | "distributor";

const ACCOUNT_TYPES: { value: AccountType; label: string; sub: string }[] = [
  { value: "customer",    label: "Customer",      sub: "Direct buyer"    },
  { value: "fleet",       label: "Fleet Account", sub: "Vehicle fleet"   },
  { value: "distributor", label: "Distributor",   sub: "Multi-location"  },
];

interface Props {
  accountName: string;
  initialContact: { name: string; title: string; phone: string };
  onClose: () => void;
  onConverted: () => void;
}

export default function ConvertToAccountSheet({ accountName, initialContact, onClose, onConverted }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [step, setStep] = useState<"form" | "success">("form");

  const [name,  setName]  = useState(initialContact.name);
  const [title, setTitle] = useState(initialContact.title);
  const [phone, setPhone] = useState(initialContact.phone);

  const [accountType, setAccountType] = useState<AccountType>("customer");

  const [createDeal, setCreateDeal] = useState(false);
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  const [dealName,  setDealName]  = useState(`${accountName} – Q${quarter} ${now.getFullYear()}`);
  const [dealValue, setDealValue] = useState("");

  const overlayRoot = typeof document !== "undefined"
    ? document.getElementById("phone-overlay-root")
    : null;
  if (!overlayRoot) return null;

  const selectedType = ACCOUNT_TYPES.find((t) => t.value === accountType)!;

  return createPortal(
    <AnimatePresence onExitComplete={() => { onConverted(); onClose(); }}>
    {isVisible && (
    <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>

      {/* Backdrop — only dismissible on form step */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={step === "form" ? () => setIsVisible(false) : undefined}
      />

      {/* Sheet */}
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{
          background: "var(--md-sys-color-background)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "92%",
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

        <AnimatePresence mode="wait" initial={false}>

          {/* ── Form step ───────────────────────────────────────────────── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-5 pt-4 pb-12"
            >
              <h2 className="text-[22px] font-semibold mb-1.5" style={serifStyle}>
                Convert to Account
              </h2>
              <p className="text-sm mb-7" style={{ color: "var(--md-sys-color-text-muted)", lineHeight: 1.5 }}>
                {accountName} will be created as an account in Salesforce.
              </p>

              {/* Account type */}
              <SectionHeader icon="business" label="Account Type" />
              <div className="flex gap-2 mb-7">
                {ACCOUNT_TYPES.map((t) => {
                  const sel = accountType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setAccountType(t.value)}
                      className="flex-1 flex flex-col items-center py-3.5 px-1 transition-colors"
                      style={{
                        borderRadius: "var(--radius-md)",
                        background: sel ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-secondary)",
                      }}
                    >
                      <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--md-sys-color-text-primary)" }}>
                        {t.label}
                      </span>
                      <span className="text-[10px] mt-1" style={{ color: sel ? "rgba(255,255,255,0.6)" : "var(--md-sys-color-text-disabled)" }}>
                        {t.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Primary contact */}
              <SectionHeader icon="person" label="Primary Contact" />
              <div className="flex flex-col gap-2 mb-7">
                <Field label="Name"  value={name}  onChange={setName}  placeholder="Full name"    />
                <Field label="Title" value={title} onChange={setTitle} placeholder="Job title"    />
                <Field label="Phone" value={phone} onChange={setPhone} placeholder="Phone number" type="tel" />
              </div>

              {/* Deal */}
              <SectionHeader icon="trending_up" label="Open a Deal?" />
              <button
                onClick={() => setCreateDeal((d) => !d)}
                className="w-full flex items-center justify-between px-4 py-3.5 mb-2"
                style={{
                  background: "var(--md-sys-color-dark-secondary)",
                  borderRadius: "var(--radius-xl)",
                }}
              >
                <span className="text-sm" style={{ color: "var(--md-sys-color-text-primary)" }}>
                  Create a deal in Salesforce
                </span>
                <Toggle on={createDeal} />
              </button>

              <AnimatePresence>
                {createDeal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 pt-1 mb-2">
                      <Field label="Deal Name"  value={dealName}  onChange={setDealName}  placeholder="Deal name" />
                      <Field label="Est. Value" value={dealValue} onChange={setDealValue} placeholder="$0"        type="numeric" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setStep("success")}
                className="w-full h-12 font-semibold text-[15px] flex items-center justify-center mt-7"
                style={{
                  background: "var(--md-sys-color-brand-teal)",
                  color: "var(--md-sys-color-text-primary)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                Convert to Account
              </button>
            </motion.div>
          )}

          {/* ── Success step ─────────────────────────────────────────────── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 pt-10 pb-14 flex flex-col items-center text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ background: "rgba(107, 157, 176, 0.15)" }}
              >
                <Icon name="check_circle" fill size={36} style={{ color: "var(--md-sys-color-brand-teal)" }} />
              </div>

              <h2 className="text-[22px] font-semibold mb-3" style={serifStyle}>
                Account created
              </h2>

              <p className="text-sm mb-2" style={{ color: "var(--md-sys-color-text-muted)", maxWidth: 280, lineHeight: 1.65 }}>
                <span style={{ color: "var(--md-sys-color-text-primary)", fontWeight: 600 }}>{accountName}</span> is synced
                to Salesforce as a {selectedType.label}.
                {name.trim() && (
                  <> {name.trim()} is listed as the primary contact.</>
                )}
              </p>

              {createDeal && dealName.trim() && (
                <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)", maxWidth: 280, lineHeight: 1.65 }}>
                  Deal{" "}
                  <span style={{ color: "var(--md-sys-color-text-secondary)" }}>"{dealName}"</span>{" "}
                  is open in your pipeline.
                </p>
              )}

              <button
                onClick={() => setIsVisible(false)}
                className="w-full h-12 font-semibold text-[15px] flex items-center justify-center mt-8"
                style={{
                  background: "var(--md-sys-color-brand-teal)",
                  color: "var(--md-sys-color-text-primary)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                Done
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
    )}
    </AnimatePresence>,
    overlayRoot
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const serifStyle: React.CSSProperties = {
  color: "var(--md-sys-color-text-primary)",
  fontFamily: "Roboto Slab, Georgia, serif",
};

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <Icon name={icon} size={13} style={{ color: "var(--md-sys-color-neonindigo-dark)" }} />
      <span className="eyebrow-text" style={{ color: "var(--md-sys-color-text-muted)" }}>{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold mb-1"
        style={{ color: "var(--md-sys-color-text-disabled)", letterSpacing: "0.05em", textTransform: "uppercase" }}
      >
        {label}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-[14px] outline-none px-3 py-2.5"
        style={{
          background: "var(--md-sys-color-dark-secondary)",
          borderRadius: "var(--radius-sm)",
          color: "var(--md-sys-color-text-primary)",
        }}
      />
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        background: on ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-tertiary)",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 18, height: 18,
          borderRadius: 9,
          background: "white",
          transition: "left 0.18s",
        }}
      />
    </div>
  );
}
