"use client";

/**
 * FLUTTER HANDOFF: AccountDetailScreen
 * Route: /relationships/[id]
 * Widget: StatefulWidget
 * State: activeTab ("overview" | "activity"), pageState (loading|error|loaded)
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary, --md-sys-color-dark-secondary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-text-primary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-brand-coral, --radius-full, --radius-md
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
import KebabMenu from "@/components/ui/KebabMenu";
import ConvertToAccountSheet from "@/components/accounts/ConvertToAccountSheet";
import AIPrepChat from "@/components/accounts/AIPrepChat";
import ActionItemCard from "@/components/accounts/ActionItemCard";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import CompletionToast from "@/components/ui/CompletionToast";
import NoteSheet from "@/components/ui/NoteSheet";
import { AccountDetailSkeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { systemAccountReps } from "@/lib/mock-data/system-accounts";
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

function ActivityCard({ item, accountId, isExternal, href }: { item: ActivityItem; accountId: string; isExternal?: boolean; href?: string }) {
  return (
    <Link href={href ?? `/relationships/${accountId}/activity/${item.id}`}>
    <div
      className="flex items-start gap-3 p-4 active:opacity-70 transition-opacity"
      style={{
        background: isExternal ? "var(--md-sys-color-dark-primary)" : "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-md)",
        border: isExternal ? "1px solid var(--md-sys-color-dark-secondary)" : undefined,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-base-bold mb-1" style={{ color: "var(--md-sys-color-text-primary)" }}>
          {item.title}
        </p>
        <p
          className="text-sm leading-relaxed mb-2"
          style={{
            color: "var(--md-sys-color-text-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.summary}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
            {formatActivityDate(item.date)}
          </span>
          {item.durationMinutes != null && (
            <>
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>•</span>
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                {formatDuration(item.durationMinutes)}
              </span>
            </>
          )}
          {item.repName !== "Jordan Mills" && (
            <>
              <span className="text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>•</span>
              <div
                className="flex items-center justify-center rounded-full text-2xs-bold flex-shrink-0"
                style={{
                  width: 18,
                  height: 18,
                  background: "var(--md-sys-color-dark-tertiary)",
                  color: "var(--md-sys-color-text-muted)",
                }}
                title={item.repName}
              >
                {item.repName.charAt(0)}
              </div>
            </>
          )}
          {isExternal && (
            <span
              className="text-2xs-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(139,146,255,0.10)",
                color: "var(--md-sys-color-neonindigo)",
                border: "1px solid rgba(139,146,255,0.18)",
              }}
            >
              Unassigned
            </span>
          )}
        </div>
      </div>
      <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
    </div>
    </Link>
  );
}

// ── AI company snapshot (lite mode) ──────────────────────────────────────────

interface CompanyInfo {
  tags: string[];
  employees: string;
  revenue: string;
  location: string;
  founded: string;
  description: string;
}

const COMPANY_LOOKUP: Record<string, CompanyInfo> = {
  "profleet": {
    tags: ["Fleet Management", "SaaS"],
    employees: "250–500",
    revenue: "$18M–$30M est.",
    location: "Phoenix, AZ",
    founded: "2011",
    description: "ProFleet helps commercial fleet operators cut vehicle downtime with real-time GPS tracking and predictive maintenance scheduling across mixed-use fleets.",
  },
  "saddleback fleet services": {
    tags: ["Fleet Services", "B2B"],
    employees: "50–150",
    revenue: "$4M–$8M est.",
    location: "Scottsdale, AZ",
    founded: "2004",
    description: "Full-service commercial fleet maintenance with same-day turnaround for trucks and last-mile delivery vehicles across the Southwest.",
  },
  "eagle transport": {
    tags: ["Transportation", "Logistics"],
    employees: "100–250",
    revenue: "$9M–$15M est.",
    location: "Tucson, AZ",
    founded: "1998",
    description: "Regional trucking and freight logistics company serving the Southwest corridor, operating a fleet of over 200 commercial vehicles.",
  },
  "riverside distribution": {
    tags: ["Distribution", "Wholesale"],
    employees: "75–200",
    revenue: "$6M–$12M est.",
    location: "Mesa, AZ",
    founded: "2001",
    description: "Regional wholesale distributor specializing in industrial supplies and equipment for construction and facility management customers.",
  },
};

function lookupCompany(name: string): CompanyInfo {
  return (
    COMPANY_LOOKUP[name.toLowerCase().trim()] ?? {
      tags: ["B2B"],
      employees: "25–75",
      revenue: "$3M–$10M est.",
      location: "United States",
      founded: "2010",
      description: "Details are still coming together for this one. Your first visit will help Halosight build a complete profile.",
    }
  );
}

function CompanyStatRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} size={14} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>{label}</span>
    </div>
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

  const { getItems, addItem, updateItem } = useActionItems();
  const [completedItemIds, setCompletedItemIds] = useState<string[]>([]);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allActionItems = getItems(id);
  const actionItems = allActionItems.filter((i) => !completedItemIds.includes(i.id));

  function handleComplete(itemId: string) {
    if (pendingItemId) return;
    setPendingItemId(itemId);
    completionTimerRef.current = setTimeout(() => {
      const item = allActionItems.find((i) => i.id === itemId);
      if (item) updateItem(id, { ...item, status: "done" });
      setCompletedItemIds((prev) => [...prev, itemId]);
      setPendingItemId(null);
    }, 8000);
  }

  function handleUndoComplete() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    setPendingItemId(null);
  }

  // Trigger completion when returning from action item detail page
  const justCompletedHandled = useRef(false);
  useEffect(() => {
    const justCompleted = searchParams.get("just_completed");
    if (justCompleted && !justCompletedHandled.current) {
      justCompletedHandled.current = true;
      handleComplete(justCompleted);
      router.replace(`/relationships/${id}`);
    }
  }, []); // eslint-disable-line

  function handleAddNote() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    completionTimerRef.current = null;
    setNoteSheetOpen(true);
  }

  function handleNoteDone(note: string) {
    const item = allActionItems.find((i) => i.id === pendingItemId);
    if (item) updateItem(id, { ...item, status: "done", ...(note.trim() ? { note } : {}) });
    if (pendingItemId) setCompletedItemIds((prev) => [...prev, pendingItemId]);
    setNoteSheetOpen(false);
    setPendingItemId(null);
  }

  const { status: captureStatus, accountId: capturingId, startCapture } = useCapture();
  const { disqualify, restore, needsAttention, clearNeedsAttention, updateContact, getContactOverride } = useAccountState();

  // Contact info for leads — form state for the Needs Attention banner
  const [contactForm, setContactForm] = useState({ name: "", title: "", phone: "" });
  const [contactSaved, setContactSaved] = useState(false);

  function handleSaveContact() {
    if (!contactForm.name.trim()) return;
    updateContact(id, {
      contactName: contactForm.name.trim(),
      contactTitle: contactForm.title.trim() || undefined,
      phone: contactForm.phone.trim() || undefined,
    });
    setContactSaved(true);
  }

  const [showConvertSheet, setShowConvertSheet] = useState(false);

  // Disqualify flow — confirmation dialog, then pending toast, then commit + navigate back
  const [showDisqualifyConfirm, setShowDisqualifyConfirm] = useState(false);
  const [disqualifyPending, setDisqualifyPending] = useState(false);
  const disqualifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDisqualify() {
    setDisqualifyPending(true);
    disqualifyTimerRef.current = setTimeout(() => {
      disqualify(id);
      router.push("/relationships");
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
    router.push("/relationships");
  }
  const isCapturing = captureStatus !== "idle" && capturingId === id;

  const justCreated = searchParams.get("just_created") === "true";
  const justCreatedName = searchParams.get("name") ?? "";
  const capturedParam = searchParams.get("captured") === "true";

  const DEMO_CAPTURE_OVERVIEW = {
    lastVisitSummary: "Sandra confirmed they're moving forward with the partnership and asked for a formal proposal by end of next week. A competitor came in 15% lower, but our support model stood out as the differentiator.",
    ideasForThisTime: [
      "Send Marcus (IT lead) an intro email and loop him into the proposal process",
      "Deliver the formal proposal by Friday — price, timeline, and onboarding plan",
      "Follow up on the competitor quote gap with a support-tier comparison",
    ],
  };

  const detail = mockAccountDetails[id];
  const mockAccount = mockAccounts.find((a) => a.id === id);

  // Check if this is the testing company stored in localStorage, and whether a visit has been logged
  const storedTestingCompany = (() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("hs_testing_company") ?? "null"); } catch { return null; }
  })();
  const isTestingCompany = !detail && !mockAccount && storedTestingCompany?.id === id;
  const testingVisited = typeof window !== "undefined" && localStorage.getItem("hs_testing_visited") === "true";

  // True for system/CRM accounts not in the rep's Halosight portfolio
  const isExternalAccount = !mockAccount && !isTestingCompany;

  // For just-created companies that aren't in mock data yet, build a shell account from URL params or localStorage
  const account = detail ?? mockAccount ?? (justCreated && justCreatedName
    ? { id, name: justCreatedName, type: "standalone" as const, halosightType: "prospect" as const, distanceMiles: 0, lastVisited: new Date(), taskCount: 0 }
    : isTestingCompany
    ? { id, name: storedTestingCompany.name, type: "standalone" as const, halosightType: "prospect" as const, distanceMiles: 0, lastVisited: new Date(), taskCount: 0 }
    : undefined);

  // When capture is ready (or was just completed) for a new lead, transition out of "just created" empty state.
  // Latch with a ref so dismissing the "ready" bar doesn't revert the page back to the empty state.
  // For the testing company, only show the populated state after a visit has been logged.
  const captureJustCompletedNow =
    (captureStatus === "ready" && capturingId === id && !detail) ||
    (capturedParam && !detail) ||
    (isTestingCompany && testingVisited);
  const captureJustCompletedRef = useRef(false);
  if (captureJustCompletedNow) captureJustCompletedRef.current = true;
  const captureJustCompleted = captureJustCompletedRef.current;
  const effectiveJustCreated = justCreated && !captureJustCompleted;

  // Shrink the AIPrepChat wrapper when the soft keyboard opens so the bottom bar stays visible
  const chatWrapperRef = useRef<HTMLDivElement>(null);
  const [chatAreaHeight, setChatAreaHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!effectiveJustCreated) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      if (!chatWrapperRef.current) return;
      const top = chatWrapperRef.current.getBoundingClientRect().top;
      const keyboardOpen = vv.height < window.innerHeight - 50;
      setChatAreaHeight(keyboardOpen ? Math.max(0, vv.height - top) : null);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [effectiveJustCreated]);

  // Seed the 3 static action items when a capture completes for a new (non-mock) account
  const captureSeededRef = useRef(false);
  useEffect(() => {
    if (!captureJustCompleted || captureSeededRef.current || allActionItems.length > 0) return;
    captureSeededRef.current = true;
    [
      { id: "ht-1", title: "Send the proposal and pricing over" },
      { id: "ht-2", title: "Confirm fleet size before next meeting" },
      { id: "ht-3", title: "Loop in IT lead on the integration" },
    ].forEach((t) => addItem(id, { id: t.id, title: t.title, dueDate: null, status: "open" }));
  }, [captureJustCompleted]); // eslint-disable-line

  // ── Preview states ────────────────────────────────────────────────────────
  if (preview === "loading") return <AccountDetailSkeleton />;

  if (preview === "error") {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <button onClick={() => router.push("/relationships")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
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
      <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>
        <div className="pt-10 px-4 pb-2">
          <button onClick={() => router.push("/relationships")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
        </div>
        <ErrorState
          title="Company not found"
          message="This account doesn't exist or may have been removed."
        />
      </div>
    );
  }

  const companyInfo = lookupCompany(account.name);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className={`pt-10 px-4 ${effectiveJustCreated ? "pb-0" : "pb-4"}`}>

        {/* Back button row */}
        <div className="relative flex items-center justify-between mb-3">
          <button onClick={() => router.push("/relationships")} className="p-1 active:opacity-60 transition-opacity">
            <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
          {account.halosightType === "prospect" && !effectiveJustCreated && (
            <span
              className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: "rgba(107, 157, 176, 0.18)", color: "var(--md-sys-color-brand-teal)" }}
            >
              Lead
            </span>
          )}
          {account.halosightType === "prospect" && !effectiveJustCreated && (
            <KebabMenu
              items={[
                { label: "Disqualify", onClick: () => setShowDisqualifyConfirm(true), destructive: true },
              ]}
            />
          )}
        </div>

        {/* Account name — font size scales down so long names stay 2–3 lines max */}
        {!effectiveJustCreated && (
          <h1
            className="w-full text-center font-bold leading-snug px-6 mb-2 line-clamp-2"
            style={{
              color: "var(--md-sys-color-text-primary)",
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize:
                account.name.length > 55 ? 17 :
                account.name.length > 38 ? 20 :
                account.name.length > 25 ? 23 :
                26,
            }}
          >
            {account.name}
          </h1>
        )}

        {/* Account metadata — address */}
        {!effectiveJustCreated && account.address && (
          <div className="flex items-center justify-center gap-1 mb-3">
            <Icon name="location_on" size={13} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "var(--md-sys-color-text-muted)" }}>
              {account.address}
            </span>
          </div>
        )}

        {/* Unowned account banner — shown for system/CRM accounts not owned by the current rep */}
        {isExternalAccount && !justCreated && (() => {
          const repName = systemAccountReps[account.id];
          const message = repName
            ? `You're viewing ${repName}'s account — notes you capture here will be visible to them.`
            : "This account isn't assigned to a rep — notes you capture here will be visible to your team.";
          return (
            <div
              className="flex items-start gap-2.5 px-3.5 py-3 mb-3 mx-1"
              style={{
                background: "rgba(139, 146, 255, 0.08)",
                border: "1px solid rgba(139, 146, 255, 0.18)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <Icon name="info" size={15} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0, marginTop: 1 }} />
              <span className="body-xs leading-snug" style={{ color: "var(--md-sys-color-text-secondary)" }}>
                {message}
              </span>
            </div>
          );
        })()}

        {/* Needs Attention banner — contact info for existing leads missing contact info */}
        {account.halosightType === "prospect" && needsAttention(id) && !contactSaved && !effectiveJustCreated && !captureJustCompleted && (
          <div
            className="mx-1 mb-3 px-3.5 py-3"
            style={{
              background: "rgba(245,166,35,0.06)",
              border: "1px solid rgba(245,166,35,0.25)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Icon name="error" fill size={14} style={{ color: "var(--md-sys-color-warning)", flexShrink: 0 }} />
              <span className="text-[11px] font-semibold" style={{ color: "var(--md-sys-color-warning)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {justCreated ? "Who are you meeting with?" : "Missing contact info"}
              </span>
            </div>
            <p className="text-[11px] mb-3" style={{ color: "var(--md-sys-color-text-muted)" }}>
              {justCreated
                ? "Add contact details when you know them — none of this is required right now."
                : "Fill in contact details whenever you have them."}
            </p>
            <div className="flex flex-col gap-2">
              {[
                { key: "name", placeholder: "Full name", label: "Name *" },
                { key: "title", placeholder: "Job title", label: "Title" },
                { key: "phone", placeholder: "Phone number", label: "Phone" },
              ].map(({ key, placeholder, label }) => (
                <div key={key}>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--md-sys-color-text-disabled)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
                  <input
                    type={key === "phone" ? "tel" : "text"}
                    placeholder={placeholder}
                    value={contactForm[key as keyof typeof contactForm]}
                    onChange={(e) => setContactForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-[14px] outline-none px-3 py-2"
                    style={{
                      background: "var(--md-sys-color-dark-secondary)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--md-sys-color-text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => { clearNeedsAttention(id); setContactSaved(true); }}
                className="text-[12px] active:opacity-60 transition-opacity"
                style={{ color: "var(--md-sys-color-text-muted)" }}
              >
                Skip for now
              </button>
              <button
                onClick={handleSaveContact}
                disabled={!contactForm.name.trim()}
                className="h-8 px-4 text-[12px] font-semibold rounded-full transition-opacity active:opacity-70"
                style={{
                  background: contactForm.name.trim() ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-dark-tertiary)",
                  color: contactForm.name.trim() ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)",
                }}
              >
                Save contact
              </button>
            </div>
          </div>
        )}

        {/* AI review ready banner — shown for accounts with a pending meeting review */}
        {account.halosightType === "prospect" && id === "innovative-tech-tucson" && !effectiveJustCreated && (
          <button
            onClick={() => router.push(`/relationships/${id}/review`)}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 mb-4 mx-0 active:opacity-70 transition-opacity text-left"
            style={{
              background: "rgba(139,146,255,0.08)",
              border: "1px solid rgba(139,146,255,0.2)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Icon name="auto_awesome" size={15} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
            <span className="flex-1 text-[13px] font-medium" style={{ color: "var(--md-sys-color-text-secondary)" }}>
              AI found <span style={{ color: "var(--md-sys-color-neonindigo)", fontWeight: 700 }}>3 updates</span> from your last visit
            </span>
            <Icon name="arrow_forward" size={15} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
          </button>
        )}

        {/* Tabs — hidden on just-created blank slate */}
        {!effectiveJustCreated && <div
          className="flex p-1 gap-1 mx-auto"
          style={{ width: 255, background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-full)" }}
        >
          {(["overview", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm-bold transition-all capitalize"
              style={{
                borderRadius: "var(--radius-full)",
                background: activeTab === tab ? "var(--md-sys-color-dark-secondary)" : "transparent",
                color: activeTab === tab ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>}
      </div>

      {/* Just-created state — AI prep chat */}
      {effectiveJustCreated && (
        <div
          ref={chatWrapperRef}
          style={{
            ...(chatAreaHeight != null
              ? { flex: "none", height: chatAreaHeight, transition: "height 0.2s ease" }
              : { flex: "1" }),
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AIPrepChat accountName={account.name} onLogVisit={() => startCapture(id, account.name)} />
        </div>
      )}

      {/* Tab content — pb accounts for capture button + BottomNav */}
      {!effectiveJustCreated && <div className="flex-1 overflow-y-auto pb-24">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="px-4 pb-4">
            {/* Detail-only sections */}
            {(detail || captureJustCompleted) ? (
              <>
                <section className="mb-6">
                  <h2 className="heading-6 mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>
                    Last Time
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: "var(--md-sys-color-text-muted)" }}>
                    {detail?.lastVisitSummary ?? DEMO_CAPTURE_OVERVIEW.lastVisitSummary}
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="heading-6 mb-3" style={{ color: "var(--md-sys-color-text-primary)" }}>
                    Ideas for this Time
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {(detail?.ideasForThisTime ?? DEMO_CAPTURE_OVERVIEW.ideasForThisTime).map((idea, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 mt-[10px] w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--md-sys-color-text-muted)" }}
                        />
                        <span className="text-base leading-relaxed" style={{ color: "var(--md-sys-color-text-muted)" }}>
                          {idea}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <div className="py-8 text-center mb-2">
                <p className="text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                  No overview available yet.
                  <br />
                  Capture your first meeting to generate insights.
                </p>
              </div>
            )}

            {/* Action Items — always visible regardless of detail */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="heading-6" style={{ color: "var(--md-sys-color-text-primary)" }}>
                  Action Items
                </h2>
                {actionItems.length > 0 && (
                  <button onClick={() => setShowAddSheet(true)} className="active:opacity-60 transition-opacity">
                    <Icon name="add" size={20} style={{ color: "var(--md-sys-color-text-primary)" }} />
                  </button>
                )}
              </div>

              {actionItems.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {actionItems.map((item) => (
                    <Link key={item.id} href={`/relationships/${id}/action-items/${item.id}?from=account`}>
                      <ActionItemCard item={item} onComplete={() => handleComplete(item.id)} pending={pendingItemId === item.id} />
                    </Link>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSheet(true)}
                  className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity"
                  style={{
                    background: "var(--md-sys-color-dark-secondary)",
                    borderRadius: "var(--radius-xl)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 15%, transparent)",
                    }}
                  >
                    <Icon name="add" size={18} style={{ color: "var(--md-sys-color-neonindigo)" }} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                      Add your first action item
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--md-sys-color-text-secondary)" }}>
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
            {(detail?.recentActivity?.length || captureJustCompleted) ? (
              (detail?.recentActivity ?? [{ id: "new-capture", accountId: "new-capture", title: "Sandra confirmed we're the frontrunner for the contract", summary: "Strong meeting — Sandra is ready to move forward and asked for a formal proposal by end of next week.", date: new Date(), durationMinutes: 28, hasTranscript: true, repName: "Jordan Mills", type: "visit" as const }]).map((item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  accountId={id}
                  isExternal={item.id === "new-capture" ? false : isExternalAccount}
                  href={item.id === "new-capture"
                    ? `/relationships/${id}/activity/new-capture?name=${encodeURIComponent(account.name)}`
                    : undefined}
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                  No activity recorded yet.
                </p>
              </div>
            )}
          </div>
        )}

      </div>}

      {/* Log a Visit CTA — hidden while capturing or in just-created state (button lives in AIPrepChat) */}
      {!isCapturing && !effectiveJustCreated && (
        <div
          className="absolute left-0 right-0 flex flex-col items-center gap-2.5 px-4"
          style={{ bottom: 32 }}
        >
          <button
            onClick={() => startCapture(id, account.name)}
            className="h-11 px-6 text-sm-bold flex items-center gap-2 transition-opacity active:opacity-80"
            style={{
              background: "var(--md-sys-color-brand-coral)",
              color: "var(--md-sys-color-text-primary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Icon name="border_color" size={16} style={{ color: "var(--md-sys-color-text-primary)" }} />
            Log a Visit
          </button>
        </div>
      )}

      {/* Add Action Item Sheet */}
      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

      {/* Convert to Account Sheet */}
      {showConvertSheet && (
        <ConvertToAccountSheet
          accountName={account.name}
          initialContact={{
            name:  getContactOverride(id)?.contactName  ?? mockAccount?.contactName  ?? "",
            title: getContactOverride(id)?.contactTitle ?? mockAccount?.contactTitle ?? "",
            phone: getContactOverride(id)?.phone        ?? "",
          }}
          onClose={() => setShowConvertSheet(false)}
          onConverted={() => router.push("/relationships")}
        />
      )}

      {/* Completion toast */}
      <CompletionToast
        visible={pendingItemId !== null && !noteSheetOpen}
        bottom={106}
        onUndo={handleUndoComplete}
        onAddNote={handleAddNote}
        onDismiss={() => {
          if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
          const item = allActionItems.find((i) => i.id === pendingItemId);
          if (item) updateItem(id, { ...item, status: "done" });
          if (pendingItemId) setCompletedItemIds((prev) => [...prev, pendingItemId]);
          setPendingItemId(null);
        }}
      />
      <NoteSheet visible={noteSheetOpen} onDone={handleNoteDone} />

      {/* Disqualify toast */}
      {typeof document !== "undefined" && document.getElementById("phone-overlay-root") && createPortal(
        <AnimatePresence>
          {showDisqualifyConfirm && (
            <>
              {/* Scrim */}
              <motion.div
                key="disqualify-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowDisqualifyConfirm(false)}
                style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 70, pointerEvents: "auto" }}
              />
              {/* Sheet */}
              <motion.div
                key="disqualify-confirm"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  zIndex: 71,
                  pointerEvents: "auto",
                  background: "var(--md-sys-color-dark-secondary)",
                  borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                  padding: "28px 24px 44px",
                }}
              >
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--md-sys-color-text-primary)", marginBottom: 8 }}>
                  Disqualify this lead?
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--md-sys-color-text-secondary)", marginBottom: 28 }}>
                  This lead will disappear from your list. This action can't be undone from the app.
                </p>
                <button
                  onClick={() => { setShowDisqualifyConfirm(false); handleDisqualify(); }}
                  className="w-full py-3.5 rounded-full text-base font-semibold active:opacity-80 transition-opacity mb-3"
                  style={{ background: "var(--md-sys-color-brand-coral)", color: "#fff" }}
                >
                  Yes, disqualify
                </button>
                <button
                  onClick={() => setShowDisqualifyConfirm(false)}
                  className="w-full py-3.5 rounded-full text-base font-semibold active:opacity-80 transition-opacity"
                  style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-primary)" }}
                >
                  Cancel
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.getElementById("phone-overlay-root")!
      )}

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
                  background: "var(--md-sys-color-dark-secondary)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--md-sys-color-dark-tertiary)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)",
                  padding: "12px 16px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(107, 157, 176, 0.20)" }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--md-sys-color-brand-teal)" }} />
                  </div>
                  <span className="flex-1 text-sm-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
                    Lead disqualified
                  </span>
                  <button
                    onClick={handleUndoDisqualify}
                    className="text-sm-bold active:opacity-60 transition-opacity"
                    style={{ color: "var(--md-sys-color-neonindigo)" }}
                  >
                    undo
                  </button>
                  <button
                    onClick={handleConfirmDisqualify}
                    className="ml-1 flex items-center justify-center active:opacity-60 transition-opacity"
                    style={{ color: "var(--md-sys-color-text-muted)" }}
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
