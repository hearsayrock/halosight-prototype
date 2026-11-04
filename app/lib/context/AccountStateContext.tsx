"use client";

/**
 * FLUTTER HANDOFF: AccountStateContext
 * Tracks in-session account state overrides — disqualified leads, needs-attention
 * flags, rep-entered contact overrides, deleted interactions (activity ids), and which Engagements rows were opened.
 * In production this would write to the backend; here it's ephemeral React state.
 * Flutter equivalent: account_state_provider.dart / AccountRepository
 */

import { createContext, useContext, useState } from "react";

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
  isActivityDeleted: (activityId: string) => boolean;
  deleteActivity: (activityId: string) => void;
  restoreActivity: (activityId: string) => void;
  isEngagementRead: (engagementId: string) => boolean;
  markEngagementRead: (engagementId: string) => void;
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
  isActivityDeleted: () => false,
  deleteActivity: () => {},
  restoreActivity: () => {},
  isEngagementRead: () => false,
  markEngagementRead: () => {},
});

export function AccountStateProvider({ children }: { children: React.ReactNode }) {
  const [disqualifiedIds, setDisqualifiedIds] = useState<Set<string>>(new Set());
  const [attentionIds, setAttentionIds] = useState<Set<string>>(new Set());
  const [deletedActivityIds, setDeletedActivityIds] = useState<Set<string>>(new Set());
  const [readEngagementIds, setReadEngagementIds] = useState<Set<string>>(new Set());
  const [contactOverrides, setContactOverrides] = useState<Map<string, ContactInfo>>(new Map());

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

  function deleteActivity(activityId: string) {
    setDeletedActivityIds((prev) => new Set([...prev, activityId]));
  }

  function restoreActivity(activityId: string) {
    setDeletedActivityIds((prev) => {
      const next = new Set(prev);
      next.delete(activityId);
      return next;
    });
  }

  function markEngagementRead(engagementId: string) {
    setReadEngagementIds((prev) => new Set([...prev, engagementId]));
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
        isActivityDeleted: (activityId) => deletedActivityIds.has(activityId),
        deleteActivity,
        restoreActivity,
        isEngagementRead: (engagementId) => readEngagementIds.has(engagementId),
        markEngagementRead,
      }}
    >
      {children}
    </AccountStateContext.Provider>
  );
}

export function useAccountState() {
  return useContext(AccountStateContext);
}
