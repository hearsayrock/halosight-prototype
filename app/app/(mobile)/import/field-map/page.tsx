"use client";

/**
 * FLUTTER HANDOFF: FieldMapScreen
 * Route: /import/field-map
 * Two-step flow shown after /import/review when the system detects that
 * Salesforce activities need field-level disambiguation (notes vs. tasks
 * live in the same object and need a field value to tell them apart).
 *
 * Step 1: Pick the field that distinguishes note-like activity from task-like activity.
 * Step 2: Assign each value on that field to Note, Task, or Skip.
 *
 * Widget: StatefulWidget
 * State: step, selectedField, assignments
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary,
 *         --md-sys-color-dark-secondary, --md-sys-color-dark-base,
 *         --md-sys-color-dark-tertiary, --md-sys-color-alpha-white-10,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary,
 *         --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --radius-full, --radius-md
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import SegmentedControl from "@/components/ui/SegmentedControl";

type Assignment = "skip" | "note" | "task";

interface Field {
  label: string;
  apiName: string;
  values: { label: string; default: Assignment }[];
}

const FIELDS: Field[] = [
  {
    label: "Type",
    apiName: "Type",
    values: [
      { label: "Call",    default: "note" },
      { label: "Email",   default: "note" },
      { label: "Meeting", default: "note" },
      { label: "Other",   default: "skip" },
    ],
  },
  {
    label: "Task Subtype",
    apiName: "TaskSubtype",
    values: [
      { label: "Call",            default: "note" },
      { label: "Email",           default: "note" },
      { label: "List Email",      default: "skip" },
      { label: "Cadence",         default: "task" },
      { label: "LinkedIn InMail", default: "skip" },
      { label: "Other",           default: "skip" },
    ],
  },
  {
    label: "Call Type",
    apiName: "CallType",
    values: [
      { label: "Inbound",  default: "note" },
      { label: "Internal", default: "skip" },
      { label: "Outbound", default: "note" },
    ],
  },
  {
    label: "Priority",
    apiName: "Priority",
    values: [
      { label: "High",   default: "task" },
      { label: "Normal", default: "note" },
      { label: "Low",    default: "skip" },
    ],
  },
  {
    label: "Status",
    apiName: "Status",
    values: [
      { label: "Not Started",           default: "task" },
      { label: "In Progress",           default: "task" },
      { label: "Completed",             default: "note" },
      { label: "Waiting on someone else", default: "task" },
      { label: "Deferred",              default: "skip" },
    ],
  },
];

const SEG_OPTIONS: { value: Assignment; label: string }[] = [
  { value: "skip", label: "Skip" },
  { value: "note", label: "Note" },
  { value: "task", label: "Task" },
];

const DEST_COLOR: Record<Assignment, string> = {
  skip: "var(--md-sys-color-text-disabled)",
  note: "var(--md-sys-color-neonindigo)",
  task: "var(--md-sys-color-brand-teal)",
};

const AI_FIELD = FIELDS[0]; // "Type" — the AI's confident pick
const AI_DEFAULTS: Record<string, Assignment> = {};
AI_FIELD.values.forEach((v) => { AI_DEFAULTS[v.label] = v.default; });

export default function FieldMapPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});

  function selectField(field: Field) {
    const defaults: Record<string, Assignment> = {};
    field.values.forEach((v) => { defaults[v.label] = v.default; });
    setAssignments(defaults);
    setSelectedField(field);
    setStep(2);
  }

  function setAssignment(valueLabel: string, dest: Assignment) {
    setAssignments((prev) => ({ ...prev, [valueLabel]: dest }));
  }

  const hasAnyMapped = Object.values(assignments).some((a) => a !== "skip");

  const noteCount = Object.values(assignments).filter((a) => a === "note").length;
  const taskCount = Object.values(assignments).filter((a) => a === "task").length;

  function enterManual() {
    setMode("manual");
    setStep(1);
    setSelectedField(null);
    setAssignments({});
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ flexShrink: 0 }}>
        <button
          onClick={() => {
            if (mode === "ai") router.back();
            else if (step === 2) setStep(1);
            else { setMode("ai"); }
          }}
          className="p-1 active:opacity-60 transition-opacity"
        >
          <Icon
            name={mode === "ai" || step === 1 ? "close" : "arrow_back"}
            size={22}
            style={{ color: "var(--md-sys-color-text-muted)" }}
          />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-secondary)" }}>
          Import from Salesforce
        </span>
        <div style={{ width: 30 }} />
      </div>

      <AnimatePresence mode="wait" initial={false}>

        {/* ── AI confident state ──────────────────────────────────────────────── */}
        {mode === "ai" && (
          <motion.div
            key="ai"
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ paddingTop: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)", lineHeight: 1.25, marginBottom: 10 }}>
                We think we've got this one.
              </h1>
              <p style={{ fontSize: 15, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55, marginBottom: 28 }}>
                Looks like your team uses the <strong style={{ color: "var(--md-sys-color-text-primary)", fontWeight: 600 }}>Type</strong> field to sort activities. We've mapped it out — calls, emails, and meetings come in as notes.
              </p>

              {/* Preview card */}
              <div style={{
                border: "1px solid var(--md-sys-color-alpha-white-10)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                marginBottom: 8,
              }}>
                {/* Field label row */}
                <div style={{
                  padding: "12px 16px",
                  background: "var(--md-sys-color-dark-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <Icon name="filter_center_focus" size={16} style={{ color: "var(--md-sys-color-neonindigo)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--md-sys-color-text-secondary)", letterSpacing: "0.02em" }}>
                    Type field
                  </span>
                </div>

                {/* Value rows */}
                {AI_FIELD.values.map((val, i) => {
                  const dest = AI_DEFAULTS[val.label];
                  return (
                    <div
                      key={val.label}
                      className="flex items-center justify-between"
                      style={{
                        padding: "13px 16px",
                        borderBottom: i < AI_FIELD.values.length - 1 ? "1px solid var(--md-sys-color-alpha-white-10)" : undefined,
                      }}
                    >
                      <span style={{ fontSize: 15, color: "var(--md-sys-color-text-primary)", fontWeight: 500 }}>
                        {val.label}
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: DEST_COLOR[dest],
                      }}>
                        {dest === "skip" ? "Skip" : dest === "note" ? "→ Note" : "→ Task"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Continue CTA */}
              <button
                onClick={() => router.push("/import/importing")}
                className="w-full flex items-center justify-center active:scale-[.97] transition-transform"
                style={{
                  height: 50,
                  borderRadius: "var(--radius-full)",
                  background: "var(--md-sys-color-neonindigo)",
                  color: "var(--md-sys-color-text-primary)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Continue
              </button>

              {/* Escape hatch */}
              <button
                onClick={enterManual}
                className="active:opacity-60 transition-opacity"
                style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", display: "block", width: "100%", textAlign: "center", padding: "6px 0 24px" }}
              >
                Doesn't look right?{" "}
                <span style={{ color: "var(--md-sys-color-neonindigo)", fontWeight: 600 }}>
                  Adjust the mapping
                </span>
              </button>
            </div>
          </motion.div>
        )}


        {/* ── Step 1: Pick a field ─────────────────────────────────────────── */}
        {mode === "manual" && step === 1 && (
          <motion.div
            key="step1"
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5" style={{ flexShrink: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--md-sys-color-neonindigo)", marginBottom: 10 }}>
                Step 1 of 2
              </p>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)", lineHeight: 1.25, marginBottom: 10 }}>
                Help us tell notes from tasks apart
              </h1>
              <p style={{ fontSize: 15, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55 }}>
                Salesforce stores both in the same place. Which field does your team use to mark the difference?
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {/* Field rows */}
              <div
                style={{
                  border: "1px solid var(--md-sys-color-alpha-white-10)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                {FIELDS.map((field, i) => (
                  <button
                    key={field.apiName}
                    onClick={() => selectField(field)}
                    className="w-full flex items-center gap-3 px-4 active:opacity-70 transition-opacity text-left"
                    style={{
                      minHeight: 64,
                      borderBottom: i < FIELDS.length - 1 ? "1px solid var(--md-sys-color-alpha-white-10)" : undefined,
                    }}
                  >
                    <div className="flex-1 min-w-0 py-3">
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 2 }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                        {field.apiName} · {field.values.length} values
                      </div>
                    </div>
                    <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>

              {/* Don't filter option */}
              <button
                onClick={() => router.push("/import/importing")}
                className="w-full flex items-center gap-3 px-4 active:opacity-70 transition-opacity text-left"
                style={{
                  minHeight: 64,
                  border: "1px solid var(--md-sys-color-alpha-white-10)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div className="flex-1 min-w-0 py-3">
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-muted)", marginBottom: 2 }}>
                    Import everything as notes
                  </div>
                  <div style={{ fontSize: 13, color: "var(--md-sys-color-text-disabled)" }}>
                    Skip the split — bring it all in as account notes
                  </div>
                </div>
                <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Assign values ─────────────────────────────────────────── */}
        {mode === "manual" && step === 2 && selectedField && (
          <motion.div
            key="step2"
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5" style={{ flexShrink: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--md-sys-color-neonindigo)", marginBottom: 10 }}>
                Step 2 of 2
              </p>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)", lineHeight: 1.25, marginBottom: 10 }}>
                Where does each {selectedField.label} value go?
              </h1>
              <p style={{ fontSize: 15, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55 }}>
                Anything left as Skip won't be imported.
              </p>
            </div>

            {/* Value list */}
            <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 180 }}>
              <div
                style={{
                  border: "1px solid var(--md-sys-color-alpha-white-10)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                }}
              >
                {selectedField.values.map((val, i) => {
                  const current = assignments[val.label] ?? "skip";
                  return (
                    <div
                      key={val.label}
                      style={{
                        borderBottom: i < selectedField.values.length - 1 ? "1px solid var(--md-sys-color-alpha-white-10)" : undefined,
                        padding: "14px 16px",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                          {val.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: DEST_COLOR[current], textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {current === "skip" ? "Skipped" : current === "note" ? "→ Note" : "→ Task"}
                        </span>
                      </div>
                      <SegmentedControl
                        options={SEG_OPTIONS}
                        value={current}
                        onChange={(v) => setAssignment(val.label, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "12px 16px 28px",
                background: "var(--md-sys-color-background)",
                borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Summary line */}
              {hasAnyMapped && (
                <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", textAlign: "center" }}>
                  {[
                    noteCount > 0 && `${noteCount} value${noteCount > 1 ? "s" : ""} → notes`,
                    taskCount > 0 && `${taskCount} value${taskCount > 1 ? "s" : ""} → tasks`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}

              {/* Change field */}
              <button
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center active:opacity-70 transition-opacity"
                style={{
                  height: 44,
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--md-sys-color-alpha-white-10)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--md-sys-color-neonindigo)",
                  background: "transparent",
                }}
              >
                Change field
              </button>

              {/* Continue */}
              <button
                onClick={() => hasAnyMapped && router.push("/import/importing")}
                className="w-full flex items-center justify-center active:scale-[.97] transition-transform"
                style={{
                  height: 50,
                  borderRadius: "var(--radius-full)",
                  background: hasAnyMapped ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-secondary)",
                  color: hasAnyMapped ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: hasAnyMapped ? "pointer" : "default",
                }}
              >
                {hasAnyMapped ? "Save & import" : "Assign at least one value"}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
