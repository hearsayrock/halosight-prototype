"use client";

/**
 * FakeCallContext — prototype-only fake phone call state machine.
 * Used to demonstrate how an active recording handles call interruptions.
 *
 * States: idle → ringing → active → idle
 *                       ↘ voicemail → idle (auto, after 8s of ringing)
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";

export type FakeCallStatus = "idle" | "ringing" | "active" | "voicemail";

interface FakeCallContextValue {
  callStatus: FakeCallStatus;
  triggerCall: () => void;
  acceptCall:  () => void;
  rejectCall:  () => void;
  endCall:     () => void;
}

const FakeCallContext = createContext<FakeCallContextValue | null>(null);

export function FakeCallProvider({ children }: { children: React.ReactNode }) {
  const [callStatus, setCallStatus] = useState<FakeCallStatus>("idle");

  // Auto voicemail after 8s of unanswered ringing
  useEffect(() => {
    if (callStatus !== "ringing") return;
    const t = setTimeout(() => setCallStatus("voicemail"), 8000);
    return () => clearTimeout(t);
  }, [callStatus]);

  // Auto-dismiss voicemail notice after 1.5s
  useEffect(() => {
    if (callStatus !== "voicemail") return;
    const t = setTimeout(() => setCallStatus("idle"), 1500);
    return () => clearTimeout(t);
  }, [callStatus]);

  const triggerCall = useCallback(() => setCallStatus("ringing"), []);
  const acceptCall  = useCallback(() => setCallStatus("active"),  []);
  const rejectCall  = useCallback(() => setCallStatus("idle"),    []);
  const endCall     = useCallback(() => setCallStatus("idle"),    []);

  return (
    <FakeCallContext.Provider value={{ callStatus, triggerCall, acceptCall, rejectCall, endCall }}>
      {children}
    </FakeCallContext.Provider>
  );
}

export function useFakeCall() {
  const ctx = useContext(FakeCallContext);
  if (!ctx) throw new Error("useFakeCall must be used within FakeCallProvider");
  return ctx;
}
