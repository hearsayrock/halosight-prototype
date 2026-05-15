"use client";

/**
 * FLUTTER HANDOFF: AccountsScreen
 * Route: /accounts
 * Widget: StatefulWidget
 * State: searchQuery (string), sortOption (SortOption)
 * Flutter equivalent: accounts_page.dart + AccountsViewModel
 * Tokens: surface/app, surface/card, text/primary, text/muted, text/disabled, border
 */

import { useState, useMemo } from "react";
import PhoneFrame from "@/components/layout/PhoneFrame";
import BottomNav from "@/components/layout/BottomNav";
import AccountListItem from "@/components/accounts/AccountListItem";
import SortMenu from "@/components/accounts/SortMenu";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { SortOption } from "@/lib/types";

function MenuIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <path d="M1 1H21" stroke="#8B94A8" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 8H21" stroke="#8B94A8" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 15H21" stroke="#8B94A8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="12" stroke="#8B94A8" strokeWidth="1.5" />
      <circle cx="13" cy="10" r="4" stroke="#8B94A8" strokeWidth="1.5" />
      <path d="M5 22C5 19 8.5 17 13 17C17.5 17 21 19 21 22" stroke="#8B94A8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7.5" cy="7.5" r="6" stroke="#8B94A8" strokeWidth="1.75" />
      <path d="M12 12L16 16" stroke="#8B94A8" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#5D667A" />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#F7F8FF" strokeWidth="1.5" strokeLinecap="round" />
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
    <PhoneFrame>
      <div className="flex flex-col h-full" style={{ background: "#111420" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button className="p-1 active:opacity-60 transition-opacity"><MenuIcon /></button>
          <button className="p-1 active:opacity-60 transition-opacity"><ProfileIcon /></button>
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div
            className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl"
            style={{ background: "#202535" }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] placeholder:text-[#5D667A] outline-none"
              style={{ color: "#F7F8FF" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="active:opacity-60">
                <ClearIcon />
              </button>
            )}
          </div>
          <SortMenu current={sort} onChange={setSort} />
        </div>

        {/* Account list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center pt-20">
              <p className="text-[15px]" style={{ color: "#5D667A" }}>
                No accounts match &quot;{query}&quot;
              </p>
            </div>
          ) : (
            filtered.map((account) => (
              <AccountListItem key={account.id} account={account} />
            ))
          )}
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
