"use client";

/**
 * FLUTTER HANDOFF: UnrecognizedTypeQuestionScreen
 * Route: /import/question?index=N
 * Shown once per activity type Halosight can't place.
 * Widget: StatefulWidget
 * State: currentIndex — driven by query param
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-primary,
 *         --md-sys-color-alpha-white-10, --md-sys-color-text-primary, --md-sys-color-text-secondary,
 *         --md-sys-color-text-muted, --md-sys-color-text-disabled, --md-sys-color-neonindigo,
 *         --md-sys-color-brand-teal, --md-sys-color-warning, --radius-md, --radius-full
 * Flutter equivalent: unrecognized_type_question_page.dart
 */

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useSalesforce, type ActivityDestination } from "@/lib/context/SalesforceContext";
import { mockAnalysis } from "@/lib/mock-data/salesforce";

const SAMPLE_RECORDS: Record<string, { subject: string; account: string; date: string }[]> = {
  "Site Audit": [
    { subject: "Annual safety audit — east lot", account: "Jack's Tire & Oil", date: "Aug 12" },
    { subject: "Pre-inspection walkaround", account: "Midtown Chevrolet", date: "Jul 28" },
  ],
  "Route Check": [
    { subject: "Route 9 corridor visit", account: "Route 9 Motors", date: "Aug 5" },
  ],
};

const OPTIONS: { value: ActivityDestination; icon: string; color: string; label: string; hint: string }[] = [
  { value: "note", icon: "sticky_note_2", color: "var(--md-sys-color-neonindigo)", label: "Account note", hint: "Reads as history on the account" },
  { value: "task", icon: "checklist", color: "var(--md-sys-color-brand-teal)", label: "Action item", hint: "Shows up in your action items" },
  { value: "skip", icon: "block", color: "var(--md-sys-color-text-disabled)", label: "Don't import", hint: "Leave these in Salesforce" },
];

function QuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { analysis, setReviewAnswer } = useSalesforce();
  const data = analysis ?? mockAnalysis;

  const unresolved = data.activityTypes.filter((t) => !t.confident);
  const indexParam = Number(searchParams.get("index") ?? "0");
  const currentIndex = Math.min(indexParam, unresolved.length - 1);
  const type = unresolved[currentIndex];

  if (!type) {
    router.replace("/import/review");
    return null;
  }

  const samples = SAMPLE_RECORDS[type.name] ?? [];

  function handleAnswer(dest: ActivityDestination) {
    setReviewAnswer(type.name, dest);
    if (currentIndex < unresolved.length - 1) {
      router.replace(`/import/question?index=${currentIndex + 1}`);
    } else {
      router.replace("/import/review");
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-10 pb-5">
        <button onClick={() => router.back()} className="p-1 active:opacity-60 transition-opacity">
          <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <span style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
          {currentIndex + 1} of {unresolved.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">

        {/* Eyebrow */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--md-sys-color-warning)", marginBottom: 10 }}>
          Not sure about this one
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 27, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)", lineHeight: 1.2, marginBottom: 10 }}>
          Where should "{type.name}" go?
        </h1>

        {/* Body */}
        <p style={{ fontSize: 14.5, color: "var(--md-sys-color-text-primary)", lineHeight: 1.55, marginBottom: 20 }}>
          {type.count} {type.count === 1 ? "activity uses" : "activities use"} this. Not a standard Salesforce type, so we'd rather ask than guess.
        </p>

        {/* Sample card */}
        {samples.length > 0 && (
          <div
            style={{
              background: "var(--md-sys-color-dark-primary)",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--md-sys-color-text-muted)", marginBottom: 10 }}>
              From your Salesforce
            </div>
            {samples.map((s, i) => (
              <div key={i} style={{ marginBottom: i < samples.length - 1 ? 12 : 0 }}>
                <div style={{ fontSize: 14.5, color: "var(--md-sys-color-text-primary)", marginBottom: 2 }}>
                  {s.subject}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--md-sys-color-text-muted)" }}>
                  {s.account} · {s.date}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Option cards */}
        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="flex items-start gap-4 px-4 py-4 active:opacity-70 transition-opacity"
              style={{
                background: "var(--md-sys-color-dark-secondary)",
                border: "1px solid var(--md-sys-color-alpha-white-10)",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
              }}
            >
              <Icon name={opt.icon} size={22} style={{ color: opt.color, flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 3 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                  {opt.hint}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: "var(--md-sys-color-text-muted)", textAlign: "center", marginTop: 20, lineHeight: 1.55 }}>
          We'll remember this for next time. You can change it in Data &amp; Connections.
        </p>
      </div>
    </div>
  );
}

export default function ImportQuestionPage() {
  return (
    <Suspense>
      <QuestionContent />
    </Suspense>
  );
}
