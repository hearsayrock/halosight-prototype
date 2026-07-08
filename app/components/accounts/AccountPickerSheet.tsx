"use client";

/**
 * FLUTTER HANDOFF: AccountPickerSheet
 * Widget: StatefulWidget
 * State: query
 * Tokens: --md-sys-color-dark-primary, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --radius-xl, --radius-full
 * Flutter equivalent: account_picker_sheet.dart
 *
 * Slides up from the bottom. Shows the current account pinned at top,
 * then the rest alphabetically. A search bar filters the full list.
 *
 * NOTE: This component does NOT handle its own portal. The parent is
 * responsible for rendering it inside an overlay root with AnimatePresence.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { mockAccounts } from "@/lib/mock-data/accounts";
import Icon from "@/components/ui/Icon";

interface Props {
  currentId: string | null;
  onSelect: (id: string, name: string) => void;
  onClose: () => void;
}

function AccountRow({
  account,
  isSelected,
  showDivider,
  onSelect,
  onClose,
}: {
  account: typeof mockAccounts[0];
  isSelected: boolean;
  showDivider: boolean;
  onSelect: (id: string, name: string) => void;
  onClose: () => void;
}) {
  return (
    <button
      onClick={() => { onSelect(account.id, account.name); onClose(); }}
      className="w-full flex items-center justify-between px-5 py-3.5 active:opacity-60 transition-opacity relative"
      style={{ textAlign: "left" }}
    >
      {showDivider && (
        <div
          className="absolute top-0 left-5 right-5"
          style={{ height: 1, background: "var(--md-sys-color-dark-tertiary)" }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p
          className="text-15-bold truncate"
          style={{
            color: isSelected ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-primary)",
          }}
        >
          {account.name}
        </p>
        {(account.city || account.state) && (
          <p className="text-xs mt-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>
            {[account.city, account.state].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
      {isSelected && (
        <Icon name="check" size={18} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
      )}
    </button>
  );
}

export default function AccountPickerSheet({ currentId, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  const currentAccount = mockAccounts.find((a) => a.id === currentId) ?? null;
  const q = query.toLowerCase().trim();
  const isSearching = q.length > 0;
  const allSorted = [...mockAccounts].sort((a, b) => a.name.localeCompare(b.name));

  const filteredList = isSearching
    ? allSorted.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city?.toLowerCase().includes(q) ||
          a.state?.toLowerCase().includes(q)
      )
    : allSorted.filter((a) => a.id !== currentId);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)", zIndex: 60 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{
          zIndex: 61,
          background: "var(--md-sys-color-dark-primary)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "72%",
          display: "flex",
          flexDirection: "column",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
          <h3
            className="heading-6"
            style={{
              color: "var(--md-sys-color-text-primary)",
            }}
          >
            Switch account
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center active:opacity-60 transition-opacity"
          >
            <Icon name="close" size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 mx-5 mb-3 px-3 flex-shrink-0"
          style={{
            height: 40,
            background: "var(--md-sys-color-dark-secondary)",
            borderRadius: "var(--radius-full)",
          }}
        >
          <Icon name="search" size={16} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search accounts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--md-sys-color-text-primary)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="active:opacity-60 flex-shrink-0">
              <Icon name="cancel" fill size={15} style={{ color: "var(--md-sys-color-text-disabled)" }} />
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", paddingBottom: 40 }}>
          {/* Current account pinned at top (only when not searching) */}
          {!isSearching && currentAccount && (
            <>
              <AccountRow
                account={currentAccount}
                isSelected
                showDivider={false}
                onSelect={onSelect}
                onClose={onClose}
              />
              {filteredList.length > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "var(--md-sys-color-dark-tertiary)",
                    margin: "0 20px 4px",
                  }}
                />
              )}
            </>
          )}

          {filteredList.map((account, i) => (
            <AccountRow
              key={account.id}
              account={account}
              isSelected={account.id === currentId}
              showDivider={i > 0}
              onSelect={onSelect}
              onClose={onClose}
            />
          ))}

          {filteredList.length === 0 && isSearching && (
            <p className="text-sm text-center py-8" style={{ color: "var(--md-sys-color-text-disabled)" }}>
              No accounts match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}
