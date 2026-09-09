"use client";

/**
 * FLUTTER HANDOFF: LogVisitSheet
 * Widget: StatefulWidget
 * State: selectedId, query
 * Tokens: --md-sys-color-dark-primary, --md-sys-color-dark-secondary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-brand-coral,
 *         --md-sys-color-neonindigo, --md-sys-color-text-*, --radius-sm, --radius-xl, --radius-full
 * Slides up from bottom. Shows nearby accounts sorted by distance.
 * Selecting an account and tapping Start recording calls startCapture().
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useCapture } from "@/lib/context/CaptureContext";
import { mockAccounts } from "@/lib/mock-data/accounts";
import Icon from "@/components/ui/Icon";

interface Props {
  onClose: () => void;
}

const nearbyAccounts = [...mockAccounts]
  .sort((a, b) => a.distanceMiles - b.distanceMiles)
  .slice(0, 3);

export default function LogVisitSheet({ onClose }: Props) {
  const { startCapture } = useCapture();
  const [selectedId, setSelectedId] = useState<string | null>(nearbyAccounts[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  const q = query.toLowerCase().trim();
  const isSearching = q.length > 0;

  const displayAccounts = isSearching
    ? [...mockAccounts]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.city?.toLowerCase().includes(q) ||
            a.state?.toLowerCase().includes(q)
        )
    : nearbyAccounts;

  function handleStartRecording() {
    const account = mockAccounts.find((a) => a.id === selectedId);
    if (!account) return;
    startCapture(account.id, account.name, true);
    onClose();
  }

  function handleNoCompany() {
    startCapture("no-account", "");
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)", zIndex: 60 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col"
        style={{
          bottom: "var(--keyboard-inset, 0px)",
          zIndex: 61,
          background: "var(--md-sys-color-dark-primary)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "78%",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 rounded-full"
            style={{ height: 4, background: "var(--md-sys-color-dark-tertiary)" }}
          />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 flex-shrink-0">
          <h2 className="heading-5" style={{ color: "var(--md-sys-color-text-primary)" }}>
            Log a visit
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--md-sys-color-text-muted)" }}>
            Pick the company you&rsquo;re meeting with.
          </p>
        </div>

        {/* Search */}
        <div className="px-5 mb-4 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: 44,
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${isSearching ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-alpha-white-10)"}`,
              transition: "border-color 0.15s ease",
            }}
          >
            <Icon
              name="search"
              size={16}
              style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search all companies"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--md-sys-color-text-primary)" }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="active:opacity-60 flex-shrink-0"
              >
                <Icon
                  name="cancel"
                  fill
                  size={15}
                  style={{ color: "var(--md-sys-color-text-disabled)" }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Section label */}
        <div className="px-5 mb-2 flex-shrink-0">
          {!isSearching ? (
            <div className="flex items-center gap-1.5">
              <Icon
                name="near_me"
                size={13}
                style={{ color: "var(--md-sys-color-brand-coral)" }}
              />
              <span
                style={{
                  color: "var(--md-sys-color-brand-coral)",
                  fontSize: 11,
                  fontFamily: "var(--font-sans, Barlow, system-ui, sans-serif)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                NEAR YOU
              </span>
            </div>
          ) : (
            <span
              style={{
                color: "var(--md-sys-color-text-muted)",
                fontSize: 11,
                fontFamily: "var(--font-sans, Barlow, system-ui, sans-serif)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              RESULTS
            </span>
          )}
        </div>

        {/* Account list */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {isSearching && displayAccounts.length === 0 ? (
            <div className="flex flex-col items-center pt-8 gap-2">
              <Icon
                name="search_off"
                size={36}
                style={{ color: "var(--md-sys-color-text-disabled)" }}
              />
              <p
                className="text-sm font-semibold text-center"
                style={{ color: "var(--md-sys-color-text-primary)" }}
              >
                No companies match &ldquo;{query}&rdquo;
              </p>
              <p
                className="text-xs text-center"
                style={{ color: "var(--md-sys-color-text-muted)" }}
              >
                Check the spelling, or create it as a lead now
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayAccounts.map((account) => {
                const isSelected = account.id === selectedId;
                return (
                  <button
                    key={account.id}
                    onClick={() => setSelectedId(account.id)}
                    className="w-full text-left active:opacity-80 transition-opacity"
                    style={{
                      background: "var(--md-sys-color-dark-secondary)",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${isSelected ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-alpha-white-10)"}`,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--md-sys-color-text-primary)" }}
                      >
                        {account.name}
                      </p>
                      <div
                        className="flex items-center flex-wrap mt-0.5"
                        style={{ gap: "4px 6px" }}
                      >
                        {!isSearching && (
                          <span
                            className="text-xs"
                            style={{ color: "var(--md-sys-color-text-muted)" }}
                          >
                            {account.distanceMiles < 1
                              ? `${account.distanceMiles.toFixed(2)} mi`
                              : `${account.distanceMiles.toFixed(1)} mi`}
                          </span>
                        )}
                        {(account.city || account.state) && (
                          <>
                            {!isSearching && (
                              <span
                                className="text-xs"
                                style={{ color: "var(--md-sys-color-dark-tertiary)" }}
                              >
                                ·
                              </span>
                            )}
                            <span
                              className="text-xs"
                              style={{ color: "var(--md-sys-color-text-muted)" }}
                            >
                              {[account.city, account.state].filter(Boolean).join(", ")}
                            </span>
                          </>
                        )}
                        {(account.taskCount ?? 0) > 0 && (
                          <>
                            <span
                              className="text-xs"
                              style={{ color: "var(--md-sys-color-dark-tertiary)" }}
                            >
                              ·
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{ color: "var(--md-sys-color-brand-coral)" }}
                            >
                              {account.taskCount} open task
                              {account.taskCount !== 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-dark-tertiary)"}`,
                        background: isSelected
                          ? "var(--md-sys-color-brand-coral)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "border-color 0.15s ease, background 0.15s ease",
                      }}
                    >
                      {isSelected && (
                        <Icon name="check" size={13} style={{ color: "white" }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pt-4 pb-4">
          <button
            onClick={handleStartRecording}
            disabled={!selectedId}
            className="w-full flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
            style={{
              height: 52,
              background: selectedId
                ? "var(--md-sys-color-brand-coral)"
                : "var(--md-sys-color-dark-tertiary)",
              borderRadius: "var(--radius-xl)",
              transition: "background 0.15s ease",
            }}
          >
            <Icon name="mic" size={20} style={{ color: "white" }} />
            <span
              className="text-base-bold"
              style={{ color: "white" }}
            >
              Start recording
            </span>
          </button>

          <button
            onClick={handleNoCompany}
            className="w-full mt-3 py-1 active:opacity-60 transition-opacity"
          >
            <span className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Or log without a company
            </span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
