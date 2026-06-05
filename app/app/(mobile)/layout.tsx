import PhoneFrame from "@/components/layout/PhoneFrame";

/**
 * Shared mobile layout — wraps all app screens in the single PhoneFrame
 * instance so PageTransition has one persistent AnimatePresence host.
 * The design-system page lives outside this group and is unaffected.
 */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <PhoneFrame>{children}</PhoneFrame>;
}
