"use client";

/**
 * CaptureContext — manages the global capture session state.
 * Lives in MobileLayout so the widget persists across navigation.
 *
 * States: idle → recording → finalizing → ready → idle
 */

import { createContext, useContext, useState, useCallback, useRef } from "react";

export type CaptureStatus = "idle" | "recording" | "finalizing" | "ready";

interface CaptureContextValue {
  status: CaptureStatus;
  accountId: string | null;
  accountName: string | null;
  startCapture: (accountId: string, accountName: string) => void;
  switchAccount: (accountId: string, accountName: string) => void;
  finishCapture: () => void;
  readyCapture: () => void;
  dismissCapture: () => void;
}

const CaptureContext = createContext<CaptureContextValue | null>(null);

export function CaptureProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus]           = useState<CaptureStatus>("idle");
  const [accountId, setAccountId]     = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);

  const startCapture = useCallback((id: string, name: string) => {
    setAccountId(id);
    setAccountName(name);
    setStatus("recording");
  }, []);

  const switchAccount  = useCallback((id: string, name: string) => {
    setAccountId(id);
    setAccountName(name);
  }, []);

  const finishCapture  = useCallback(() => setStatus("finalizing"), []);
  const readyCapture   = useCallback(() => setStatus("ready"),      []);
  const dismissCapture = useCallback(() => {
    setStatus("idle");
    setAccountId(null);
    setAccountName(null);
  }, []);

  return (
    <CaptureContext.Provider value={{ status, accountId, accountName, startCapture, switchAccount, finishCapture, readyCapture, dismissCapture }}>
      {children}
    </CaptureContext.Provider>
  );
}

export function useCapture() {
  const ctx = useContext(CaptureContext);
  if (!ctx) throw new Error("useCapture must be used within CaptureProvider");
  return ctx;
}
