"use client";

/**
 * FLUTTER HANDOFF: SalesforceImportState
 * Tokens: none (data only)
 * Flutter equivalent: salesforce_import_provider.dart
 *
 * Owns all Salesforce import state for the prototype. Mock data drives
 * everything — no real API calls in V1.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  mockConnection,
  mockAnalysis,
  mockSavedRules,
  mockImportHistory,
} from "@/lib/mock-data/salesforce";

export type ActivityDestination = "note" | "task" | "skip";
export type RunStatus = "idle" | "analyzing" | "importing" | "done" | "partial";

export interface SalesforceAccount {
  id: string;
  name: string;
  activityCount: number;
  sfAccountId: string;
  alreadyInHalosight: boolean;
  visitedDaysAgo: number;
}

export interface ActivityType {
  name: string;
  count: number;
  recommended: "note" | "task" | null;
  confident: boolean;
}

interface ConnectionState {
  connected: boolean;
  salesforceUserId: string;
  lastImportAt: Date | null;
  lastRecordCursor: string | null;
}

interface AnalysisState {
  accounts: SalesforceAccount[];
  activityTypes: ActivityType[];
  unlinkedCount: number;
  alreadyImportedCount: number;
  windowStart: Date;
}

interface ReviewState {
  answers: Record<string, ActivityDestination>;
  excludedAccountIds: string[];
  expandedGroups: Record<string, boolean>;
  moved: { typeName: string; from: ActivityDestination; to: ActivityDestination } | null;
  showAllAccounts: boolean;
}

interface RunState {
  status: RunStatus;
  progress: number;
  created: { companies: number; notes: number; actionItems: number };
  failed: string[];
}

interface ImportHistoryEntry {
  id: string;
  importedAt: Date;
  companiesAdded: number;
  notesCreated: number;
  actionItemsCreated: number;
}

interface SalesforceContextValue {
  connection: ConnectionState;
  rules: Record<string, ActivityDestination>;
  analysis: AnalysisState | null;
  review: ReviewState;
  run: RunState;
  importHistory: ImportHistoryEntry[];

  setRule: (typeName: string, destination: ActivityDestination) => void;
  setReviewAnswer: (typeName: string, destination: ActivityDestination) => void;
  toggleAccountExclusion: (accountId: string) => void;
  toggleGroupExpanded: (groupKey: string) => void;
  toggleShowAllAccounts: () => void;
  setMoved: (moved: ReviewState["moved"]) => void;
  clearMoved: () => void;
  startImport: () => void;
  resetRun: () => void;
}

const SalesforceContext = createContext<SalesforceContextValue | null>(null);

export function SalesforceProvider({ children }: { children: ReactNode }) {
  const [connection] = useState<ConnectionState>({
    connected: mockConnection.connected,
    salesforceUserId: mockConnection.salesforceUserId,
    lastImportAt: mockConnection.lastImportAt,
    lastRecordCursor: mockConnection.lastRecordCursor,
  });

  const [rules, setRules] = useState<Record<string, ActivityDestination>>(mockSavedRules);
  const [analysis] = useState<AnalysisState | null>(mockAnalysis);
  const [importHistory] = useState<ImportHistoryEntry[]>(mockImportHistory);

  const [review, setReview] = useState<ReviewState>({
    answers: { ...mockSavedRules },
    excludedAccountIds: [],
    expandedGroups: {},
    moved: null,
    showAllAccounts: false,
  });

  const [run, setRun] = useState<RunState>({
    status: "idle",
    progress: 0,
    created: { companies: 0, notes: 0, actionItems: 0 },
    failed: [],
  });

  const setRule = useCallback((typeName: string, destination: ActivityDestination) => {
    setRules((prev) => ({ ...prev, [typeName]: destination }));
  }, []);

  const setReviewAnswer = useCallback((typeName: string, destination: ActivityDestination) => {
    setReview((prev) => ({ ...prev, answers: { ...prev.answers, [typeName]: destination } }));
  }, []);

  const toggleAccountExclusion = useCallback((accountId: string) => {
    setReview((prev) => {
      const excluded = prev.excludedAccountIds.includes(accountId)
        ? prev.excludedAccountIds.filter((id) => id !== accountId)
        : [...prev.excludedAccountIds, accountId];
      return { ...prev, excludedAccountIds: excluded };
    });
  }, []);

  const toggleGroupExpanded = useCallback((groupKey: string) => {
    setReview((prev) => ({
      ...prev,
      expandedGroups: { ...prev.expandedGroups, [groupKey]: !prev.expandedGroups[groupKey] },
    }));
  }, []);

  const toggleShowAllAccounts = useCallback(() => {
    setReview((prev) => ({ ...prev, showAllAccounts: !prev.showAllAccounts }));
  }, []);

  const setMoved = useCallback((moved: ReviewState["moved"]) => {
    setReview((prev) => ({ ...prev, moved }));
  }, []);

  const clearMoved = useCallback(() => {
    setReview((prev) => ({ ...prev, moved: null }));
  }, []);

  const startImport = useCallback(() => {
    setRun({ status: "importing", progress: 0, created: { companies: 0, notes: 0, actionItems: 0 }, failed: [] });
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        clearInterval(interval);
        setRun({ status: "done", progress: 100, created: { companies: 18, notes: 94, actionItems: 29 }, failed: [] });
      } else {
        setRun((prev) => ({ ...prev, progress: Math.min(p, 99) }));
      }
    }, 300);
  }, []);

  const resetRun = useCallback(() => {
    setRun({ status: "idle", progress: 0, created: { companies: 0, notes: 0, actionItems: 0 }, failed: [] });
  }, []);

  return (
    <SalesforceContext.Provider value={{
      connection, rules, analysis, review, run, importHistory,
      setRule, setReviewAnswer, toggleAccountExclusion,
      toggleGroupExpanded, toggleShowAllAccounts,
      setMoved, clearMoved, startImport, resetRun,
    }}>
      {children}
    </SalesforceContext.Provider>
  );
}

export function useSalesforce(): SalesforceContextValue {
  const ctx = useContext(SalesforceContext);
  if (!ctx) throw new Error("useSalesforce must be used inside SalesforceProvider");
  return ctx;
}
