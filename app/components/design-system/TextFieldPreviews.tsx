"use client";

/**
 * Design-system previews for TextField. Prototype-only: every field here is live, so you can type in it and watch default,
 * active and filled happen. The forced states (active, error, warning, disabled) are shown next to them with props.
 */

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import TextField from "@/components/ui/TextField";

const col = { padding: 16, gap: 16 } as const;

/** The three everyday states, live, plus the forced ones. */
export function StatesPreview() {
  const [a, setA] = useState("");
  const [b, setB] = useState("Saddleback Fleet Services");
  const [c, setC] = useState("Saddleback Fleet");
  const [d, setD] = useState("Saddleback");
  const [e, setE] = useState("");
  return (
    <div className="flex flex-col" style={col}>
      <TextField label="Default (empty). Tap to type" placeholder="e.g. Saddleback Fleet Services" value={a} onChange={setA} />
      <TextField label="Active (shown without focus)" active value={b} onChange={setB} />
      <TextField label="Filled" value={c} onChange={setC} />
      <TextField label="Warning" status="warning" helper="Possible duplicate: Saddleback Fleet Svcs" value={d} onChange={setD} />
      <TextField label="Error" status="error" helper="Add a company name to continue" placeholder="Company" value={e} onChange={setE} />
      <TextField label="Disabled" disabled value="Synced from Salesforce" onChange={() => {}} />
    </div>
  );
}

export function SizesPreview() {
  const [v, setV] = useState("");
  return (
    <div className="flex flex-col" style={col}>
      <TextField size="sm" placeholder="Small, 36" value={v} onChange={setV} />
      <TextField size="md" placeholder="Medium, 44" value={v} onChange={setV} />
      <TextField size="lg" placeholder="Large, 48 (default)" value={v} onChange={setV} />
      <TextField size="xl" placeholder="Extra large, 56 (chat composer)" value={v} onChange={setV} />
    </div>
  );
}

export function MultilinePreview() {
  const [v, setV] = useState("Wants a quote on the 40-count pallet jacks by Friday.");
  return (
    <div className="flex flex-col" style={col}>
      <TextField label="Description" multiline rows={4} maxLength={280} showCount value={v} onChange={setV} />
    </div>
  );
}

export function SlotsPreview() {
  const [a, setA] = useState("Acme");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  return (
    <div className="flex flex-col" style={col}>
      <TextField size="md" value={a} onChange={setA} placeholder="Search" leading={<Icon name="search" size={18} style={{ color: "inherit" }} />} clearable />
      <TextField
        size="md" value={b} onChange={setB} placeholder="With a trailing tag"
        trailing={<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: "var(--md-sys-color-neonindigo)", background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 12%, transparent)", borderRadius: "var(--radius-xs)", padding: "2px 6px" }}>ALL</span>}
      />
      <TextField
        size="xl" value={c} onChange={setC} placeholder="Ask about this account"
        actions={
          <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-neonindigo-dark)", color: "var(--md-sys-color-text-primary)" }}>
            <Icon name="graphic_eq" size={22} />
          </span>
        }
      />
    </div>
  );
}

export function BarePreview() {
  const [v, setV] = useState("Dana Whitfield");
  return (
    <div className="flex items-center" style={{ padding: 16, gap: 12 }}>
      <div className="flex-1" style={{ background: "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3) var(--spacing-4)" }}>
        <TextField variant="bare" ariaLabel="Participant name" value={v} onChange={setV} inputStyle={{ fontSize: 15, fontWeight: 600 }} />
      </div>
    </div>
  );
}
