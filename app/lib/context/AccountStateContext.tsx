"use client";

/**
 * FLUTTER HANDOFF: AccountStateContext
 * Tracks in-session account state overrides — disqualified leads, needs-attention
 * flags, rep-entered contact overrides, and companies created this session
 * (kept until a refresh).
 * In production this would write to the backend; here it's ephemeral React state.
 * Flutter equivalent: account_state_provider.dart / AccountRepository
 */

import { createContext, useContext, useState } from "react";
import type { Account } from "@/lib/types";

export interface ContactInfo {
  contactName?: string;
  contactTitle?: string;
  phone?: string;
}

interface AccountStateContextValue {
  isDisqualified: (id: string) => boolean;
  disqualify: (id: string) => void;
  restore: (id: string) => void;
  needsAttention: (id: string) => boolean;
  markNeedsAttention: (id: string) => void;
  clearNeedsAttention: (id: string) => void;
  getContactOverride: (id: string) => ContactInfo | undefined;
  updateContact: (id: string, info: ContactInfo) => void;
  createdAccounts: Account[];
  addCreatedAccount: (account: Account) => void;
  markCreatedVisited: (id: string) => void;
}

const AccountStateContext = createContext<AccountStateContextValue>({
  isDisqualified: () => false,
  disqualify: () => {},
  restore: () => {},
  needsAttention: () => false,
  markNeedsAttention: () => {},
  clearNeedsAttention: () => {},
  getContactOverride: () => undefined,
  updateContact: () => {},
  createdAccounts: [],
  addCreatedAccount: () => {},
  markCreatedVisited: () => {},
});

export function AccountStateProvider({ children }: { children: React.ReactNode }) {
  const [disqualifiedIds, setDisqualifiedIds] = useState<Set<string>>(new Set());
  const [attentionIds, setAttentionIds] = useState<Set<string>>(new Set());
  const [contactOverrides, setContactOverrides] = useState<Map<string, ContactInfo>>(new Map());
  const [createdAccounts, setCreatedAccounts] = useState<Account[]>([]);

  function markCreatedVisited(id: string) {
    setCreatedAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, neverVisited: false, lastVisited: new Date() } : a))
    );
  }

  function addCreatedAccount(account: Account) {
    setCreatedAccounts((prev) => [account, ...prev.filter((a) => a.id !== account.id)]);
  }

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

  function markNeedsAttention(id: string) {
    setAttentionIds((prev) => new Set([...prev, id]));
  }

  function clearNeedsAttention(id: string) {
    setAttentionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function getContactOverride(id: string) {
    return contactOverrides.get(id);
  }

  function updateContact(id: string, info: ContactInfo) {
    setContactOverrides((prev) => new Map([...prev, [id, { ...prev.get(id), ...info }]]));
    if (info.contactName?.trim()) {
      clearNeedsAttention(id);
    }
  }

  return (
    <AccountStateContext.Provider
      value={{
        isDisqualified: (id) => disqualifiedIds.has(id),
        disqualify,
        restore,
        needsAttention: (id) => attentionIds.has(id),
        markNeedsAttention,
        clearNeedsAttention,
        getContactOverride,
        updateContact,
        createdAccounts,
        addCreatedAccount,
        markCreatedVisited,
      }}
    >
      {children}
    </AccountStateContext.Provider>
  );
}

export function useAccountState() {
  return useContext(AccountStateContext);
}
