"use client";

/**
 * FLUTTER HANDOFF: AccountDetailScreen
 * Route: /accounts/[id]
 * Widget: StatefulWidget
 * State: activeTab ("overview" | "activity")
 * Tokens: surface/app, surface/card, surface/elevated, action/primary, text/* tokens
 * Flutter equivalent: account_detail_page.dart
 */

import { use, useState } from "react";
import Link from "next/link";
import PhoneFrame from "@/components/layout/PhoneFrame";
import BottomNav from "@/components/layout/BottomNav";
import AccountTypeIcon from "@/components/accounts/AccountTypeIcon";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { formatLastVisited } from "@/lib/utils";

function BackIcon() {
  return (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
      <path d="M9 1L1.5 8.5L9 16" stroke="#8B94A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActivityRow({ item }: {
  item: { date: Date; type: string; summary: string; hasTranscript: boolean };
}) {
  const { label } = formatLastVisited(item.date);
  return (
    <div className="px-4 py-4" style={{ borderBottom: "1px solid #2A3042" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#5D667A" }}>
          {item.type}
        </span>
        <span className="text-[12px]" style={{ color: "#5D667A" }}>{label}</span>
      </div>
      <p className="text-[14px] leading-relaxed" style={{ color: "#8B94A8" }}>{item.summary}</p>
      {item.hasTranscript && (
        <button className="mt-2 text-[12px] font-medium" style={{ color: "#8B92FF" }}>
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
      <PhoneFrame>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: "#8B94A8" }}>Account not found</p>
        </div>
      </PhoneFrame>
    );
  }

  const typeLabel =
    account.type === "corporate" ? "CORPORATE ACCOUNT" :
    account.type === "branch"    ? "BRANCH ACCOUNT"    : "ACCOUNT";

  return (
    <PhoneFrame>
      <div className="flex flex-col h-full" style={{ background: "#111420" }}>

        {/* Header */}
        <div className="pt-12 px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/accounts">
              <button className="p-2 -ml-2 active:opacity-60 transition-opacity">
                <BackIcon />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <AccountTypeIcon type={account.type} />
              <span className="text-[11px] font-bold tracking-widest" style={{ color: "#8B94A8" }}>
                {typeLabel}
              </span>
            </div>
          </div>

          {/* Account name */}
          <h1 className="text-[26px] font-bold leading-tight text-center mb-2" style={{ color: "#F7F8FF" }}>
            {account.name}
            {account.city && account.state ? ` of ${account.city}, ${account.state}` : ""}
          </h1>

          {/* Related accounts count */}
          {detail?.relatedAccountCount != null && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: "#5D667A" }}>
                Related Accounts
              </span>
              <span className="text-[14px] font-bold" style={{ color: "#8B94A8" }}>
                {detail.relatedAccountCount}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "#202535" }}>
            {(["overview", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-[14px] font-semibold transition-all capitalize"
                style={{
                  background: activeTab === tab ? "#2A3042" : "transparent",
                  color:      activeTab === tab ? "#F7F8FF" : "#8B94A8",
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
                    <h2 className="text-[18px] font-bold mb-2" style={{ color: "#F7F8FF" }}>Last Time</h2>
                    <p className="text-[15px] leading-relaxed" style={{ color: "#8B94A8" }}>
                      {detail.lastVisitSummary}
                    </p>
                  </section>
                  <section>
                    <h2 className="text-[18px] font-bold mb-3" style={{ color: "#F7F8FF" }}>Ideas for this Time</h2>
                    <ul className="flex flex-col gap-2.5">
                      {detail.ideasForThisTime.map((idea, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: "#8B94A8" }} />
                          <span className="text-[15px] leading-relaxed" style={{ color: "#8B94A8" }}>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[15px]" style={{ color: "#5D667A" }}>
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
                  <p className="text-[15px]" style={{ color: "#5D667A" }}>No activity recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Capture Meeting CTA */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid #2A3042" }}>
          <Link href={`/accounts/${id}/capture`}>
            <button
              className="w-full h-14 rounded-full font-semibold text-[16px] flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ background: "#FF6B5A", color: "#FFFFFF" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2.5C6.5 2.5 4.5 4.5 4.5 7V10.5C4.5 13 6.5 15 9 15C11.5 15 13.5 13 13.5 10.5V7C13.5 4.5 11.5 2.5 9 2.5Z" stroke="white" strokeWidth="1.5"/>
                <path d="M2.5 9.5C2.5 13.09 5.41 16 9 16C12.59 16 15.5 13.09 15.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 16V18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Capture Meeting
            </button>
          </Link>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
