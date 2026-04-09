"use client";

import { useEffect } from "react";

const MESSAGE_TYPE = "AYAHAY_SCROLL_TO_SECTION";

export function usePreviewScrollToSection() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data.type !== MESSAGE_TYPE) {
        return;
      }

      const sectionKey = event.data.sectionKey as string;
      if (!sectionKey) return;

      const element = document.getElementById(`section-${sectionKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
}
