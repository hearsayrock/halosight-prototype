"use client";

/**
 * Design-system preview for AccountPickerSheet: the real sheet inside a phone-height box (it positions itself against its parent, so a relative,
 * clipped box stands in for the phone screen). Live: search, tap a row.
 */

import { useState } from "react";
import AccountPickerSheet from "@/components/accounts/AccountPickerSheet";

export function AccountPickerPreview() {
  const [current, setCurrent] = useState<string | null>("walmart-corp");
  return (
    <div style={{ position: "relative", height: 560, overflow: "hidden", borderRadius: "var(--radius-lg)", background: "var(--md-sys-color-background)" }}>
      <AccountPickerSheet currentId={current} onSelect={(id) => setCurrent(id)} onClose={() => {}} autoFocus={false} />
    </div>
  );
}
