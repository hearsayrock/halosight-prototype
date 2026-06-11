"use client";

/**
 * FLUTTER HANDOFF: CreateAccountSheet
 * Widget: StatefulWidget (bottom sheet)
 * State: name (string), halosightType ("prospect" | "account")
 * Tokens: --color-background, --color-dark-secondary, --color-dark-tertiary,
 *         --color-text-primary, --color-text-muted, --color-text-disabled,
 *         --color-brand-teal, --color-brand-coral, --color-brand-purple,
 *         --radius-xl, --radius-full, --radius-md
 *
 * Portals into #phone-overlay-root.
 * Opens from the "Create new account" CTA after a failed search.
 * halosightType defaults to "prospect" — the most common case.
 * Type is set once at creation and cannot be changed in-app.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import type { Account, HalosightAccountType } from "@/lib/types";

interface Props {
  /** Pre-fills the name field from the search query */
  initialName?: string;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

export default function CreateAccountSheet({ initialName = "", onClose, onCreated }: Props) {
  const [name, setName] = useState(initialName);
  const [halosightType, setHalosightType] = useState<HalosightAccountType>("prospect");
  const [isVisible, setIsVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setIsVisible(false);
  }

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
      halosightType,
      distanceMiles: 0,
      lastVisited: new Date(),
      taskCount: 0,
    };

    onCreated(newAccount);
    handleClose();
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
            onClick={handleClose}
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

              {/* Heading */}
              <h2
                className="text-[22px] font-semibold mb-5"
                style={{ color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
              >
                New Account
              </h2>

              {/* ── Type picker ──────────────────────────────────────────── */}
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Account Type
                </p>
                <div className="flex gap-3">
                  <TypeOption
                    selected={halosightType === "prospect"}
                    onSelect={() => setHalosightType("prospect")}
                    label="Prospect"
                    description="Building a new relationship"
                    icon="person_search"
                    activeColor="var(--color-brand-teal)"
                    activeBg="rgba(107, 157, 176, 0.15)"
                    activeBorder="rgba(107, 157, 176, 0.4)"
                  />
                  <TypeOption
                    selected={halosightType === "account"}
                    onSelect={() => setHalosightType("account")}
                    label="Account"
                    description="An existing customer"
                    icon="storefront"
                    activeColor="var(--color-brand-purple)"
                    activeBg="rgba(139, 146, 255, 0.12)"
                    activeBorder="rgba(139, 146, 255, 0.35)"
                  />
                </div>
              </div>

              {/* ── Name input ───────────────────────────────────────────── */}
              <div className="mb-6">
                <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Name
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Account name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  className="w-full text-[16px] outline-none px-4 py-3.5"
                  style={{
                    background: "var(--color-dark-secondary)",
                    borderRadius: "var(--radius-xl)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* ── CRM sync disclosure ──────────────────────────────────── */}
              <div className="flex items-center gap-2 mb-5">
                <Icon name="sync" size={14} style={{ color: "var(--color-text-disabled)", flexShrink: 0 }} />
                <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  This will also create a record in your connected CRM.
                </p>
              </div>

              {/* ── Create button ────────────────────────────────────────── */}
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full h-12 font-semibold text-[15px] flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: halosightType === "prospect"
                    ? "var(--color-brand-teal)"
                    : "var(--color-brand-purple)",
                  color: "var(--color-text-primary)",
                  borderRadius: "var(--radius-full)",
                  opacity: name.trim() ? 1 : 0.4,
                }}
              >
                <Icon name="add" size={18} style={{ color: "var(--color-text-primary)" }} />
                Add {halosightType === "prospect" ? "Prospect" : "Account"}
              </button>

            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

// ── Type option card ──────────────────────────────────────────────────────────

function TypeOption({
  selected,
  onSelect,
  label,
  description,
  icon,
  activeColor,
  activeBg,
  activeBorder,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description: string;
  icon: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}) {
  return (
    <button
      onClick={onSelect}
      className="relative flex-1 flex flex-col items-start gap-2 p-4 active:opacity-80 transition-all"
      style={{
        background: selected ? activeBg : "var(--color-dark-secondary)",
        borderRadius: "var(--radius-md)",
        border: selected ? `1.5px solid ${activeBorder}` : "1.5px solid transparent",
        textAlign: "left",
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: selected ? `${activeBg}` : "var(--color-dark-tertiary)",
        }}
      >
        <Icon
          name={icon}
          size={17}
          style={{ color: selected ? activeColor : "var(--color-text-disabled)" }}
        />
      </div>
      <div>
        <p
          className="text-[14px] font-semibold leading-tight mb-0.5"
          style={{ color: selected ? activeColor : "var(--color-text-primary)" }}
        >
          {label}
        </p>
        <p
          className="text-[12px] leading-snug"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </p>
      </div>
      {selected && (
        <div
          className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: activeColor }}
        >
          <Icon name="check" size={10} style={{ color: "#fff" }} />
        </div>
      )}
    </button>
  );
}
