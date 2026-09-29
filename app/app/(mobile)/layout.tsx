import PhoneFrame from "@/components/layout/PhoneFrame";
import PageTransition from "@/components/layout/PageTransition";
import StaticBottomNav from "@/components/layout/StaticBottomNav";
import { ActionItemsProvider } from "@/lib/context/ActionItemsContext";
import { CaptureProvider } from "@/lib/context/CaptureContext";
import { FakeCallProvider } from "@/lib/context/FakeCallContext";
import { AccountStateProvider } from "@/lib/context/AccountStateContext";
import CaptureWidget from "@/components/capture/CaptureWidget";
import FakeCallOverlay from "@/components/capture/FakeCallOverlay";
import DemoReset from "@/components/layout/DemoReset";

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
    <AccountStateProvider>
      <ActionItemsProvider>
        <CaptureProvider>
          <FakeCallProvider>
            <PhoneFrame>
              <PageTransition>{children}</PageTransition>
              <StaticBottomNav />
              <CaptureWidget />
              <FakeCallOverlay />
              <DemoReset />
            </PhoneFrame>
          </FakeCallProvider>
        </CaptureProvider>
      </ActionItemsProvider>
    </AccountStateProvider>
  );
}
