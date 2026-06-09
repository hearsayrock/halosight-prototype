/**
 * Onboarding layout — PhoneFrame without BottomNav or CaptureWidget.
 * Onboarding is a standalone flow; the rep enters the main app afterward.
 */

import PhoneFrame from "@/components/layout/PhoneFrame";
import { ActionItemsProvider } from "@/lib/context/ActionItemsContext";
import { CaptureProvider } from "@/lib/context/CaptureContext";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActionItemsProvider>
      <CaptureProvider>
        <PhoneFrame>{children}</PhoneFrame>
      </CaptureProvider>
    </ActionItemsProvider>
  );
}
