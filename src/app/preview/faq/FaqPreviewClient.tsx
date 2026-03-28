"use client";

import { useEffect, useState } from "react";

import FAQPageBuilder from "@/components/faq/builder/FAQPageBuilder";
import type { FaqPreviewPayload } from "@/lib/preview/faq-preview";
import type { IFaq } from "@/models";

interface FaqPreviewClientProps {
  initialPayload: FaqPreviewPayload;
}

export default function FaqPreviewClient({ initialPayload }: FaqPreviewClientProps) {
  const [payload, setPayload] = useState<FaqPreviewPayload>(initialPayload);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data.type !== "AYAHAY_FAQ_PREVIEW_SYNC") {
        return;
      }

      const nextPayload = event.data.payload as FaqPreviewPayload;
      if (nextPayload) {
        setPayload(nextPayload);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const faqs = (payload.faqs ?? []) as IFaq[];
  const categories = Array.from(new Set(faqs.map((item) => item.category)));

  return (
    <FAQPageBuilder
      faqPageContent={payload.page?.content}
      faqs={faqs}
      categories={categories}
      themeSettings={payload.config?.colors ? {
        primary: payload.config.colors.primaryColor || payload.config.colors.primary || "",
        secondary: payload.config.colors.secondaryColor || payload.config.colors.secondary || "",
        accent: payload.config.colors.accent || "",
        primaryColor: payload.config.colors.primaryColor || payload.config.colors.primary || "",
        secondaryColor: payload.config.colors.secondaryColor || payload.config.colors.secondary || "",
        surface: payload.config.colors.surface || "#FFFFFF",
        surfaceAlt: payload.config.colors.surfaceAlt || "#EEF8FC",
        fontStyle: "Jost",
      } : null}
    />
  );
}
