/**
 * FLUTTER HANDOFF: Skeleton / shimmer loading states
 * Flutter equivalent: shimmer package (pub.dev/packages/shimmer)
 * Use Shimmer.fromColors wrapping placeholder Container widgets
 * that match the exact dimensions of the real content.
 *
 * Bone       — single shimmer rectangle, composable primitive
 * AccountListSkeleton  — matches AccountListItem × N rows
 * AccountDetailSkeleton — matches AccountDetailPage header + content
 */

// ── Primitive ─────────────────────────────────────────────────────────────────

interface BoneProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}

export function Bone({ width = "100%", height = 14, radius = 6, style }: BoneProps) {
  return (
    <div
      className="skeleton-bone"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

// ── AccountListItem skeleton row ──────────────────────────────────────────────

function AccountListItemSkeleton({ isLast = false }: { isLast?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 relative">
      {!isLast && (
        <div
          className="absolute bottom-0 left-3 right-3"
          style={{ height: 1, background: "var(--md-sys-color-dark-tertiary)" }}
        />
      )}

      {/* Left — 3-line text stack */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <Bone width="62%" height={16} />
        <Bone width="44%" height={13} />
        <Bone width="32%" height={13} />
      </div>

      {/* Right — badge + task/assignee row */}
      <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0" style={{ minHeight: 60 }}>
        <Bone width={68} height={20} radius={20} />
        <div className="flex items-center gap-1.5">
          <Bone width={32} height={20} radius={20} />
          <Bone width={22} height={22} radius={11} />
        </div>
      </div>
    </div>
  );
}

export function AccountListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <AccountListItemSkeleton key={i} isLast={i === rows - 1} />
      ))}
    </div>
  );
}

// ── AccountDetail skeleton ────────────────────────────────────────────────────

export function AccountDetailSkeleton() {
  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="pt-10 px-4 pb-4">
        {/* Close button placeholder */}
        <div className="mb-3">
          <Bone width={22} height={22} radius={4} />
        </div>

        {/* Account name — centered, wide */}
        <div className="flex justify-center mb-4">
          <Bone width="58%" height={28} radius={8} />
        </div>

        {/* Tab selector */}
        <div className="flex mx-auto gap-2" style={{ width: 255 }}>
          <Bone width="50%" height={36} radius={20} />
          <Bone width="50%" height={36} radius={20} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-hidden">

        {/* Section 1 — Last Time */}
        <div className="mb-6">
          <Bone width={80} height={14} style={{ marginBottom: 12 }} />
          <div className="flex flex-col gap-2">
            <Bone width="100%" height={13} />
            <Bone width="90%" height={13} />
            <Bone width="70%" height={13} />
          </div>
        </div>

        {/* Section 2 — Ideas */}
        <div className="mb-6">
          <Bone width={130} height={14} style={{ marginBottom: 12 }} />
          <div className="flex flex-col gap-3">
            {[82, 95, 76].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Bone width={6} height={6} radius={3} style={{ flexShrink: 0 }} />
                <Bone width={`${w}%`} height={13} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Action Items */}
        <div>
          <Bone width={100} height={14} style={{ marginBottom: 12 }} />
          <div className="flex flex-col gap-2">
            {[1, 2].map(i => (
              <Bone key={i} width="100%" height={56} radius={12} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
