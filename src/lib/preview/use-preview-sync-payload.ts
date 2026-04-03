"use client";

import { useEffect, useState } from "react";

export function usePreviewSyncPayload<T>(initialPayload: T, messageType: string) {
  const [payload, setPayload] = useState<T>(initialPayload);

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
    return () => window.removeEventListener("message", handleMessage);
  }, [messageType]);

  return payload;
}
