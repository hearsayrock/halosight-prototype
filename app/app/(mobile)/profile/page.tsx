"use client";

/**
 * FLUTTER HANDOFF: ProfileScreen
 * Route: /profile
 * Reached via the profile button on Home or Accounts.
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-text-primary,
 *         --md-sys-color-text-muted, --md-sys-color-text-disabled, --md-sys-color-brand-coral,
 *         --md-sys-color-error, --md-sys-color-dark-primary, --md-sys-color-alpha-white-10, --radius-md
 * Flutter equivalent: profile_page.dart
 */

import TextField from "@/components/ui/TextField";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { DrawerBackdrop, DrawerBody, DrawerPanel, useOverlayRoot } from "@/components/ui/Drawer";
import Icon from "@/components/ui/Icon";
import ScrollAwareTopBar from "@/components/ui/ScrollAwareTopBar";

function RequestDeleteSheet({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const root = useOverlayRoot();

  function handleSend() {
    setSending(true);
    setTimeout(() => { onSent(); }, 900);
  }

  if (!root) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          <DrawerBackdrop onClick={() => setIsVisible(false)} />
          <DrawerPanel keyboardAware maxHeight="85%">
            <DrawerBody style={{ paddingTop: "var(--spacing-4)", paddingLeft: "var(--spacing-5)", paddingRight: "var(--spacing-5)" }}>
              <h2 className="heading-5 text-center" style={{ color: "var(--md-sys-color-text-primary)", marginBottom: "var(--spacing-3)" }}>
                Request data deletion
              </h2>
              <p className="text-sm text-center" style={{ color: "var(--md-sys-color-text-secondary)", lineHeight: 1.6, marginBottom: "var(--spacing-5)" }}>
                Data deletion is managed by your team admin. Send them a request and they&apos;ll take care of it — usually within one business day.
              </p>
              <TextField
                multiline
                rows={3}
                value={note}
                onChange={setNote}
                placeholder="Add a note for your admin (optional)"
                style={{ marginBottom: "var(--spacing-4)" }}
              />
              <div className="flex flex-col" style={{ gap: "var(--spacing-2)" }}>
                <Button fill="danger" fullWidth loading={sending} loadingLabel="Sending" onClick={handleSend}>Send deletion request</Button>
                <Button variant="text" fullWidth onClick={() => setIsVisible(false)}>Cancel</Button>
              </div>
            </DrawerBody>
          </DrawerPanel>
        </div>
      )}
    </AnimatePresence>,
    root
  );
}

function RequestSentSheet({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const root = useOverlayRoot();

  if (!root) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          <DrawerBackdrop onClick={() => setIsVisible(false)} />
          <DrawerPanel>
            <DrawerBody className="flex flex-col items-center" style={{ paddingTop: "var(--spacing-6)", paddingLeft: "var(--spacing-5)", paddingRight: "var(--spacing-5)", paddingBottom: "var(--spacing-10)" }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56, height: 56, borderRadius: "var(--radius-full)", marginBottom: "var(--spacing-4)",
                  background: "color-mix(in srgb, var(--md-sys-color-semantic-success) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--md-sys-color-semantic-success) 25%, transparent)",
                }}
              >
                <Icon name="check" size={26} style={{ color: "var(--md-sys-color-semantic-success)" }} />
              </div>
              <h2 className="heading-5" style={{ color: "var(--md-sys-color-text-primary)", marginBottom: "var(--spacing-3)" }}>Request sent</h2>
              <p className="text-sm text-center" style={{ color: "var(--md-sys-color-text-secondary)", lineHeight: 1.6, marginBottom: "var(--spacing-6)", maxWidth: 280 }}>
                Your admin has been notified and will process your deletion request.
              </p>
              <Button variant="outlined" fullWidth onClick={() => setIsVisible(false)}>Done</Button>
            </DrawerBody>
          </DrawerPanel>
        </div>
      )}
    </AnimatePresence>,
    root
  );
}

const MENU_ITEMS = [
  { label: "Report a Bug" },
  { label: "Suggest a Feature" },
  { label: "Support" },
  { label: "Switch Tenant" },
];

export default function ProfilePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [showSentSheet, setShowSentSheet] = useState(false);

  return (
    <div className="h-full" style={{ background: "var(--md-sys-color-background)", position: "relative", overflow: "hidden" }}>

      <ScrollAwareTopBar
        onBack={() => router.back()}
        scrollRef={scrollRef}
        rightSlot={
          <button
            className="text-sm-bold active:opacity-60 transition-opacity"
            style={{ color: "var(--md-sys-color-brand-coral)" }}
          >
            Log Out
          </button>
        }
      />

      <div ref={scrollRef} style={{ position: "absolute", inset: 0, overflowY: "auto" }}>

      {/* Avatar + user info */}
      <div className="flex flex-col items-center px-4 mb-8" style={{ paddingTop: 86 }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#607D8B" }}
        >
          <span className="text-[32px] font-bold" style={{ color: "#fff" }}>N</span>
        </div>
        <h2
          className="text-[22px] font-bold mb-1"
          style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
        >
          Nate Smith
        </h2>
        <p className="text-sm mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>
          nsmith@halosight.com
        </p>
        <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
          Halosight - Area51
        </p>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 px-4 mb-6">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span className="text-base-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
              {item.label}
            </span>
            <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
          </button>
        ))}
      </div>

      {/* App version */}
      <p className="text-center text-xs mb-8" style={{ color: "var(--md-sys-color-text-disabled)" }}>
        App Version 1.3.5+163
      </p>

      {/* Delete all data */}
      <button
        onClick={() => setShowDeleteSheet(true)}
        className="w-full flex justify-center pb-8 active:opacity-60 transition-opacity"
      >
        <span style={{ fontSize: 13, color: "var(--md-sys-color-error)", opacity: 0.7 }}>
          Delete all data
        </span>
      </button>

      {/* Sheets */}
      {showDeleteSheet && (
        <RequestDeleteSheet
          onClose={() => setShowDeleteSheet(false)}
          onSent={() => { setShowDeleteSheet(false); setShowSentSheet(true); }}
        />
      )}
      {showSentSheet && (
        <RequestSentSheet onClose={() => setShowSentSheet(false)} />
      )}

      </div>
    </div>
  );
}
