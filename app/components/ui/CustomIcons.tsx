"use client";

/**
 * FLUTTER HANDOFF: CustomIcons
 * Widget: StatelessWidget (icon)
 * Custom SVG icons that supplement Material Symbols.
 * All icons use `currentColor` — set color via style or className.
 * Size prop sets width + height in px.
 */

interface IconProps {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** 4-pointed star used to mark leads */
export function LeadStarIcon({ size = 18, style, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d="M12,1L9,9L1,12L9,15L12,23L15,15L23,12L15,9L12,1Z" />
    </svg>
  );
}

/** Building icon used to mark accounts / companies */
export function CompanyIcon({ size = 18, style, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d="M10 12h4" />
      <path d="M10 8h4" />
      <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
    </svg>
  );
}
