"use client";

/** Design-system page previews for the feedback widget — NOT part of the mobile app UX. Renders the real entry card and form. */

import { useState } from "react";
import { DrawerBody } from "@/components/ui/Drawer";
import { FeedbackEntryCard, FeedbackForm, type FeedbackType } from "@/components/ui/FeedbackWidget";
import { DrawerFrame } from "@/components/design-system/ActionItemDrawerPreviews";

export function FeedbackEntryPreview() {
  const [last, setLast] = useState<FeedbackType | null>(null);
  return (
    <div style={{ paddingTop: "var(--spacing-4)" }}>
      <FeedbackEntryCard onSelect={setLast} />
      {last && <p className="text-center text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-muted)", marginTop: -8, paddingBottom: "var(--spacing-2)" }}>opens the drawer with “{last}” selected</p>}
    </div>
  );
}

export function FeedbackFormPreview({
  initialType = "bug", initialText = "", sent = false,
}: { initialType?: FeedbackType; initialText?: string; sent?: boolean }) {
  const [selected, setSelected] = useState<FeedbackType>(initialType);
  const [text, setText] = useState(initialText);
  return (
    <DrawerFrame>
      <DrawerBody style={{ paddingLeft: "var(--spacing-5)", paddingRight: "var(--spacing-5)", paddingBottom: "var(--spacing-8)" }}>
        <FeedbackForm
          selected={selected} onSelect={setSelected}
          text={text} onText={setText}
          sent={sent} onSend={() => {}} onClose={() => {}}
        />
      </DrawerBody>
    </DrawerFrame>
  );
}
