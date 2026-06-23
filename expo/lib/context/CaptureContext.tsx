import React, { createContext, useContext, useState } from 'react';

type CaptureStatus = 'idle' | 'recording' | 'processing';

interface CaptureState {
  status: CaptureStatus;
  accountId: string | null;
  accountName: string | null;
  startCapture: (accountId: string, accountName: string) => void;
  stopCapture: () => void;
}

const Context = createContext<CaptureState | null>(null);

export function CaptureProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);

  function startCapture(id: string, name: string) {
    setAccountId(id);
    setAccountName(name);
    setStatus('recording');
  }

  function stopCapture() {
    setStatus('idle');
    setAccountId(null);
    setAccountName(null);
  }

  return (
    <Context.Provider value={{ status, accountId, accountName, startCapture, stopCapture }}>
      {children}
    </Context.Provider>
  );
}

export function useCapture(): CaptureState {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useCapture must be inside CaptureProvider');
  return ctx;
}
