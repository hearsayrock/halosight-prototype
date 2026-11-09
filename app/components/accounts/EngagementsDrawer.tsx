"use client";

/**
 * FLUTTER HANDOFF: EngagementsDrawer
 * Route: opened from the hamburger on the home screen (/relationships)
 * Widget: StatefulWidget (left Drawer). EngagementsPanel is the stateless body.
 * State: open, search text / search open, how many rows are loaded, loading flag; read state lives in AccountState (which rows were opened)
 * Data: mock-data/home.ts mockRecentActivities (RecentActivity[]). Flutter: GetRecentEngagementsUseCase with cursor paging.
 * Flutter equivalent: engagements_drawer.dart (Drawer + ListView.builder with an end-of-list loader)
 *
 * The side drawer is the feed of recent interactions across every account, newest first.
 *   - Header: halosight logo on the left, a round search button on the right. Tapping it grows a pill search field leftward out of the button
 *     (spring, ~300ms) while the logo fades; the button turns into an X. The field is the shared SearchField (size lg) with its active stroke on.
 *     X shrinks it back. It filters the feed by company or title.
 *   - Under it: three links in the serif face with an icon each — Companies, Action Items, Risks — then an "Interactions" label over a hairline
 *     and the feed. While searching, the links and label step aside so the results get the room.
 *   - Rows are ActivityCard variants "recent" (opened) and "recent-unread" (dot, bold title, "Modified …" line). Opening a row marks it read.
 *   - Lazy loading: the first 12 rows load with the drawer; when the end of the list scrolls into view the next 8 load after a short
 *     beat, with ThinkingDots at the bottom, until the feed ends. (Prototype: the delay is simulated; real data pages from the API.)
 *   - Spring-free slide in from the left (280ms), scrim alpha-scrim, panel dark-primary, 86% of the phone wide.
 * Tokens: color.text.primary (links), color.text.muted (Interactions label), color.alpha.white-10 (hairline), font.serif, color.dark.primary (panel), color.dark.secondary (search button, search field), color.dark.tertiary (edge), color.alpha.scrim,
 *         color.text.primary / muted, radius.full, spacing.2/3/4/5
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ActivityCard from "@/components/accounts/ActivityCard";
import Icon from "@/components/ui/Icon";
import SearchField from "@/components/ui/SearchField";
import ThinkingDots from "@/components/ui/ThinkingDots";
import { DrawerBackdrop, useOverlayRoot } from "@/components/ui/Drawer";
import { mockRecentActivities } from "@/lib/mock-data/home";
import { useAccountState } from "@/lib/context/AccountStateContext";
import type { RecentActivity } from "@/lib/types";

export type EngagementsDestination = "companies" | "actionItems" | "risks";

const NAV: { id: EngagementsDestination; label: string; icon: string }[] = [
  { id: "companies", label: "Companies", icon: "person" },
  { id: "actionItems", label: "Action Items", icon: "check_box" },
  { id: "risks", label: "Risks", icon: "flag" },
];

const FIRST_PAGE = 12;
const PAGE = 8;
const LOAD_DELAY = 700;

function linkFor(r: RecentActivity): string | undefined {
  if (!r.accountId) return undefined;
  return r.activityId ? `/relationships/${r.accountId}/activity/${r.activityId}` : `/relationships/${r.accountId}`;
}

/** Header + list. Stateless: pass the rows to show, whether more are loading, and a ref callback for the end-of-list sentinel. */
export function EngagementsPanel({
  items, loading = false, searching = false, query = "", onQuery, onToggleSearch, onNavigate, isUnread, onOpen, sentinelRef, scrollRef, empty,
}: {
  items: RecentActivity[];
  loading?: boolean;
  searching?: boolean;
  query?: string;
  onQuery?: (q: string) => void;
  onToggleSearch?: () => void;
  onNavigate?: (to: EngagementsDestination) => void;
  isUnread: (r: RecentActivity) => boolean;
  onOpen?: (r: RecentActivity) => void;
  sentinelRef?: React.Ref<HTMLDivElement>;
  scrollRef?: React.Ref<HTMLDivElement>;
  empty?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Focus the field once it has grown open.
  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [searching]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center flex-shrink-0" style={{ gap: "var(--spacing-3)", padding: "var(--spacing-12) var(--spacing-5) var(--spacing-3)" }}>
        {/* Logo and the search field share one slot. The field grows leftward out of the button, the logo fades behind it. */}
        <div className="relative flex-1" style={{ height: 48 }}>
          <motion.div
            className="absolute left-0 flex items-center"
            style={{ top: 0, bottom: 0 }}
            animate={{ opacity: searching ? 0 : 1, x: searching ? -8 : 0 }}
            transition={{ duration: 0.18 }}
            aria-hidden={searching}
          >
            <Image src="/logo-white.png" alt="Halosight" width={110} height={30} style={{ objectFit: "contain", height: "auto", width: 110 }} />
          </motion.div>
          <motion.div
            className="absolute right-0"
            style={{ top: 0, height: 48, overflow: "hidden", borderRadius: "var(--radius-full)", pointerEvents: searching ? "auto" : "none" }}
            initial={false}
            animate={{ width: searching ? "100%" : 48, opacity: searching ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <SearchField
              size="lg"
              inputRef={inputRef}
              value={query}
              onChange={(v) => onQuery?.(v)}
              placeholder="Search interactions"
              active={searching}
              style={{ width: "100%", minWidth: 220 }}
            />
          </motion.div>
        </div>
        <button
          type="button"
          aria-label={searching ? "Close search" : "Search interactions"}
          onClick={onToggleSearch}
          className="flex items-center justify-center flex-shrink-0 active:opacity-70 transition-opacity"
          style={{
            width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-secondary)",
            color: "var(--md-sys-color-text-primary)",
          }}
        >
          <Icon name={searching ? "close" : "search"} size={20} />
        </button>
      </div>

      {!searching && (
        <>
          <nav className="flex flex-col flex-shrink-0" style={{ padding: "var(--spacing-3) var(--spacing-5) var(--spacing-5)", gap: "var(--spacing-1)" }}>
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onNavigate?.(n.id)}
                className="flex items-center text-left active:opacity-60 transition-opacity"
                style={{ gap: "var(--spacing-3)", minHeight: 44, color: "var(--md-sys-color-text-primary)" }}
              >
                <Icon name={n.icon} size={22} style={{ color: "var(--md-sys-color-text-primary)" }} />
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600 }}>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex-shrink-0" style={{ padding: "0 var(--spacing-5) var(--spacing-2)" }}>
            <p style={{ fontSize: 16, color: "var(--md-sys-color-text-muted)", paddingBottom: "var(--spacing-2)", borderBottom: "1px solid var(--md-sys-color-alpha-white-10)" }}>Interactions</p>
          </div>
        </>
      )}

      <div ref={scrollRef} className="flex-1 min-h-0" style={{ overflowY: "auto" }}>
        {items.map((r, i) => (
          <ActivityCard
            key={r.id}
            recent={r}
            variant={isUnread(r) ? "recent-unread" : "recent"}
            isLast={i === items.length - 1 && !loading}
            href={linkFor(r)}
            onPress={() => onOpen?.(r)}
          />
        ))}
        {empty && (
          <p style={{ padding: "var(--spacing-8) var(--spacing-5)", fontSize: 15, color: "var(--md-sys-color-text-muted)", textAlign: "center" }}>No engagements match.</p>
        )}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && (
          <div className="flex justify-center" style={{ padding: "var(--spacing-5) 0 var(--spacing-8)", color: "var(--md-sys-color-text-muted)" }}>
            <ThinkingDots size="md" label="Loading more" />
          </div>
        )}
        <div style={{ height: "var(--spacing-8)" }} />
      </div>
    </div>
  );
}

