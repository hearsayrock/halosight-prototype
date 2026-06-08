"use client";

/**
 * FLUTTER HANDOFF: AccountsScreen
 * Route: /accounts
 * Widget: StatefulWidget
 * State: searchQuery (string), sortOption (SortOption)
 * Flutter equivalent: accounts_page.dart + AccountsViewModel
 * Tokens: --color-background, --color-dark-secondary, --color-text-primary,
 *         --color-text-muted, --color-text-disabled, --color-alpha-white-10
 */

import { useState, useMemo } from "react";
import AccountListItem from "@/components/accounts/AccountListItem";
import SortMenu from "@/components/accounts/SortMenu";
import MenuIcon from "@/components/ui/MenuIcon";
import Icon from "@/components/ui/Icon";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { SortOption } from "@/lib/types";

// Accounts tab icon — matches BottomNav, used as profile avatar placeholder
function AccountsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.8984 11.1592C12.4926 11.1592 14.7626 12.697 15.8662 13.7148C16.6443 14.4326 16.647 15.5215 16.1933 16.3096C15.768 17.0481 14.9801 17.5038 14.1279 17.5039H3.91696C3.04814 17.5037 2.2451 17.039 1.81149 16.2861C1.3709 15.5207 1.34294 14.457 2.0859 13.7256C3.13377 12.6944 5.30781 11.1594 8.8984 11.1592ZM9.00875 0.5C11.3543 0.5 13.2861 2.36179 13.2861 4.69531C13.2861 7.02884 11.3543 8.89062 9.00875 8.89062C6.66339 8.89035 4.73144 7.02867 4.73141 4.69531C4.73144 2.36196 6.6634 0.50027 9.00875 0.5Z"
        fill="var(--color-text-muted)"
      />
    </svg>
  );
}

function sortAccounts(accounts: typeof mockAccounts, sort: SortOption) {
  return [...accounts].sort((a, b) => {
    switch (sort) {
      case "alphabetical": return a.name.localeCompare(b.name);
      case "distance":     return a.distanceMiles - b.distanceMiles;
      case "lastVisited":  return b.lastVisited.getTime() - a.lastVisited.getTime();
      case "company":      return (a.parentId ?? a.id).localeCompare(b.parentId ?? b.id);
      default:             return 0;
    }
  });
}

export default function AccountsPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("alphabetical");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const source = q
      ? mockAccounts.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.city?.toLowerCase().includes(q) ||
            a.state?.toLowerCase().includes(q)
        )
      : mockAccounts;
    return sortAccounts(source, sort);
  }, [query, sort]);

  return (
    <div className="relative flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Top bar — 32px edge padding, nudged up from default safe area */}
      <div className="flex items-center justify-between px-8 pt-10 pb-3">
        <button className="active:opacity-60 transition-opacity" aria-label="Menu">
          <MenuIcon size={32} />
        </button>
        <button className="active:opacity-60 transition-opacity" aria-label="Profile">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-dark-secondary)" }}
          >
            <AccountsIcon />
          </div>
        </button>
      </div>

      {/* Search + sort */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div
          className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl"
          style={{ background: "var(--color-dark-secondary)" }}
        >
          <Icon name="search" size={18} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="active:opacity-60 flex-shrink-0">
              <Icon name="cancel" fill size={16} style={{ color: "var(--color-text-disabled)" }} />
            </button>
          )}
        </div>
        <SortMenu current={sort} onChange={setSort} />
      </div>

      {/* Account list — extends full height, scrolls behind the floating BottomNav */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center pt-20">
            <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
              No accounts match &quot;{query}&quot;
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-2 pb-4">
            {filtered.map((account) => (
              <AccountListItem key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
