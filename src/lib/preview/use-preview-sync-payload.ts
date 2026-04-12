"use client";

import { useEffect, useState } from "react";

export function usePreviewSyncPayload<T>(initialPayload: T | null, messageType: string): T | null {
  const [payload, setPayload] = useState<T | null>(initialPayload);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data.type !== messageType) {
        return;
      }

      const nextPayload = event.data.payload as T;
      if (nextPayload) {
        setPayload(nextPayload);
      }
    };

    window.addEventListener("message", handleMessage);

    // Signal to the parent frame that this preview page is ready to receive
    // the payload. This handles the race condition where the parent fires
    // postMessage on iframe onLoad before React has hydrated.
    if (window.parent !== window) {
      window.parent.postMessage({ type: `${messageType}:READY` }, "*");
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [messageType]);

  return payload;
}
