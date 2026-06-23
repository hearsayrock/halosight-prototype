"use client";

/**
 * FLUTTER HANDOFF: AccountDetailScreen
 * Route: /accounts/[id]
 * Widget: StatefulWidget
 * State: activeTab ("overview" | "activity"), pageState (loading|error|loaded)
 * Tokens: --color-background, --color-dark-primary, --color-dark-secondary,
 *         --color-dark-tertiary, --color-text-primary, --color-text-muted,
 *         --color-text-disabled, --color-brand-coral, --radius-full, --radius-md
 * Flutter equivalent: account_detail_page.dart
 *
 * STATES (preview via ?preview=loading or ?preview=error):
 *   loading — skeleton shimmer for header + overview content
 *   error   — error card + retry CTA when the fetch fails
 *   loaded  — normal content (default)
 *
 * PULL-TO-REFRESH (Flutter only):
 *   Wrap the tab body in a RefreshIndicator. Re-call ViewModel.loadAccount(id).
 *   Not implemented in web prototype.
 */

import { use, useState, useRef, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import ActionItemCard from "@/components/accounts/ActionItemCard";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import { AccountDetailSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { useCapture } from "@/lib/context/CaptureContext";
import { useAccountState } from "@/lib/context/AccountStateContext";
import type { ActivityItem } from "@/lib/types";

// ── Activity card ─────────────────────────────────────────────────────────────

function formatActivityDate(date: Date): string {
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) +
    ", " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}hr ${m} mins` : `${h}hr`;
}

function ActivityCard({ item, accountId, isExternal }: { item: ActivityItem; accountId: string; isExternal?: boolean }) {
  return (
    <Link href={`/accounts/${accountId}/activity/${item.id}`}>
    <div
      className="flex items-start gap-3 p-4 active:opacity-70 transition-opacity"
      style={{
        background: isExternal ? "var(--color-dark-primary)" : "var(--color-dark-secondary)",
        borderRadius: "var(--radius-md)",
        border: isExternal ? "1px solid var(--color-dark-secondary)" : undefined,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {item.title}
        </p>
        <p
          className="text-sm leading-relaxed mb-2"
          style={{
            color: "var(--color-text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.summary}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
            {formatActivityDate(item.date)}
          </span>
          {item.durationMinutes != null && (
            <>
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>•</span>
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>
                {formatDuration(item.durationMinutes)}
              </span>
            </>
          )}
          {item.repName !== "Jordan Mills" && (
            <>
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>•</span>
              <div
                className="flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0"
                style={{
                  width: 18,
                  height: 18,
                  background: "var(--color-dark-tertiary)",
                  color: "var(--color-text-muted)",
                }}
                title={item.repName}
              >
                {item.repName.charAt(0)}
              </div>
            </>
          )}
          {isExternal && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(139,146,255,0.10)",
                color: "var(--color-brand-purple)",
                border: "1px solid rgba(139,146,255,0.18)",
              }}
            >
              Unassigned
            </span>
          )}
        </div>
      </div>
      <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
    </div>
    </Link>
  );
}

// ── Account AI overlay ────────────────────────────────────────────────────────

function AccountAIOverlay({
  account,
  lastActivity,
  actionItemCount,
  onClose,
}: {
  account: { id: string; name: string; contactName?: string };
  lastActivity?: { title: string; summary: string; date: Date };
  actionItemCount: number;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isConversing = messages.length > 0;

  const name = account.name;
  const contact = account.contactName;
  const lastTitle = lastActivity?.title;
  const lastSummary = lastActivity?.summary;

  const prompts: { label: string; response: string }[] = [
    {
      label: "What should I focus on today?",
      response: `Based on your history with ${name}, I'd prioritize checking in on any open follow-ups from your last visit${lastTitle ? ` ("${lastTitle}")` : ""}. ${actionItemCount > 0 ? `You have ${actionItemCount} open action item${actionItemCount > 1 ? "s" : ""} — worth reviewing before you walk in.` : "No open action items right now, so this is a good chance to set some."} Ask about their current pain points and where they see things heading next quarter.`,
    },
    {
      label: `Recap my last visit`,
      response: lastActivity
        ? `Your last logged visit was "${lastTitle}" on ${lastActivity.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Summary: ${lastSummary}`
        : `No logged visits yet for ${name}. This might be your first — a good chance to introduce yourself and learn what they care about most.`,
    },
    {
      label: "Suggested talking points",
      response: `A few angles worth hitting with ${name}:\n\n• Open with a recap of where things left off${lastTitle ? ` after "${lastTitle}"` : ""}\n• Ask what's changed on their end since your last conversation\n• Probe for any pressure points — budget cycles, new decision-makers, competitive activity\n${contact ? `• ${contact} responds well to specifics, so come with concrete examples or numbers` : "• Ask who else is involved in decisions you haven't met yet"}\n• Close by agreeing on a clear next step before you leave`,
    },
    {
      label: "What questions should I ask?",
      response: `Good questions to ask at ${name} right now:\n\n• "What's your biggest operational challenge heading into next quarter?"\n• "How are you currently handling [their core workflow area]?"\n• "Who else on your team is involved in evaluating this?"\n• "What would need to be true for us to move forward together?"\n• "Is there anything I can bring you next time that would be useful?"`,
    },
  ];

  function send(text: string) {
    if (!text.trim() || typing) return;
    setMessages((prev) => [...prev, { role: "user", content: text.trim() }]);
    setInput("");
    setTyping(true);
    const match = prompts.find((p) => p.label === text.trim());
    const response = match?.response ?? `Good question. Based on what I know about ${name}, I'd approach that by focusing on the relationship history and any open threads from previous conversations. Want me to dig into something specific?`;
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "ai", content: response }]);
    }, 1100);
  }

  useEffect(() => {
    if (messages.length > 0 || typing) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      style={{
        position: "absolute", inset: 0,
        background: "var(--color-background)",
        display: "flex", flexDirection: "column",
        pointerEvents: "auto", zIndex: 60,
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
        width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,146,255,0.11) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-12 pb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon name="auto_awesome" size={13} style={{ color: "var(--color-brand-purple)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--color-brand-purple)" }}>
              Halosight AI
            </span>
          </div>
          <p style={{ fontFamily: "Roboto Slab, Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
            {isConversing ? name : `Prepping for ${name}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center active:opacity-60 transition-opacity mt-1"
          style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-dark-secondary)", flexShrink: 0 }}
        >
          <Icon name="close" size={18} style={{ color: "var(--color-text-muted)" }} />
        </button>
      </div>

      {/* Chat body */}
      <div className="flex flex-col flex-1 overflow-hidden px-4 pb-8">
        {/* Messages */}
        {isConversing && (
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4 -mr-1 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "user" ? (
                  <span className="px-3 py-2 text-sm leading-relaxed whitespace-pre-line"
                    style={{ background: "var(--color-brand-purple)", color: "white", borderRadius: "16px 16px 4px 16px", maxWidth: "82%" }}>
                    {m.content}
                  </span>
                ) : (
                  <span className="px-3 py-2 text-sm leading-relaxed whitespace-pre-line"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-secondary)", borderRadius: "16px 16px 16px 4px", maxWidth: "92%" }}>
                    {m.content}
                  </span>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "16px 16px 16px 4px" }}>
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-text-disabled)" }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.55, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)", borderRadius: "var(--radius-full)", height: 44 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={isConversing ? "Ask a follow-up…" : "Ask anything about this account…"}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || typing}
            className="flex-shrink-0 active:opacity-60 transition-opacity disabled:opacity-30">
            <Icon name="send" size={15} style={{ color: "var(--color-brand-purple)" }} />
          </button>
        </div>

        {/* Subtle prompt suggestions */}
        {!isConversing && (
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {prompts.map((p) => (
              <button key={p.label} onClick={() => send(p.label)}
                className="text-left px-2.5 py-2 active:opacity-50 transition-opacity"
                style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11.5, color: "var(--color-text-disabled)", lineHeight: 1.35, display: "block" }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AccountDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const preview = searchParams.get("preview"); // "loading" | "error" | null
  const [activeTab, setActiveTab] = useState<"overview" | "activity">(
    searchParams.get("tab") === "activity" ? "activity" : "overview"
  );
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const { getItems } = useActionItems();
  const actionItems = getItems(id);

  const { status: captureStatus, accountId: capturingId, startCapture } = useCapture();
  const { disqualify, restore } = useAccountState();

  // Disqualify flow — pending toast, then commit + navigate back
  const [disqualifyPending, setDisqualifyPending] = useState(false);
  const disqualifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDisqualify() {
    setDisqualifyPending(true);
    disqualifyTimerRef.current = setTimeout(() => {
      disqualify(id);
      router.push("/accounts");
    }, 5000);
  }

  function handleUndoDisqualify() {
    if (disqualifyTimerRef.current) clearTimeout(disqualifyTimerRef.current);
    disqualifyTimerRef.current = null;
    restore(id);
    setDisqualifyPending(false);
  }

  function handleConfirmDisqualify() {
    if (disqualifyTimerRef.current) clearTimeout(disqualifyTimerRef.current);
    disqualifyTimerRef.current = null;
    disqualify(id);
    router.push("/accounts");
  }
  const isCapturing = captureStatus !== "idle" && capturingId === id;

  const justCreated = searchParams.get("just_created") === "true";
  const justCreatedName = searchParams.get("name") ?? "";

  const detail = mockAccountDetails[id];
  const mockAccount = mockAccounts.find((a) => a.id === id);
  // True for system/CRM accounts not in the rep's Halosight portfolio
  const isExternalAccount = !mockAccount;

  // For just-created companies that aren't in mock data yet, build a shell account from URL params
  const account = detail ?? mockAccount ?? (justCreated && justCreatedName
    ? { id, name: justCreatedName, type: "standalone" as const, halosightType: "prospect" as const, distanceMiles: 0, lastVisited: new Date(), taskCount: 0 }
    : undefined);

  // ── Preview states ────────────────────────────────────────────────────────
  if (preview === "loading") return <AccountDetailSkeleton />;

  if (preview === "error") {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <button onClick={() => router.push("/accounts")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>
        <ErrorState
          title="Couldn't load account"
          message="We had trouble fetching this account's details. Check your connection and try again."
          onRetry={() => {}}
        />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <button onClick={() => router.push("/accounts")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>
        <ErrorState
          title="Account not found"
          message="This account doesn't exist or may have been removed."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-4">

        {/* Back button row — assignee badge appears on the right for other reps' accounts */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => router.push("/accounts")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
          </button>
          {account.assignedInitial && account.assignedInitial !== "J" ? (
            /* Assigned to a different rep */
            <div className="flex items-center gap-2 pr-1">
              <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Assigned to</span>
              <div
                className="flex items-center justify-center rounded-full text-[13px] font-semibold"
                style={{
                  width: 28,
                  height: 28,
                  background: "var(--color-dark-secondary)",
                  color: "var(--color-text-muted)",
                  border: "1.5px solid var(--color-dark-tertiary)",
                }}
              >
                {account.assignedInitial}
              </div>
            </div>
          ) : !account.assignedInitial ? (
            /* No rep assigned */
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full mr-1"
              style={{
                background: "rgba(139,146,255,0.1)",
                color: "var(--color-brand-purple)",
                border: "1px solid rgba(139,146,255,0.2)",
              }}
            >
              Unassigned
            </span>
          ) : null}
        </div>

        {/* Account name */}
        <h1
          className="w-full text-center text-[26px] font-bold leading-tight px-10 mb-2"
          style={{
            color: "var(--color-text-primary)",
            fontFamily: "Roboto Slab, Georgia, serif",
          }}
        >
          {account.name}
        </h1>

        {/* Account metadata — address + customer type (always same layout) */}
        {(() => {
          const typeLabel = account.crmAccountType
            ? account.crmAccountType.replace(/-/g, "‑").replace(/\b\w/g, (c) => c.toUpperCase())
            : account.halosightType === "prospect"
            ? "Prospect"
            : null;
          if (!account.address && !typeLabel) return null;
          return (
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              {account.address && (
                <div className="flex items-center gap-1">
                  <Icon name="location_on" size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {account.address}
                  </span>
                </div>
              )}
              {account.address && typeLabel && (
                <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>·</span>
              )}
              {typeLabel && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-dark-secondary)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {typeLabel}
                </span>
              )}
            </div>
          );
        })()}

        {/* Lead status + disqualify — prospects only, side by side */}
        {account.halosightType === "prospect" && !justCreated && (
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div
                className="rounded-full flex-shrink-0"
                style={{ width: 7, height: 7, background: "var(--color-brand-teal)" }}
              />
              <span className="text-sm font-semibold" style={{ color: "var(--color-brand-teal)" }}>
                Lead
              </span>
            </div>
            <div style={{ width: 1, height: 14, background: "var(--color-dark-tertiary)", flexShrink: 0 }} />
            <button
              onClick={handleDisqualify}
              className="text-sm active:opacity-60 transition-opacity"
              style={{ color: "var(--color-brand-coral)" }}
            >
              Disqualify
            </button>
          </div>
        )}

        {/* Tabs — hidden on just-created blank slate */}
        {!justCreated && <div
          className="flex p-1 gap-1 mx-auto"
          style={{ width: 255, background: "var(--color-dark-primary)", borderRadius: "var(--radius-full)" }}
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
        </div>}
      </div>

      {/* Just-created empty state — replaces tabs entirely */}
      {justCreated && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center">
          <Icon name="auto_awesome" size={32} style={{ color: "var(--color-brand-purple)", marginBottom: 20 }} />
          <h2
            style={{
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize: 22, fontWeight: 700,
              color: "var(--color-text-primary)",
              lineHeight: 1.25, marginBottom: 12,
            }}
          >
            And just like that,<br />{account.name} exists.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-muted)", maxWidth: 280 }}>
            No visits yet. No notes. Nothing to sync to the CRM. Just potential, a blank slate, and nowhere to go but up.
          </p>
        </div>
      )}

      {/* Tab content — pb accounts for capture button + BottomNav */}
      {!justCreated && <div className="flex-1 overflow-y-auto pb-24">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="px-4 pb-4">
            {/* Detail-only sections */}
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

                <section className="mb-6">
                  <h2 className="heading-6 mb-3" style={{ color: "var(--color-text-primary)" }}>
                    Ideas for this Time
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {detail.ideasForThisTime.map((idea, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--color-text-muted)", marginTop: "0.625rem" }}
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
              <div className="py-8 text-center mb-2">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No overview available yet.
                  <br />
                  Capture your first meeting to generate insights.
                </p>
              </div>
            )}

            {/* Action Items — always visible regardless of detail */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading-6" style={{ color: "var(--color-text-primary)" }}>
                  Action Items
                </h2>
                {actionItems.length > 0 && (
                  <button onClick={() => setShowAddSheet(true)} className="active:opacity-60 transition-opacity">
                    <Icon name="add" size={20} style={{ color: "var(--color-text-primary)" }} />
                  </button>
                )}
              </div>

              {actionItems.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {actionItems.map((item) => (
                    <Link key={item.id} href={`/accounts/${id}/action-items/${item.id}`}>
                      <ActionItemCard item={item} />
                    </Link>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSheet(true)}
                  className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity"
                  style={{
                    background: "var(--color-dark-secondary)",
                    borderRadius: "var(--radius-xl)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--color-brand-purple) 15%, transparent)",
                    }}
                  >
                    <Icon name="add" size={18} style={{ color: "var(--color-brand-purple)" }} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      Add your first action item
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                      Track follow-ups from this visit
                    </p>
                  </div>
                </button>
              )}
            </section>
          </div>
        )}

        {/* Activity */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {detail?.recentActivity?.length ? (
              detail.recentActivity.map((item) => (
                <ActivityCard key={item.id} item={item} accountId={id} isExternal={isExternalAccount} />
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--color-text-disabled)" }}>
                  No activity recorded yet.
                </p>
              </div>
            )}
          </div>
        )}

      </div>}

      {/* Capture Meeting CTA — hidden while a capture is active for this account */}
      {!isCapturing && (
        <div
          className="absolute left-0 right-0 flex justify-center px-4"
          style={{ bottom: 32 }}
        >
          <button
            onClick={() => startCapture(id, account.name)}
            className="h-11 px-6 font-semibold text-[14px] flex items-center gap-2 transition-opacity active:opacity-80"
            style={{
              background: "var(--color-brand-coral)",
              color: "var(--color-text-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Icon name="edit" size={16} style={{ color: "var(--color-text-primary)" }} />
            Capture Meeting
          </button>
        </div>
      )}

      {/* AI prep FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.15 }}
        onClick={() => setAiOpen(true)}
        className="flex items-center justify-center active:opacity-80 transition-opacity"
        style={{
          position: "absolute",
          bottom: 28,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--color-brand-purple)",
          boxShadow: "0 4px 18px rgba(139,146,255,0.45)",
        }}
      >
        <Icon name="auto_awesome" size={20} style={{ color: "white" }} />
      </motion.button>

      {/* Add Action Item Sheet */}
      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

      {/* AI prep overlay */}
      {typeof document !== "undefined" && document.getElementById("phone-overlay-root") && createPortal(
        <AnimatePresence>
          {aiOpen && (
            <AccountAIOverlay
              account={account}
              lastActivity={detail?.recentActivity?.[0]}
              actionItemCount={actionItems.length}
              onClose={() => setAiOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.getElementById("phone-overlay-root")!
      )}

      {/* Disqualify toast */}
      {typeof document !== "undefined" && document.getElementById("phone-overlay-root") && createPortal(
        <AnimatePresence>
          {disqualifyPending && (
            <motion.div
              key="disqualify-toast"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                position: "absolute",
                bottom: 106,
                left: 16,
                right: 16,
                zIndex: 60,
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  background: "var(--color-dark-secondary)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--color-dark-tertiary)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)",
                  padding: "12px 16px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(107, 157, 176, 0.20)" }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-brand-teal)" }} />
                  </div>
                  <span className="flex-1 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Lead disqualified
                  </span>
                  <button
                    onClick={handleUndoDisqualify}
                    className="text-sm font-semibold active:opacity-60 transition-opacity"
                    style={{ color: "var(--color-brand-purple)" }}
                  >
                    undo
                  </button>
                  <button
                    onClick={handleConfirmDisqualify}
                    className="ml-1 flex items-center justify-center active:opacity-60 transition-opacity"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("phone-overlay-root")!
      )}

    </div>
  );
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <AccountDetailPageContent params={params} />
    </Suspense>
  );
}
