import PhoneFrame from "@/components/layout/PhoneFrame";
import PageTransition from "@/components/layout/PageTransition";
import { ActionItemsProvider } from "@/lib/context/ActionItemsContext";
import { ActionItemDrawerProvider } from "@/lib/context/ActionItemDrawerContext";
import { ChatProvider } from "@/lib/context/ChatContext";
import { ToastProvider } from "@/lib/context/ToastContext";
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
 */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountStateProvider>
      <ActionItemsProvider>
        <CaptureProvider>
          <FakeCallProvider>
            <PhoneFrame>
              <ToastProvider>
              <ActionItemDrawerProvider>
              <ChatProvider>
                <PageTransition>{children}</PageTransition>
                <CaptureWidget />
                <FakeCallOverlay />
                <DemoReset />
              </ChatProvider>
              </ActionItemDrawerProvider>
              </ToastProvider>
            </PhoneFrame>
          </FakeCallProvider>
        </CaptureProvider>
      </ActionItemsProvider>
    </AccountStateProvider>
  );
}
