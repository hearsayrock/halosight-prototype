import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ActionItem, ActionItemStatus } from '../types';
import { mockAccountDetails } from '../mock-data/accounts';

type FlatItem = ActionItem & { accountId: string };

interface ActionItemsState {
  getItems: (accountId: string) => ActionItem[];
  getAllItems: () => FlatItem[];
  addItem: (accountId: string, item: ActionItem) => void;
  updateItem: (accountId: string, item: ActionItem) => void;
}

const Context = createContext<ActionItemsState | null>(null);

function buildInitialState(): Record<string, ActionItem[]> {
  const state: Record<string, ActionItem[]> = {};
  for (const [id, detail] of Object.entries(mockAccountDetails)) {
    state[id] = detail.actionItems.map((i) => ({ ...i }));
  }
  return state;
}

export function ActionItemsProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Record<string, ActionItem[]>>(buildInitialState);

  const getItems = useCallback(
    (accountId: string): ActionItem[] => store[accountId] ?? [],
    [store]
  );

  const getAllItems = useCallback((): FlatItem[] => {
    const result: FlatItem[] = [];
    for (const [accountId, items] of Object.entries(store)) {
      for (const item of items) {
        result.push({ ...item, accountId });
      }
    }
    return result;
  }, [store]);

  const addItem = useCallback((accountId: string, item: ActionItem) => {
    setStore((prev) => ({
      ...prev,
      [accountId]: [item, ...(prev[accountId] ?? [])],
    }));
  }, []);

  const updateItem = useCallback((accountId: string, updated: ActionItem) => {
    setStore((prev) => ({
      ...prev,
      [accountId]: (prev[accountId] ?? []).map((i) =>
        i.id === updated.id ? updated : i
      ),
    }));
  }, []);

  return (
    <Context.Provider value={{ getItems, getAllItems, addItem, updateItem }}>
      {children}
    </Context.Provider>
  );
}

export function useActionItems(): ActionItemsState {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useActionItems must be inside ActionItemsProvider');
  return ctx;
}
