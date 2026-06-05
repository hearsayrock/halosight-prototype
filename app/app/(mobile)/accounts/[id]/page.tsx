"use client";

/**
 * FLUTTER HANDOFF: AccountDetailScreen
 * Route: /accounts/[id]
 * Widget: StatefulWidget
 * State: activeTab ("overview" | "activity")
 * Tokens: --color-background, --color-dark-primary, --color-dark-secondary,
 *         --color-dark-tertiary, --color-text-primary, --color-text-muted,
 *         --color-text-disabled, --color-brand-purple, --color-brand-coral,
 *         --color-alpha-white-10, --radius-xl, --radius-full
 * Flutter equivalent: account_detail_page.dart
 */

import { use, useState } from "react";
import Link from "next/link";
import AccountTypeIcon from "@/components/accounts/AccountTypeIcon";
import Icon from "@/components/ui/Icon";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { formatLastVisited } from "@/lib/utils";

function ActivityRow({ item }: {
  item: { date: Date; type: string; summary: string; hasTranscript: boolean };
}) {
  const { label } = formatLastVisited(item.date);
  return (
    <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--color-alpha-white-10)" }}>
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-text-disabled)" }}
        >
          {item.type}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>{label}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {item.summary}
      </p>
      {item.hasTranscript && (
        <button className="mt-2 text-xs font-medium" style={{ color: "var(--color-brand-purple)" }}>
          View transcript →
        </button>
      )}
    </div>
  );
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");

  const detail = mockAccountDetails[id];
  const account = detail ?? mockAccounts.find((a) => a.id === id);

  if (!account) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--color-text-muted)" }}>Account not found</p>
      </div>
    );
  }

  const typeLabel =
    account.type === "corporate" ? "CORPORATE ACCOUNT" :
    account.type === "branch"    ? "BRANCH ACCOUNT"    : "ACCOUNT";

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/accounts">
            <button className="p-2 -ml-2 active:opacity-60 transition-opacity">
              <Icon name="chevron_left" size={24} style={{ color: "var(--color-text-muted)" }} />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <AccountTypeIcon type={account.type} />
            <span
              className="text-2xs font-bold tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Account name */}
        <h1
          className="text-[26px] font-bold leading-tight text-center mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {account.name}
          {account.city && account.state ? ` of ${account.city}, ${account.state}` : ""}
        </h1>

        {/* Related accounts count */}
        {detail?.relatedAccountCount != null && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-text-disabled)" }}
            >
              Related Accounts
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
              {detail.relatedAccountCount}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex p-1 gap-1"
          style={{ background: "var(--color-dark-primary)", borderRadius: "var(--radius-full)" }}
        >
          {(["overview", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-semibold transition-all capitalize"
              style={{
                borderRadius: "var(--radius-full)",
                background: activeTab === tab ? "var(--color-dark-secondary)" : "transparent",
                color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-muted)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="px-4 pb-4">
            {detail ? (
              <>
                <section className="mb-6">
                  <h2 className="heading-6 mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Last Time
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {detail.lastVisitSummary}
                  </p>
                </section>
                <section>
                  <h2 className="heading-6 mb-3" style={{ color: "var(--color-text-primary)" }}>
                    Ideas for this Time
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {detail.ideasForThisTime.map((idea, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--color-text-muted)" }}
                        />
                        <span className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                          {idea}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No overview available yet.
                  <br />
                  Capture your first meeting to generate insights.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            {detail?.recentActivity?.length ? (
              detail.recentActivity.map((item) => <ActivityRow key={item.id} item={item} />)
            ) : (
              <div className="py-8 text-center px-4">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No activity recorded yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Capture Meeting CTA */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid var(--color-dark-tertiary)" }}
      >
        <Link href={`/accounts/${id}/capture`}>
          <button
            className="w-full h-14 font-semibold text-base flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{
              background: "var(--color-brand-coral)",
              color: "var(--color-text-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Icon name="mic" size={18} style={{ color: "var(--color-text-primary)" }} />
            Capture Meeting
          </button>
        </Link>
      </div>

    </div>
  );
}
