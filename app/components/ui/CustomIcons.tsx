"use client";

/**
 * FLUTTER HANDOFF: CustomIcons (LeadStarIcon, CompanyIcon, AiChatIcon)
 * Widget: StatelessWidget (CustomPaint or an SVG asset)
 * Props: size (px, sets width and height), style?, className?
 * Icons Material Symbols doesn't have, drawn as filled SVGs on a 24px grid. Every one uses currentColor, so colour comes from the parent.
 *   - LeadStarIcon (default 18): a four-pointed star that marks a lead
 *   - CompanyIcon (default 18): a building that marks a company
 *   - AiChatIcon (default 24): a speech bubble with a sparkle, the "Ask" button on the account page
 * In Flutter ship them as SVG assets (flutter_svg) so they follow the icon colour.
 * Tokens: inherits currentColor
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

/** Speech bubble with a sparkle: opens the account chat ("Ask"). */
export function AiChatIcon({ size = 24, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={style} className={className}>
      <path d="M21.492 11.976C20.988 12.276 20.8799 12.612 20.6759 13.032C20.4959 14.436 19.932 15.624 18.996 16.572C17.376 18.216 14.664 19.116 11.364 19.116C11.328 19.116 11.292 19.116 11.256 19.116C10.5 19.116 9.73195 19.032 8.98795 18.876L8.48395 18.78L8.13595 19.164C7.76395 19.572 6.89995 20.448 5.84395 21.156C5.85595 20.232 5.86795 19.092 5.84395 18.24V17.748L5.41195 17.496C3.09595 16.068 1.76395 13.968 1.83595 11.856C1.95595 8.31602 5.12395 5.44802 9.34795 4.76402C10.548 4.39202 12.5639 3.66002 12.4919 2.88002C12.4919 2.82002 12.492 2.83202 12.468 2.82002C12.12 2.78402 11.6879 2.77202 11.2919 2.77202C5.13595 2.77202 0.179949 6.73202 -5.05567e-05 11.784C-0.0960506 14.412 1.40395 16.992 4.01995 18.768C4.04395 20.052 4.00795 21.768 3.99595 22.32C3.99595 22.716 4.18795 23.088 4.52395 23.304C4.71595 23.424 4.91995 23.484 5.13595 23.484C5.30395 23.484 5.47195 23.448 5.62795 23.376C7.12795 22.668 8.42395 21.492 9.13195 20.76C9.83995 20.88 10.548 20.94 11.256 20.94C11.292 20.94 11.328 20.94 11.364 20.94C15.168 20.94 18.336 19.848 20.304 17.856C21.84 16.296 22.632 14.208 22.596 11.796C22.596 11.748 22.596 11.712 22.596 11.664C22.128 11.7 21.696 11.856 21.516 11.964L21.492 11.976Z" />
      <path d="M23.64 7.128C19.104 6.108 18.396 5.4 17.376 0.863998C17.328 0.659998 17.148 0.503998 16.932 0.503998C16.716 0.503998 16.536 0.647998 16.488 0.863998C15.468 5.4 14.76 6.108 10.224 7.128C10.02 7.176 9.86401 7.356 9.86401 7.572C9.86401 7.788 10.008 7.968 10.224 8.016C14.76 9.036 15.468 9.744 16.488 14.28C16.536 14.484 16.716 14.64 16.932 14.64C17.148 14.64 17.328 14.496 17.376 14.28C18.396 9.744 19.104 9.036 23.64 8.016C23.844 7.968 24 7.788 24 7.572C24 7.356 23.856 7.176 23.64 7.128Z" />
    </svg>
  );
}
