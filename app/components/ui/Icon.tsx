"use client";

/**
 * FLUTTER HANDOFF: Icon
 * Widget: StatelessWidget
 * Wraps Material Symbols Rounded variable font.
 * Font axes map 1:1 to Figma Material Symbols component properties.
 *
 * Usage:
 *   <Icon name="home" />
 *   <Icon name="star" fill size={32} weight={300} />
 *   <Icon name="check_circle" fill size={20} className="text-green-500" />
 *
 * Figma: use the Material Symbols community library — icon names are identical.
 * https://www.figma.com/community/file/1035203688168086460
 */

interface IconProps {
  /** Material Symbols icon name — use underscore_case (e.g. "arrow_back", "check_circle") */
  name: string;
  /** FILL axis: true = 1 (filled), false = 0 (outlined). Default: false */
  fill?: boolean;
  /** Font size in px. Default: 24 */
  size?: number;
  /** Font weight (wght axis): 100–700. Default: 400 */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Grade (GRAD axis): -50–200. Default: 0 */
  grade?: number;
  /** Additional className for color, etc. */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Accessible label. If omitted, icon is aria-hidden. */
  label?: string;
}

export default function Icon({
  name,
  fill = false,
  size = 24,
  weight = 400,
  grade = 0,
  className = "",
  style,
  label,
}: IconProps) {
  const opsz = size <= 20 ? 20 : size >= 48 ? 48 : 24;

  return (
    <span
      className={`ms ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${fill ? 1 : 0}, "wght" ${weight}, "GRAD" ${grade}, "opsz" ${opsz}`,
        ...style,
      }}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
