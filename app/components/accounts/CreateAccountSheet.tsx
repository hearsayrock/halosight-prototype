"use client";

/**
 * FLUTTER HANDOFF: CreateAccountSheet
 * Widget: StatefulWidget (bottom sheet)
 * State: name, contact, city (strings)
 * Tokens: --color-background, --color-dark-secondary, --color-dark-tertiary,
 *         --color-text-primary, --color-text-muted, --color-text-disabled,
 *         --color-brand-teal, --radius-xl, --radius-full, --radius-md
 *
 * Portals into #phone-overlay-root.
 * Opens from the "Add new company" CTA after a failed search.
 * All new companies are created as halosightType "prospect" — syncs to CRM as a lead.
 * Contact and city are optional fields.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import type { Account } from "@/lib/types";

interface Props {
  /** Pre-fills the name field from the search query */
  initialName?: string;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

export default function CreateAccountSheet({ initialName = "", onClose, onCreated }: Props) {
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState("");
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
      halosightType: "prospect",
      city: city.trim() || undefined,
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
                New Company
              </h2>

              {/* ── Company name ─────────────────────────────────────────── */}
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Company Name <span style={{ color: "var(--color-brand-coral)" }}>*</span>
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. Saddleback Fleet Services"
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

              {/* ── City (optional) ──────────────────────────────────────── */}
              <div className="mb-6">
                <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-text-disabled)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  City
                </p>
                <input
                  type="text"
                  placeholder="e.g. Tucson"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  background: "var(--color-brand-teal)",
                  color: "var(--color-text-primary)",
                  borderRadius: "var(--radius-full)",
                  opacity: name.trim() ? 1 : 0.4,
                }}
              >
                <Icon name="add" size={18} style={{ color: "var(--color-text-primary)" }} />
                Add Company
              </button>

            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