export default function EngagementsDrawer({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate?: (to: EngagementsDestination) => void }) {
  const root = useOverlayRoot();
  const { isEngagementRead, markEngagementRead } = useAccountState();
  const [count, setCount] = useState(FIRST_PAGE);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const scrollEl = useRef<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? mockRecentActivities.filter((r) => r.accountName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)) : mockRecentActivities),
    [q],
  );
  const shown = q ? filtered : filtered.slice(0, count);
  const hasMore = !q && count < filtered.length;

  // Lazy load: when the end-of-list sentinel scrolls into view, bring in the next page after a short beat.
  useEffect(() => {
    if (!sentinel || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loading) return;
        setLoading(true);
        timer.current = setTimeout(() => { setCount((c) => c + PAGE); setLoading(false); }, LOAD_DELAY);
      },
      { root: scrollEl.current, rootMargin: "0px 0px 120px 0px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [sentinel, hasMore, loading, count]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!root) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto", zIndex: 200 }}>
          <DrawerBackdrop onClick={onClose} />
          <motion.div
            className="absolute top-0 left-0 bottom-0"
            style={{ width: "86%", background: "var(--md-sys-color-dark-primary)", borderRight: "1px solid var(--md-sys-color-dark-tertiary)" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0, 0.18, 1] }}
          >
            <EngagementsPanel
              items={shown}
              loading={loading && hasMore}
              searching={searching}
              query={query}
              onQuery={setQuery}
              onToggleSearch={() => { setSearching((s) => !s); setQuery(""); }}
              onNavigate={(to) => { onClose(); onNavigate?.(to); }}
              isUnread={(r) => !!r.unread && !isEngagementRead(r.id)}
              onOpen={(r) => { markEngagementRead(r.id); onClose(); }}
              sentinelRef={setSentinel}
              scrollRef={scrollEl}
              empty={q.length > 0 && filtered.length === 0}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    root,
  );
}
