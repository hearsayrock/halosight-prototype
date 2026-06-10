"use client";

/**
 * FLUTTER HANDOFF: AccountsScreen
 * Route: /accounts
 * Widget: StatefulWidget
 * State: searchQuery (string), sortOption (SortOption), pageState (loading|error|loaded),
 *        systemSearchState ("idle" | "loading" | "done")
 * Flutter equivalent: accounts_page.dart + AccountsViewModel
 * Tokens: --color-background, --color-dark-secondary, --color-text-primary,
 *         --color-text-muted, --color-text-disabled, --color-alpha-white-10
 *
 * STATES (preview via ?preview=loading or ?preview=error):
 *   loading — skeleton shimmer rows while accounts fetch from API
 *   error   — error card + retry CTA when the fetch fails
 *   loaded  — normal list (default)
 *
 * ADVANCED SEARCH
 *   When a search query returns 0 results in the rep's accounts, a prompt
 *   appears to "Search all Halosight accounts." This fires a simulated async
 *   call against the system-wide account pool and renders results in a
 *   second section below. Can also be triggered from the link below any
 *   non-empty result set (for prospecting).
 *
 *   System account rows show "Assigned to [Rep]" instead of last-visited,
 *   and carry a "Not mine" / "Unassigned" badge.
 *
 *   At the bottom of system results: "Create new account" CTA for accounts
 *   that exist nowhere in the system.
 *
 * Flutter notes:
 *   - System search → separate API endpoint, show CircularProgressIndicator
 *   - Use SliverList with two SliverSections for the two result groups
 *   - "Create new account" → push to NewAccountScreen
 */

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AccountListItem from "@/components/accounts/AccountListItem";
import SystemAccountListItem from "@/components/accounts/SystemAccountListItem";
import SortMenu from "@/components/accounts/SortMenu";
import MenuIcon from "@/components/ui/MenuIcon";
import Icon from "@/components/ui/Icon";
import { AccountListSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { mockAccounts } from "@/lib/mock-data/accounts";
import { mockSystemAccounts, systemAccountReps } from "@/lib/mock-data/system-accounts";
import type { Account, SortOption } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function sortAccounts(accounts: Account[], sort: SortOption) {
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

function searchAccounts(accounts: Account[], q: string) {
  const lower = q.toLowerCase().trim();
  if (!lower) return accounts;
  return accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(lower) ||
      a.city?.toLowerCase().includes(lower) ||
      a.state?.toLowerCase().includes(lower)
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2"
      style={{ background: "var(--color-background)" }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-text-disabled)",
          background: "var(--color-dark-secondary)",
          borderRadius: 10,
          padding: "1px 7px",
        }}
      >
        {count}
      </span>
    </div>
  );
}

// ── System search loading skeleton ────────────────────────────────────────────

function SystemSearchSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5">
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton-bone" style={{ width: "60%", height: 14 }} />
            <div className="skeleton-bone" style={{ width: "40%", height: 11 }} />
            <div className="skeleton-bone" style={{ width: "50%", height: 11 }} />
          </div>
          <div className="skeleton-bone" style={{ width: 56, height: 20, borderRadius: 10 }} />
        </div>
      ))}
    </div>
  );
}

// ── Create new account CTA ────────────────────────────────────────────────────

function CreateAccountCTA({ query }: { query: string }) {
  return (
    <div className="px-4 py-5">
      <button
        className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity"
        style={{
          background: "var(--color-dark-secondary)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--color-dark-tertiary)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--color-brand-coral) 15%, transparent)" }}
        >
          <Icon name="add" size={18} style={{ color: "var(--color-brand-coral)" }} />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Create new account
            {query.trim() && (
              <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                {" "}— "{query.trim()}"
              </span>
            )}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Add to Halosight and start capturing
          </p>
        </div>
      </button>
    </div>
  );
}

// ── Main page content ─────────────────────────────────────────────────────────

type SystemSearchState = "idle" | "loading" | "done";

