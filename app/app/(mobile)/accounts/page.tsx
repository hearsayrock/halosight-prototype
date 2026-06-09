"use client";

/**
 * FLUTTER HANDOFF: AccountsScreen
 * Route: /accounts
 * Widget: StatefulWidget
 * State: searchQuery (string), sortOption (SortOption), pageState (loading|error|loaded)
 * Flutter equivalent: accounts_page.dart + AccountsViewModel
 * Tokens: --color-background, --color-dark-secondary, --color-text-primary,
 *         --color-text-muted, --color-text-disabled, --color-alpha-white-10
 *
 * STATES (preview via ?preview=loading or ?preview=error):
 *   loading — skeleton shimmer rows while accounts fetch from API
 *   error   — error card + retry CTA when the fetch fails
 *   loaded  — normal list (default)
 *
 * PULL-TO-REFRESH (Flutter only):
 *   Wrap the ListView in a RefreshIndicator. On refresh, re-call
 *   the ViewModel's loadAccounts() method. Not implemented in web prototype.
 */

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AccountListItem from "@/components/accounts/AccountListItem";
import SortMenu from "@/components/accounts/SortMenu";
import MenuIcon from "@/components/ui/MenuIcon";
import Icon from "@/components/ui/Icon";
import { AccountListSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { SortOption } from "@/lib/types";

// Accounts tab icon — matches BottomNav, used as profile avatar placeholder
function AccountsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14"
        stroke="var(--color-text-muted)"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function AccountsPageContent() {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview"); // "loading" | "error" | null

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
      <div className="flex items-center justify-between pl-8 pr-4 pt-10 pb-3">
        <button className="active:opacity-60 transition-opacity" aria-label="Menu">
          <MenuIcon size={32} />
        </button>
        <Link href="/profile">
          <button className="active:opacity-60 transition-opacity" aria-label="Profile">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-dark-secondary)" }}
            >
              <AccountsIcon />
            </div>
          </button>
        </Link>
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

      {/* Account list — scrolls behind floating BottomNav */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Loading state */}
        {preview === "loading" && <AccountListSkeleton rows={6} />}

        {/* Error state */}
        {preview === "error" && (
          <ErrorState
            title="Couldn't load accounts"
            message="We had trouble reaching the server. Check your connection and try again."
            onRetry={() => {}}
          />
        )}

        {/* Loaded state */}
        {!preview && (
          filtered.length === 0 ? (
            <div className="flex items-center justify-center pt-20">
              <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                No accounts match &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <div className="flex flex-col py-2 pb-28">
              {filtered.map((account, i) => (
                <AccountListItem key={account.id} account={account} isLast={i === filtered.length - 1} />
              ))}
            </div>
          )
        )}

      </div>

    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsPageContent />
    </Suspense>
  );
}
