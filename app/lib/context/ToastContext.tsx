"use client";

/**
 * ToastContext — show a toast from anywhere: `const { show } = useToast(); show({ title: "Saved", tone: "success" })`.
 * FLUTTER HANDOFF: ToastController (one toast at a time; extra calls queue). Mounted inside PhoneFrame (app/(mobile)/layout.tsx).
 * Outside the provider (e.g. /design-system) show() is a no-op.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Toast, { type ToastProps } from "@/components/ui/Toast";

export type ToastRequest = Omit<ToastProps, "visible" | "onDismiss">;

const Ctx = createContext<{ show: (t: ToastRequest, opts?: { replace?: boolean }) => void; dismiss: () => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ToastRequest | null>(null);
  const [visible, setVisible] = useState(false);
  // Kept in a ref so `show` keeps one identity and callers can safely list it in effect dependencies.
  const live = useRef({ current: null as ToastRequest | null, visible: false });
  useEffect(() => { live.current.current = current; live.current.visible = visible; }, [current, visible]);
  const queue = useRef<ToastRequest[]>([]);
  const gap = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => {
    if (live.current.visible) return; // something was shown in the meantime
    const n = queue.current.shift();
    if (n) { live.current.current = n; live.current.visible = true; setCurrent(n); setVisible(true); }
    else { live.current.current = null; setCurrent(null); }
  }, []);

  const dismiss = useCallback(() => {
    live.current.visible = false;
    setVisible(false);
    // Let the exit animation finish before the next one comes in.
    if (gap.current) clearTimeout(gap.current);
    gap.current = setTimeout(next, 320);
  }, [next]);

  // replace: swap the toast that is on screen in place (e.g. "Preparing note" → "Note ready") instead of queueing behind it.

  // replace: swap the toast that is on screen in place (e.g. "Preparing note" → "Note ready") instead of queueing behind it.
  const show = useCallback((t: ToastRequest, opts?: { replace?: boolean }) => {
    const { current: cur, visible: vis } = live.current;
    if (cur === null && !vis) { live.current.current = t; live.current.visible = true; setCurrent(t); setVisible(true); }
    else if (opts?.replace) { queue.current = []; live.current.current = t; setCurrent(t); setVisible(true); }
    else queue.current.push(t);
  }, []);

  return (
    <Ctx.Provider value={{ show, dismiss }}>
      {children}
      {current && <Toast {...current} visible={visible} onDismiss={dismiss} />}
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx) ?? { show: () => {}, dismiss: () => {} };
}