function AccountsPageContent() {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("alphabetical");
  const [systemState, setSystemState] = useState<SystemSearchState>("idle");
  const [systemResults, setSystemResults] = useState<Account[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset system search when query changes
  useEffect(() => {
    setSystemState("idle");
    setSystemResults([]);
  }, [query]);

  const myFiltered = useMemo(() => {
    return sortAccounts(searchAccounts(mockAccounts, query), sort);
  }, [query, sort]);

  const hasQuery = query.trim().length > 0;
  const noMyResults = hasQuery && myFiltered.length === 0;

  function triggerSystemSearch() {
    setSystemState("loading");
    setSystemResults([]);
    // Simulate async API call
    searchTimerRef.current = setTimeout(() => {
      const results = searchAccounts(mockSystemAccounts, query);
      setSystemResults(results);
      setSystemState("done");
    }, 700);
  }

  function handleSystemAccountSelect(account: Account) {
    // In production: push to a "not my account" detail view with CTA to claim/capture
    // For prototype: navigate to the account detail page
    window.location.href = `/accounts/${account.id}`;
  }

  const showSystemSection = systemState === "loading" || systemState === "done";

  return (
    <div className="relative flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Top bar */}
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
          style={{
            background: "var(--color-dark-secondary)",
            outline: showSystemSection ? `1.5px solid var(--color-brand-purple)` : "none",
          }}
        >
          <Icon
            name="search"
            size={18}
            style={{
              color: showSystemSection ? "var(--color-brand-purple)" : "var(--color-text-muted)",
              flexShrink: 0,
              transition: "color 0.2s",
            }}
          />
          <input
            type="text"
            placeholder={showSystemSection ? "Searching all accounts…" : "Search"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          {showSystemSection && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "var(--color-brand-purple)",
                background: "rgba(139,146,255,0.12)",
                borderRadius: 6,
                padding: "2px 6px",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              ALL
            </span>
          )}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="active:opacity-60 flex-shrink-0"
            >
              <Icon name="cancel" fill size={16} style={{ color: "var(--color-text-disabled)" }} />
            </button>
          )}
        </div>
        <SortMenu current={sort} onChange={setSort} />
      </div>

      {/* Scrollable list area */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-28">

        {/* ── Preview states ── */}
        {preview === "loading" && <AccountListSkeleton rows={6} />}
        {preview === "error" && (
          <ErrorState
            title="Couldn't load accounts"
            message="We had trouble reaching the server. Check your connection and try again."
            onRetry={() => {}}
          />
        )}

        {/* ── Normal loaded state ── */}
        {!preview && (
          <>
            {/* MY ACCOUNTS section */}
            {showSystemSection && (
              <SectionHeader label="Your Accounts" count={myFiltered.length} />
            )}

            {myFiltered.length > 0 ? (
              <div className="flex flex-col">
                {myFiltered.map((account, i) => (
                  <AccountListItem
                    key={account.id}
                    account={account}
                    isLast={i === myFiltered.length - 1}
                  />
                ))}
              </div>
            ) : hasQuery ? (
              /* No results in my accounts */
              <div
                className="mx-4 mt-4 rounded-2xl flex flex-col items-center gap-4 px-5 py-6"
                style={{ background: "var(--color-dark-secondary)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(139,146,255,0.12)" }}
                >
                  <Icon name="search_off" size={22} style={{ color: "var(--color-brand-purple)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                    Not in your accounts
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    "{query}" didn't match anything assigned to you.
                  </p>
                </div>
                {systemState === "idle" && (
                  <button
                    onClick={triggerSystemSearch}
                    className="w-full h-10 rounded-xl font-semibold text-sm active:opacity-80 transition-opacity flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(139,146,255,0.15)",
                      border: "1px solid rgba(139,146,255,0.3)",
                      color: "var(--color-brand-purple)",
                    }}
                  >
                    <Icon name="public" size={16} style={{ color: "var(--color-brand-purple)" }} />
                    Search all Halosight accounts
                  </button>
                )}
              </div>
            ) : (
              /* Empty state — no query */
              <div className="flex items-center justify-center pt-20">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No accounts yet.
                </p>
              </div>
            )}

            {/* "Search all accounts" nudge — shown below results when there IS a query */}
            {hasQuery && myFiltered.length > 0 && systemState === "idle" && (
              <button
                onClick={triggerSystemSearch}
                className="mx-4 mt-2 mb-1 h-9 rounded-xl text-xs font-semibold active:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-dark-tertiary)",
                  color: "var(--color-text-muted)",
                }}
              >
                <Icon name="public" size={13} style={{ color: "var(--color-text-muted)" }} />
                Also search all Halosight accounts
              </button>
            )}

            {/* ── SYSTEM ACCOUNTS section ── */}
            {showSystemSection && (
              <div className="mt-4">
                {/* Section divider */}
                <div
                  className="mx-4 mb-1"
                  style={{ height: 1, background: "var(--color-dark-tertiary)" }}
                />

                {systemState === "loading" && (
                  <>
                    <SectionHeader label="All Halosight Accounts" count={0} />
                    <SystemSearchSkeleton />
                  </>
                )}

                {systemState === "done" && (
                  <>
                    <SectionHeader label="All Halosight Accounts" count={systemResults.length} />

                    {systemResults.length > 0 ? (
                      <div className="flex flex-col">
                        {systemResults.map((account, i) => (
                          <SystemAccountListItem
                            key={account.id}
                            account={account}
                            assignedRep={systemAccountReps[account.id] ?? "Unknown"}
                            isLast={i === systemResults.length - 1}
                            onSelect={handleSystemAccountSelect}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                          Not found anywhere in Halosight.
                        </p>
                      </div>
                    )}

                    {/* Create new account CTA — always shown at bottom of system search */}
                    <CreateAccountCTA query={query} />
                  </>
                )}
              </div>
            )}
          </>
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
