"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCapture } from "@/lib/context/CaptureContext";

export default function DemoReset() {
  const { dismissCapture } = useCapture();
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "r" || e.key === "R") {
        dismissCapture();
        router.push("/relationships");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dismissCapture, router]);

  return null;
}
