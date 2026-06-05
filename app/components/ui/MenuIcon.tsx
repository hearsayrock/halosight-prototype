/**
 * FLUTTER HANDOFF: MenuIcon
 * Widget: StatelessWidget
 * Usage: top nav left — triggers side drawer / menu overlay
 * Two pill bars: full-width top, 56% bottom
 * Color: currentColor (pass via className or style)
 */

interface MenuIconProps {
  size?: number;
  color?: string;
}

export default function MenuIcon({ size = 32, color = "var(--color-text-muted)" }: MenuIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect y="7" width="32" height="5" rx="2.5" fill={color} />
      <rect y="19" width="18" height="5" rx="2.5" fill={color} />
    </svg>
  );
}
