"use client";

/**
 * ActionItemsContext — in-memory store for action items across all accounts.
 * Initialized from mockAccountDetails on first render.
 * Changes are local to the session (no persistence).
 */

import { createContext, useContext, useState } from "react";
import { mockAccountDetails } from "@/lib/mock-data/accounts";
import type { ActionItem } from "@/lib/types";

type ItemsMap = Record<string, ActionItem[]>;

function buildInitialState(): ItemsMap {
  const map: ItemsMap = {};
  for (const [accountId, detail] of Object.entries(mockAccountDetails)) {
    map[accountId] = [...detail.actionItems];
  }
  return map;
}

interface ActionItemsCtx {
  getItems: (accountId: string) => ActionItem[];
  getAllItems: () => Array<ActionItem & { accountId: string }>;
  addItem: (accountId: string, item: ActionItem) => void;
  updateItem: (accountId: string, item: ActionItem) => void;
  deleteItem: (accountId: string, itemId: string) => void;
  reset: () => void;
}

const ActionItemsContext = createContext<ActionItemsCtx | null>(null);

export function ActionItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemsMap>(buildInitialState);

  const getItems = (accountId: string): ActionItem[] => items[accountId] ?? [];

  const getAllItems = (): Array<ActionItem & { accountId: string }> =>
    Object.entries(items).flatMap(([accountId, list]) =>
      list.map((item) => ({ ...item, accountId }))
    );

  const addItem = (accountId: string, item: ActionItem) =>
    setItems((prev) => ({
      ...prev,
      [accountId]: [...(prev[accountId] ?? []), item],
    }));

  const updateItem = (accountId: string, item: ActionItem) =>
    setItems((prev) => ({
      ...prev,
      [accountId]: (prev[accountId] ?? []).map((i) => (i.id === item.id ? item : i)),
    }));

  const deleteItem = (accountId: string, itemId: string) =>
    setItems((prev) => ({
      ...prev,
      [accountId]: (prev[accountId] ?? []).filter((i) => i.id !== itemId),
    }));

  const reset = () => setItems(buildInitialState());

  return (
    <ActionItemsContext.Provider value={{ getItems, getAllItems, addItem, updateItem, deleteItem, reset }}>
      {children}
    </ActionItemsContext.Provider>
  );
}

export function useActionItems() {
  const ctx = useContext(ActionItemsContext);
  if (!ctx) throw new Error("useActionItems must be used within ActionItemsProvider");
  return ctx;
}
