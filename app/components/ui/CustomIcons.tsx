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

/** 4-pointed sparkle star used to mark leads */
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
      <path d="M10.54,22.92c-1.39-4.52-4.93-8.06-9.45-9.46-.64-.2-1.08-.79-1.08-1.47s.44-1.27,1.08-1.46c4.52-1.4,8.06-4.93,9.45-9.46.2-.64.79-1.08,1.47-1.08s1.27.44,1.47,1.08c1.39,4.52,4.93,8.06,9.45,9.46.64.2,1.08.79,1.08,1.46s-.44,1.27-1.08,1.47c-4.52,1.4-8.06,4.93-9.45,9.46-.2.64-.79,1.08-1.47,1.08s-1.27-.44-1.47-1.08Z"/>
    </svg>
  );
}
