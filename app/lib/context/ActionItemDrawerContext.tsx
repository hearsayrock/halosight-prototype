"use client";

/**
 * ActionItemDrawerContext — opens the action item drawer from any list row.
 * FLUTTER HANDOFF: a small controller/BLoC holding the open item; screens call open(accountId, itemId, onComplete).
 * onComplete runs when "Mark complete" is tapped, so the screen that opened the drawer keeps its own completion flow
 * (pending check, undo toast, note sheet).
 */

import { createContext, useCallback, useContext, useState } from "react";
import ActionItemDrawer from "@/components/accounts/ActionItemDrawer";

interface Target { accountId: string; itemId: string; onComplete?: () => void }

const Ctx = createContext<{ open: (accountId: string, itemId: string, onComplete?: () => void) => void } | null>(null);

export function ActionItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const open = useCallback((accountId: string, itemId: string, onComplete?: () => void) => {
    setTarget({ accountId, itemId, onComplete });
    setOpenCount((n) => n + 1);
    setIsOpen(true);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <ActionItemDrawer
        key={openCount}
        accountId={target?.accountId ?? null}
        itemId={target?.itemId ?? null}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={target?.onComplete}
      />
    </Ctx.Provider>
  );
}

export function useActionItemDrawer() {
  // Outside the provider (e.g. the design-system page) rows render normally and opening is a no-op.
  return useContext(Ctx) ?? { open: () => {} };
}
