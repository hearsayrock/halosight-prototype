"use client";

/**
 * FLUTTER HANDOFF: CreateAccountSheet
 * Widget: StatefulWidget (bottom sheet)
 * Props: initialName?, onClose, onCreated(Account)
 * State: name, isVisible (the contact, address and state fields are reserved for "Add more details" and not shown yet)
 * Tokens: color.dark.secondary (field, via TextField), color.neonindigo.base (active stroke, AI hint, CTA), color.alpha.neonindigo-10 (AI hint fill),
 *         color.text.primary, radius.lg *
 * Portals into #phone-overlay-root.
 * Design: company name only upfront (TextField), an "AI fills the rest" hint, and an indigo Button.
 * Overlaps with CreateLeadSheet: the same sheet without duplicate detection, reached from the search "create" prompt. Flutter should build
 * one sheet and treat duplicate detection as a flag.
 */

import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DrawerBackdrop, DrawerPanel } from "@/components/ui/Drawer";
import { AnimatePresence } from "framer-motion";
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

          {/* Backdrop + panel (shared drawer chrome) */}
          <DrawerBackdrop onClick={() => setIsVisible(false)} />
          <DrawerPanel keyboardAware>

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
                  onChange={setName}
                  onSubmit={() => { if (name.trim()) handleCreate(); }}
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
                <span className="text-13" style={{ color: "var(--md-sys-color-neonindigo)" }}>
                  Name it — AI fills the rest.
                </span>
              </div>

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
