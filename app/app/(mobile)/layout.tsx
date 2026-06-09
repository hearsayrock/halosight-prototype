import PhoneFrame from "@/components/layout/PhoneFrame";
import PageTransition from "@/components/layout/PageTransition";
import StaticBottomNav from "@/components/layout/StaticBottomNav";
import { ActionItemsProvider } from "@/lib/context/ActionItemsContext";
import { CaptureProvider } from "@/lib/context/CaptureContext";
import CaptureWidget from "@/components/capture/CaptureWidget";

/**
 * Shared mobile layout — single PhoneFrame instance so AnimatePresence
 * can coordinate enter/exit across all mobile screens.
 *
 * Structure inside phone-screen:
 *   PageTransition   ← absolute, inset-0, slides with each route change
 *   StaticBottomNav  ← absolute, bottom-0, z-50, never animates
 */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActionItemsProvider>
      <CaptureProvider>
        <PhoneFrame>
          <PageTransition>{children}</PageTransition>
          <StaticBottomNav />
          <CaptureWidget />
        </PhoneFrame>
      </CaptureProvider>
    </ActionItemsProvider>
  );
}
