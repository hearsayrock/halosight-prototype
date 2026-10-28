"use client";

/**
 * ChatContext — opens the account chat drawer from any screen.
 * FLUTTER HANDOFF: a small controller holding the open account; screens call open(accountName).
 * Mounted inside PhoneFrame (app/(mobile)/layout.tsx). Outside the provider (e.g. /design-system) open() is a no-op.
 */

import { createContext, useCallback, useContext, useState } from "react";
import ChatDrawer from "@/components/chat/ChatDrawer";

const Ctx = createContext<{ open: (accountName: string) => void } | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [accountName, setAccountName] = useState("this account");

  const open = useCallback((name: string) => {
    setAccountName(name);
    setIsOpen(true);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <ChatDrawer open={isOpen} accountName={accountName} onClose={() => setIsOpen(false)} />
    </Ctx.Provider>
  );
}

export function useAccountChat() {
  return useContext(Ctx) ?? { open: () => {} };
}
