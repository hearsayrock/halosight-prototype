"use client";

/**
 * FLUTTER HANDOFF: DataDeletedToast
 * Widget: StatefulWidget — shown once after "Delete all data" confirmation
 * Listens for the "halosight:data_deleted" window event dispatched by the profile
 * confirm handler; auto-dismisses after 3.5s.
 * Tokens: --md-sys-color-dark-tertiary, --md-sys-color-alpha-white-18,
 *         --md-sys-color-brand-coral, --md-sys-color-text-primary, --radius-md
 * Flutter equivalent: data_deleted_toast.dart
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

export default function DataDeletedToast() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 3500);
    };
    window.addEventListener("halosight:data_deleted", handler);
    return () => {
      window.removeEventListener("halosight:data_deleted", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const overlayRoot = typeof document !== "undefined" ? document.getElementById("phone-overlay-root") : null;
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="data-deleted-toast"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ position: "absolute", bottom: 150, left: 16, right: 16, zIndex: 60, pointerEvents: "none" }}
        >
          <div style={{
            background: "var(--md-sys-color-dark-tertiary)",
            border: "1px solid var(--md-sys-color-alpha-white-18)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <Icon name="check_circle" size={18} style={{ color: "var(--md-sys-color-brand-coral)", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13.5, color: "var(--md-sys-color-text-primary)" }}>
              All data has been deleted
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
