"use client";

/**
 * FLUTTER HANDOFF: FilterDropdown
 * Widget: StatefulWidget (open/close only; the selected value lives in the parent)
 * Props: options ({ value, label }[]), value, onChange(value), defaultValue? (the value that means "no filter", default the first option)
 * State: open (bool)
 * Flutter equivalent: filter_dropdown.dart (a pill that opens a PopupMenuButton / showMenu with HalosightMenu `check` rows)
 *
 * A 32px pill that shows the current choice and opens a check menu. Three looks:
 *   - default: color.dark.secondary fill, color.text.primary label, a muted down arrow
 *   - filtered (value is not the default): a small neonindigo check before the label
 *   - open: neonindigo fill, color.text.on-accent label, an up arrow
 * The menu is Menu (variant `check`, min width 180), anchored top-left under the pill; a tap outside dismisses it.
 * Used for the Open / Done and Due Date / Company pills on the items list and the companies screen's items section.
 * Known drift: the open-state arrow is a raw white at 70%; there is no token for it yet (flagged, not invented).
 *
 * Tokens: color.dark.secondary (pill), color.neonindigo.base (open fill, filtered check), color.text.on-accent (open label),
 *         color.text.primary / muted, radius.full; the menu uses Menu's tokens
 * Transitions: Menu's spring (scale 0 to 1 from the top-left corner, rows fade in one after another)
 */

import { useState } from "react";
import MenuPopover from "@/components/ui/MenuPopover";
import FilterPill from "@/components/ui/FilterPill";
import { MenuPanel, MenuRow } from "@/components/ui/Menu";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Value that represents "no filter active" — defaults to first option's value */
  defaultValue?: T;
}

export default function FilterDropdown<T extends string>({ options, value, onChange, defaultValue }: Props<T>) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? value;
  const baseValue = defaultValue ?? options[0]?.value;
  const isFiltered = value !== baseValue;

  return (
    <div className="relative">
      <FilterPill label={currentLabel} open={open} filtered={isFiltered} onClick={() => setOpen((o) => !o)} />

      <MenuPopover open={open} onClose={() => setOpen(false)} placement="below-left" backdropZIndex={40} panelZIndex={50}>
              <MenuPanel minWidth={180}>
                {options.map((opt, i) => (
                  <MenuRow
                    key={opt.value}
                    index={i}
                    variant="check"
                    item={{
                      id: opt.value,
                      label: opt.label,
                      selected: value === opt.value,
                      onSelect: () => { onChange(opt.value); setOpen(false); },
                    }}
                  />
                ))}
              </MenuPanel>
      </MenuPopover>
    </div>
  );
}
