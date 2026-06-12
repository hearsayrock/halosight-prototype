"use client";

/**
 * FLUTTER HANDOFF: AccountStateContext
 * Tracks in-session account state overrides — currently disqualified leads.
 * In production this would write to the backend; here it's ephemeral React state.
 * Flutter equivalent: account_state_provider.dart / AccountRepository
 */

import { createContext, useContext, useState } from "react";

interface AccountStateContextValue {
  isDisqualified: (id: string) => boolean;
  disqualify: (id: string) => void;
  restore: (id: string) => void;
}

const AccountStateContext = createContext<AccountStateContextValue>({
  isDisqualified: () => false,
  disqualify: () => {},
  restore: () => {},
});

export function AccountStateProvider({ children }: { children: React.ReactNode }) {
  const [disqualifiedIds, setDisqualifiedIds] = useState<Set<string>>(new Set());

  function disqualify(id: string) {
    setDisqualifiedIds((prev) => new Set([...prev, id]));
  }

  function restore(id: string) {
    setDisqualifiedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <AccountStateContext.Provider
      value={{
        isDisqualified: (id) => disqualifiedIds.has(id),
        disqualify,
        restore,
      }}
    >
      {children}
    </AccountStateContext.Provider>
  );
}

export function useAccountState() {
  return useContext(AccountStateContext);
}
