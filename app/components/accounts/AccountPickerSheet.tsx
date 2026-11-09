"use client";

/**
 * FLUTTER HANDOFF: AccountPickerSheet
 * Widget: StatefulWidget (bottom sheet, opened with showModalBottomSheet)
 * Props: currentId (String?), onSelect(id, name), onClose, autoFocus (default true)
 * State: query
 * Data: the account list (prototype: mockAccounts), sorted A to Z
 * Flutter equivalent: account_picker_sheet.dart
 *
 * "Switch account": a sheet for moving the capture flow to a different company. Header with a close button, a SearchField ("Search accounts…",
 * focused ~320ms after the sheet slides up), then the list:
 *   - not searching: the current account is pinned at the top in neonindigo with a check, a hairline, then every other account A to Z
 *   - searching: one filtered list (name, city or state contains the text), the current account marked in place; no match shows
 *     "No accounts match ..." in muted text
 *   - each row is the name (15, bold, truncates) with "City, ST" under it (12, muted); tapping a row selects it and closes the sheet
 * Max height 72% of the screen; the list scrolls. Built on DrawerBackdrop and DrawerPanel (flex column), z-index 60 / 61 so it sits above the
 * capture sheet.
 * This component does not portal itself: the parent renders it inside an overlay root with AnimatePresence (CaptureWidget does).
 * Known drift: the close button is a hand-built 28px icon button, not IconButton.
 *
 * Tokens: color.dark.primary (sheet, via Drawer), color.dark.tertiary (row hairlines), color.neonindigo.base (current account, check),
 *         color.text.primary / muted, radius.xl (sheet top corners, via Drawer); the field is SearchField
 */

import SearchField from "@/components/ui/SearchField";
import { DrawerBackdrop, DrawerPanel } from "@/components/ui/Drawer";
import { useEffect, useRef, useState } from "react";
import { mockAccounts } from "@/lib/mock-data/accounts";
import Icon from "@/components/ui/Icon";

interface Props {
  currentId: string | null;
  onSelect: (id: string, name: string) => void;
  onClose: () => void;
  /** Focus the search field once the sheet has slid up. Off in the design-system preview so it does not pull the page. Default true. */
  autoFocus?: boolean;
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

export default function AccountPickerSheet({ currentId, onSelect, onClose, autoFocus = true }: Props) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => searchRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [autoFocus]);

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
      {/* Backdrop + panel (shared drawer chrome) */}
      <DrawerBackdrop onClick={onClose} zIndex={60} />
      <DrawerPanel zIndex={61} maxHeight="72%" flexColumn>

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
        <div className="mx-5 mb-3 flex-shrink-0">
          <SearchField inputRef={searchRef} value={query} onChange={setQuery} placeholder="Search accounts…" />
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
            <p className="text-sm text-center py-8" style={{ color: "var(--md-sys-color-text-muted)" }}>
              No accounts match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </DrawerPanel>
    </>
  );
}
