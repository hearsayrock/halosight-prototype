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

import * as lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIconLibrary } from "@/components/ui/iconLibrary";
import { LUCIDE_NAME } from "@/components/ui/lucideMap";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as fas from "@fortawesome/free-solid-svg-icons";
import * as far from "@fortawesome/free-regular-svg-icons";
import { FA_NAME } from "@/components/ui/faMap";

// Font Awesome's stylesheet is imported above, so it must not inject its own.
config.autoAddCss = false;

// Icons that read better solid when the caller asks for `fill`.
const LUCIDE_FILLABLE = new Set(["star", "grade", "favorite", "bookmark", "notifications", "keep", "bug_report", "lightbulb", "check_circle", "cancel", "error", "warning"]);

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
  const library = useIconLibrary();
  const lucideName = library === "lucide" ? LUCIDE_NAME[name] : undefined;
  const LucideGlyph = lucideName ? (lucide as unknown as Record<string, LucideIcon>)[lucideName] : undefined;

  const faName = library === "fontawesome" ? FA_NAME[name] : undefined;
  const faSolid = faName ? (fas as unknown as Record<string, IconDefinition>)[faName] : undefined;
  const faRegular = faName ? (far as unknown as Record<string, IconDefinition>)[faName] : undefined;
  const faGlyph = faSolid ? (fill ? faSolid : faRegular ?? faSolid) : undefined;

  if (faGlyph) {
    return (
      <FontAwesomeIcon
        icon={faGlyph}
        className={className}
        style={{ fontSize: Math.round(size * 0.8), width: size, height: size, flexShrink: 0, ...style }}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        role={label ? "img" : undefined}
      />
    );
  }

  if (LucideGlyph) {
    return (
      <LucideGlyph
        size={size}
        strokeWidth={weight <= 300 ? 1.5 : weight >= 500 ? 2.25 : 2}
        fill={fill && LUCIDE_FILLABLE.has(name) ? "currentColor" : "none"}
        className={className}
        style={{ flexShrink: 0, ...style }}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        role={label ? "img" : undefined}
      />
    );
  }

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
