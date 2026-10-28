"use client";

/**
 * FLUTTER HANDOFF: Menu
 * Widget: StatelessWidget (panel + rows). Open/close, anchoring and the trigger belong to the caller.
 * Variants: "icon" (leading icon), "check" (selection check on the right), "icon-check" (both).
 * State: none — `selected` and `onSelect` come from the caller.
 * Data: MenuItem[] built by the screen (sort options, row actions, type pickers).
 * Flutter equivalent: halosight_menu.dart (MenuPanel + MenuRow); wrap in PopupMenuButton / showMenu
 * Tokens: --elevation-5 (shadow), --md-sys-color-dark-secondary at 88% + 20px backdrop blur (panel), --md-sys-color-alpha-white-18 at 80% (stroke), --md-sys-color-text-primary (label, icon, check),
 *         --md-sys-color-semantic-error (destructive row), --md-sys-color-neonindigo (check),
 *         --md-sys-color-text-muted (section label), --md-sys-color-alpha-white-10 (divider),
 *         --radius-lg, --spacing-2/3/4/5
 * Animation: callers spring the panel in (scale 0.01 → 1, stiffness 380, damping 22, origin at the trigger corner)
 *            and fade rows in with `menuItemVariants` (stagger 40ms).
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";

export type MenuVariant = "icon" | "check" | "icon-check";

export interface MenuItem {
  id: string;
  label: string;
  /** Material Symbols name; shown for the `icon` and `icon-check` variants. */
  icon?: string;
  /** Shows the check on the right (`check` and `icon-check` variants). */
  selected?: boolean;
  /** Error color, for Delete and similar. */
  destructive?: boolean;
  onSelect?: () => void;
}

// Shared by every menu so open/close feels the same everywhere.
export const menuPanelVariants = {
  hidden:  { opacity: 0, scale: 0.01 },
  visible: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.01 },
};

export const menuPanelTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 22,
  mass: 0.9,
};

export const menuItemVariants = {
  hidden:  { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.04 + 0.06, duration: 0.15 },
  }),
  exit: { opacity: 0, transition: { duration: 0.05 } },
};

/** Panel chrome. Position it (absolute / popover) from the caller via `className` and `style`. */
export function MenuPanel({
  children, className, style, minWidth = 200,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: number;
}) {
  return (
    <div
      className={className}
      style={{
        background: "color-mix(in srgb, var(--md-sys-color-dark-secondary) 88%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid color-mix(in srgb, var(--md-sys-color-alpha-white-18) 80%, transparent)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elevation-5)",
        paddingTop: "var(--spacing-2)",
        paddingBottom: "var(--spacing-2)",
        paddingLeft: "var(--spacing-5)",
        paddingRight: "var(--spacing-5)",
        minWidth,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Small uppercase label above a group of rows (e.g. "Sort", "Visit Date"). */
export function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--md-sys-color-text-muted)",
        padding: "var(--spacing-2) 0 var(--spacing-1)",
      }}
    >
      {children}
    </p>
  );
}

export function MenuDivider() {
  return <div style={{ height: 1, background: "var(--md-sys-color-alpha-white-10)", margin: "var(--spacing-2) 0" }} />;
}

/** One row. `index` staggers the fade-in when the menu opens. */
export function MenuRow({
  item, variant, index = 0,
}: {
  item: MenuItem;
  variant: MenuVariant;
  index?: number;
}) {
  const showIcon = variant !== "check";
  const showCheck = variant !== "icon";
  const color = item.destructive ? "var(--md-sys-color-semantic-error)" : "var(--md-sys-color-text-primary)";
  return (
    <motion.button
      type="button"
      role={showCheck ? "menuitemradio" : "menuitem"}
      aria-checked={showCheck ? !!item.selected : undefined}
      custom={index}
      variants={menuItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={item.onSelect}
      className="w-full flex items-center text-left text-base"
      style={{
        gap: "var(--spacing-4)",
        paddingTop: "var(--spacing-3)",
        paddingBottom: "var(--spacing-3)",
        background: "transparent",
        color,
      }}
    >
      {showIcon && item.icon && <Icon name={item.icon} size={22} style={{ color, flexShrink: 0 }} />}
      <span className="flex-1 min-w-0">{item.label}</span>
      {showCheck && (
        <span style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          {item.selected && <Icon name="check" size={20} style={{ color: "var(--md-sys-color-neonindigo)" }} />}
        </span>
      )}
    </motion.button>
  );
}

/** Panel + rows for the simple case (no section labels). */
export default function Menu({
  items, variant, className, style, minWidth,
}: {
  items: MenuItem[];
  variant: MenuVariant;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: number;
}) {
  return (
    <MenuPanel className={className} style={style} minWidth={minWidth}>
      {items.map((item, i) => (
        <MenuRow key={item.id} item={item} variant={variant} index={i} />
      ))}
    </MenuPanel>
  );
}
