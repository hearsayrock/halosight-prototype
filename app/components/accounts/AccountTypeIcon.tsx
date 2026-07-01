/**
 * FLUTTER HANDOFF: AccountTypeIcon
 * Widget: StatelessWidget
 * Props: type (AccountType: corporate | branch | standalone)
 * Size: 18×18
 * corporate: layered diamond/chain icon — stroked paths
 * branch: rectangle outline with dot grid
 * standalone: rectangle outline with horizontal dash
 * Tokens: --md-sys-color-text-muted (primary strokes), --md-sys-color-text-disabled (secondary/lower strokes)
 * Flutter equivalent: CustomPainter — 3 variants
 */

import type { AccountType } from "@/lib/types";

export default function AccountTypeIcon({ type }: { type: AccountType }) {
  if (type === "corporate") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.67857 3L15.3571 6.4L8.67857 9.67857L2 6.4L8.67857 3Z"
          stroke="var(--md-sys-color-text-muted)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          opacity="0.55"
          d="M2.60693 9.67871L8.67836 12.7144L14.7498 9.67871M2.60693 12.7144L8.67836 15.7501L14.7498 12.7144"
          stroke="var(--md-sys-color-text-disabled)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "branch") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.2716 3.75H4.7002V14.4643H13.2716V3.75Z"
          stroke="var(--md-sys-color-text-disabled)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M6.84277 6.42871H7.9142M10.0571 6.42871H11.1285M6.84277 9.10728H7.9142M10.0571 9.10728H11.1285M6.84277 11.7859H7.9142M10.0571 11.7859H11.1285"
          stroke="var(--md-sys-color-text-muted)"
          strokeWidth="1.28571"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // Standalone
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.25 3.75H3.75V14.25H14.25V3.75Z"
        stroke="var(--md-sys-color-text-disabled)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11.5L10.5 11.5"
        stroke="var(--md-sys-color-text-disabled)"
        strokeWidth="1.28571"
        strokeLinecap="round"
      />
    </svg>
  );
}
