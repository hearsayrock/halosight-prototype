/**
 * Design-system page layout helpers — NOT part of the mobile app UX.
 * Browser-only reference scaffolding, so no Flutter equivalent.
 *
 * Gives a component its own "area" on /design-system:
 *   <ComponentArea>      header (name, kind, source files, one-line anatomy)
 *     <VariantCard>      one per variant — live preview + the prop that selects it
 *     <SubComponentCard> atoms the component is built from, nested under it
 *
 * Tokens: color.dark.secondary/tertiary, color.text.*, color.neonindigo.base, color.semantic.warning, radius.md/lg/full
 */

import type { ReactNode } from "react";

type Kind = "Library" | "Feature" | "Furniture";

const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--md-sys-color-text-disabled)",
};

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "pending" }) {
  const colors = {
    neutral: { bg: "var(--md-sys-color-dark-tertiary)", fg: "var(--md-sys-color-text-muted)" },
    accent:  { bg: "color-mix(in srgb, var(--md-sys-color-neonindigo) 20%, transparent)", fg: "var(--md-sys-color-neonindigo-light)" },
    pending: { bg: "color-mix(in srgb, var(--md-sys-color-warning) 18%, transparent)", fg: "var(--md-sys-color-warning)" },
  }[tone];
  return (
    <span
      className="whitespace-nowrap"
      style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: "var(--radius-full)", background: colors.bg, color: colors.fg }}
    >
      {children}
    </span>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono" style={{ fontSize: 12, color: "var(--md-sys-color-neonindigo-light)" }}>
      {children}
    </code>
  );
}

// ── Area ─────────────────────────────────────────────────────────────────────

export function ComponentArea({
  id, name, kind, description, source, flutter, anatomy, children,
}: {
  id: string;
  name: string;
  kind: Kind;
  description: string;
  /** e.g. "components/accounts/AccountListItem.tsx" */
  source: string;
  /** e.g. "accounts_view_account_list_item.dart" */
  flutter: string;
  /** Plain-language parts list, e.g. "name · meta · badges" */
  anatomy?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-16" style={{ scrollMarginTop: 16 }}>
      <div className="mb-8 pt-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--md-sys-color-text-primary)" }}>{name}</h2>
          <Chip tone="accent">{kind}</Chip>
        </div>
        <p className="mt-1 text-sm max-w-2xl" style={{ color: "var(--md-sys-color-text-muted)" }}>{description}</p>
        <div className="mt-3 flex flex-col gap-0.5">
          <p style={{ fontSize: 12, color: "var(--md-sys-color-text-disabled)" }}>
            <span style={{ ...label, marginRight: 8 }}>Source</span><Code>{source}</Code>
          </p>
          <p style={{ fontSize: 12, color: "var(--md-sys-color-text-disabled)" }}>
            <span style={{ ...label, marginRight: 8 }}>Flutter</span><Code>{flutter}</Code>
          </p>
          {anatomy && (
            <p style={{ fontSize: 12, color: "var(--md-sys-color-text-disabled)" }}>
              <span style={{ ...label, marginRight: 8 }}>Anatomy</span>
              <span style={{ color: "var(--md-sys-color-text-muted)" }}>{anatomy}</span>
            </p>
          )}
        </div>
        <div className="mt-3 h-px" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
      </div>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}

/** Group heading inside an area: "Variants (3)" / "Sub-components (1)" */
export function AreaGroup({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>{title}</h3>
        <span style={{ fontSize: 13, color: "var(--md-sys-color-text-disabled)" }}>{count}</span>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ── Variant ──────────────────────────────────────────────────────────────────

export function VariantCard({
  name, prop, status = "variant", description, notes, children,
}: {
  name: string;
  /** The prop value that selects it, e.g. variant="crm" */
  prop: string;
  status?: "default" | "variant" | "placeholder";
  description: string;
  notes?: string[];
  /** Live preview. Omit for a placeholder. */
  children?: ReactNode;
}) {
  const placeholder = status === "placeholder";
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "minmax(0, 390px) minmax(0, 1fr)",
        padding: 16,
        borderRadius: "var(--radius-lg)",
        border: `1px ${placeholder ? "dashed" : "solid"} var(--md-sys-color-dark-tertiary)`,
      }}
    >
      {/* Preview — phone-width so the row renders at its real size */}
      <div
        style={{
          borderRadius: "var(--radius-md)",
          background: "var(--md-sys-color-dark-base)",
          border: "1px solid var(--md-sys-color-dark-tertiary)",
          overflow: "hidden",
          minHeight: 96,
        }}
      >
        {placeholder ? (
          <div className="h-full flex items-center justify-center text-center" style={{ minHeight: 96, padding: 16, fontSize: 13, color: "var(--md-sys-color-text-disabled)" }}>
            Design pending — preview goes here
          </div>
        ) : (
          children
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>{name}</h4>
          {status === "default" && <Chip tone="accent">Default</Chip>}
          {placeholder && <Chip tone="pending">Placeholder</Chip>}
        </div>
        <p className="mt-1"><Code>{prop}</Code></p>
        <p className="mt-2 text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>{description}</p>
        {notes && notes.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {notes.map((n) => (
              <li key={n} className="text-sm flex gap-2" style={{ color: "var(--md-sys-color-text-secondary)" }}>
                <span style={{ color: "var(--md-sys-color-text-disabled)" }}>–</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Sub-component (atom) ─────────────────────────────────────────────────────

export function SubComponentCard({
  name, source, usedBy, description, notes, children,
}: {
  name: string;
  source: string;
  /** Components that render it */
  usedBy: string[];
  description: string;
  notes?: string[];
  /** States, laid out in a row */
  children: ReactNode;
}) {
  return (
    <div style={{ marginLeft: 12, paddingLeft: 20, borderLeft: "2px solid var(--md-sys-color-dark-tertiary)" }}>
    <div
      style={{
        padding: 16,
        borderRadius: "var(--radius-lg)",
        background: "var(--md-sys-color-dark-secondary)",
        border: "1px solid var(--md-sys-color-dark-tertiary)",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>{name}</h4>
        <Chip>Sub-component</Chip>
      </div>
      <p className="mt-1"><Code>{source}</Code></p>
      <p className="mt-2 text-sm max-w-2xl" style={{ color: "var(--md-sys-color-text-muted)" }}>{description}</p>

      <div
        className="mt-4 flex items-center gap-6 flex-wrap"
        style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--md-sys-color-dark-base)" }}
      >
        {children}
      </div>

      {notes && notes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {notes.map((n) => (
            <li key={n} className="text-sm flex gap-2" style={{ color: "var(--md-sys-color-text-secondary)" }}>
              <span style={{ color: "var(--md-sys-color-text-disabled)" }}>–</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3" style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)" }}>
        <span style={{ ...label, marginRight: 8 }}>Used by</span>
        {usedBy.join(" · ")}
      </p>
    </div>
    </div>
  );
}

/** One captioned state inside a SubComponentCard */
export function StateSample({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div style={{ minHeight: 22.5 }} className="flex items-center">{children}</div>
      <span style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)" }}>{caption}</span>
    </div>
  );
}
