"use client";

import { useEffect, useState } from "react";
import AboutPageBuilder from "@/components/about-us/builder/AboutPageBuilder";
import type { ICoreValue } from "@/models";
import type { IAboutUsSection } from "@/services/content/about-us.service";
import type { AboutPreviewPayload } from "@/lib/preview/about-preview";

interface AboutPreviewClientProps {
  initialPayload: AboutPreviewPayload;
}

export default function AboutPreviewClient({ initialPayload }: AboutPreviewClientProps) {
  const [payload, setPayload] = useState<AboutPreviewPayload>(initialPayload);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data.type !== "AYAHAY_ABOUT_PREVIEW_SYNC") {
        return;
      }

      const rawPayload = event.data.payload as AboutPreviewPayload;
      if (rawPayload) {
        setPayload(rawPayload);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <AboutPageBuilder
      aboutPage={payload.page}
      sections={(payload.sections ?? []) as IAboutUsSection[]}
      coreValues={(payload.coreValues ?? []) as ICoreValue[]}
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
      branding={(payload.config ?? null) as any}
    />
  );
}
