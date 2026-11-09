"use client";

/**
 * Exploration toggle: Material Symbols vs Lucide vs Font Awesome. Lives in the design-system header and the DevPanel.
 * Not part of the product UX; delete with iconLibrary.ts / lucideMap.ts if the exploration is dropped.
 */

import { setIconLibrary, useIconLibrary } from "@/components/ui/iconLibrary";

export default function IconLibraryToggle() {
  const lib = useIconLibrary();
  return (
    <div
      className="flex items-center"
      role="group"
      aria-label="Icon library"
      style={{ background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-alpha-white-10)", borderRadius: "var(--radius-full)", padding: 2 }}
    >
      {(["material", "lucide", "fontawesome"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setIconLibrary(l)}
          aria-pressed={lib === l}
          style={{
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: "var(--radius-full)",
            background: lib === l ? "var(--md-sys-color-dark-tertiary)" : "transparent",
            color: lib === l ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
          }}
        >
          {l === "material" ? "Material" : l === "lucide" ? "Lucide" : "Font Awesome"}
        </button>
      ))}
    </div>
  );
}
