"use client";

/**
 * Design-system previews for AIReviewOverlay: the field cards in each confidence state (live, tap to edit) and the listening header.
 * The overlay itself is driven by CaptureContext, so the cards and the header are shown on their own.
 */

import { useState } from "react";
import { FieldCard, LiveCaption, WaveformBars, SideButton, type CRMField } from "@/components/capture/AIReviewOverlay";

const SAMPLE: CRMField[] = [
  { id: "title", label: "Title", value: "Operations Director", conf: "high" },
  { id: "phone", label: "Phone", value: "Unknown", conf: "uncertain" },
  { id: "leadStatus", label: "Lead status", value: "Prospect", conf: "confirmed" },
  { id: "address", label: "Address", value: "4820 E Grant Rd, Tucson, AZ 85711", conf: "high", multiLine: true },
];

export function FieldCardsPreview() {
  const [fields, setFields] = useState(SAMPLE);
  return (
    <div className="flex flex-col" style={{ padding: 16, gap: 10 }}>
      {fields.map((f) => (
        <FieldCard
          key={f.id}
          field={f}
          onSave={(id, value) => setFields((prev) => prev.map((x) => (x.id === id ? { ...x, value, conf: "confirmed" } : x)))}
        />
      ))}
    </div>
  );
}

export function ListeningHeaderPreview() {
  return (
    <div style={{ padding: 16 }}>
      <WaveformBars />
      <div className="mt-3 mb-3"><LiveCaption text="Phone is 5-2-0… 5-5-5… 0-1-4-7" /></div>
      <p className="text-[11px] font-semibold" style={{ color: "var(--md-sys-color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>After you speak</p>
    </div>
  );
}

export function SideButtonsPreview() {
  return (
    <div className="flex items-start" style={{ padding: 16, gap: 24 }}>
      <SideButton icon="block" label="Use defaults" onPress={() => {}} />
      <SideButton icon="check" label="Save" onPress={() => {}} variant="purple" />
    </div>
  );
}
