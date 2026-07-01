"use client";

/**
 * FLUTTER HANDOFF: DecisionWidget
 * Widget: StatefulWidget
 * Tokens: --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary, --md-sys-color-warning,
 *         --md-sys-color-success, --md-sys-color-neonindigo, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-background, --radius-sm, --radius-full
 * Notes: Supabase-backed shared decision recorder. Used on story walkthrough pages.
 *        Real-time sync between sessions via Supabase Realtime.
 */

import { useState, useEffect, useRef } from "react";
import { getSupabase } from "@/lib/supabase/client";

interface Props {
  storyId: string;
  decisionKey: string;
  options: string[];
}

const BY_OPTIONS = ["Nate", "Ashleigh", "Both"];

export default function DecisionWidget({ storyId, decisionKey, options }: Props) {
  const [chosen, setChosen]       = useState<string | null>(null);
  const [note, setNote]           = useState("");
  const [decidedBy, setDecidedBy] = useState("Nate");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [loaded, setLoaded]       = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoaded(true); return; }
    sb
      .from("decisions")
      .select("chosen_option, note, decided_by")
      .eq("story_id", storyId)
      .eq("decision_key", decisionKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setChosen(data.chosen_option ?? null);
          setNote(data.note ?? "");
          setDecidedBy(data.decided_by ?? "Nate");
        }
        setLoaded(true);
      });
  }, [storyId, decisionKey]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const channel = sb
      .channel(`${storyId}-${decisionKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "decisions" },
        ({ new: d }) => {
          const row = d as { story_id: string; decision_key: string; chosen_option: string | null; note: string; decided_by: string };
          if (row.story_id === storyId && row.decision_key === decisionKey) {
            setChosen(row.chosen_option);
            setNote(row.note ?? "");
            setDecidedBy(row.decided_by ?? "Nate");
          }
        }
      )
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [storyId, decisionKey]);

  async function save(c: string | null, n: string, by: string) {
    const sb = getSupabase();
    if (!sb) return;
    setSaveStatus("saving");
    await sb.from("decisions").upsert(
      { story_id: storyId, decision_key: decisionKey, chosen_option: c, note: n, decided_by: by, updated_at: new Date().toISOString() },
      { onConflict: "story_id,decision_key" }
    );
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  function handleOption(opt: string) {
    const next = chosen === opt ? null : opt;
    setChosen(next);
    save(next, note, decidedBy);
  }

  function handleBy(by: string) {
    setDecidedBy(by);
    if (chosen !== null) save(chosen, note, by);
  }

  function handleNote(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNote(e.target.value);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => save(chosen, e.target.value, decidedBy), 800);
  }

  if (!loaded) return null;

  const decided = chosen !== null;

  return (
    <div style={{
      marginTop: 10,
      padding: "10px 14px",
      background: decided ? "rgba(245,166,35,0.05)" : "var(--md-sys-color-dark-secondary)",
      border: `1px solid ${decided ? "rgba(245,166,35,0.28)" : "var(--md-sys-color-dark-tertiary)"}`,
      borderRadius: "var(--radius-sm)",
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: decided ? "var(--md-sys-color-warning)" : "var(--md-sys-color-text-disabled)",
          flexShrink: 0, marginRight: 2,
        }}>
          {decided ? "✓ Decided" : "Decide:"}
        </span>

        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleOption(opt)}
            style={{
              padding: "3px 11px", borderRadius: "var(--radius-full)", fontSize: 12,
              fontWeight: chosen === opt ? 700 : 400,
              background: chosen === opt ? "rgba(245,166,35,0.14)" : "transparent",
              color: chosen === opt ? "var(--md-sys-color-warning)" : "var(--md-sys-color-text-muted)",
              border: `1px solid ${chosen === opt ? "rgba(245,166,35,0.4)" : "var(--md-sys-color-dark-tertiary)"}`,
              cursor: "pointer", transition: "all 0.1s",
            }}
          >
            {chosen === opt ? "✓ " : ""}{opt}
          </button>
        ))}

        {decided && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {BY_OPTIONS.map(name => (
              <button
                key={name}
                onClick={() => handleBy(name)}
                style={{
                  padding: "2px 9px", borderRadius: "var(--radius-full)", fontSize: 11,
                  fontWeight: decidedBy === name ? 600 : 400,
                  background: decidedBy === name ? "rgba(139,146,255,0.12)" : "transparent",
                  color: decidedBy === name ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-muted)",
                  border: `1px solid ${decidedBy === name ? "rgba(139,146,255,0.3)" : "transparent"}`,
                  cursor: "pointer",
                }}
              >
                {name}
              </button>
            ))}
            <span style={{
              fontSize: 11, minWidth: 52, textAlign: "right",
              color: saveStatus === "saving" ? "var(--md-sys-color-warning)" : saveStatus === "saved" ? "var(--md-sys-color-success)" : "transparent",
            }}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : "."}
            </span>
          </div>
        )}
      </div>

      {decided && (
        <textarea
          value={note}
          onChange={handleNote}
          placeholder="Add reasoning or notes… (auto-saves)"
          style={{
            display: "block", width: "100%", boxSizing: "border-box", marginTop: 8,
            background: "var(--md-sys-color-background)",
            border: "1px solid var(--md-sys-color-dark-tertiary)",
            borderRadius: "var(--radius-sm)",
            padding: "7px 10px",
            fontSize: 12, color: "var(--md-sys-color-text-secondary)",
            lineHeight: 1.55, resize: "vertical", minHeight: 52,
            fontFamily: "inherit", outline: "none",
          }}
        />
      )}
    </div>
  );
}
