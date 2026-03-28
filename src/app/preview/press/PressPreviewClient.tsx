"use client";

import { useEffect, useState } from "react";

import { PressPageContent } from "@/components/press/PressPageContent";
import type { PressPreviewPayload } from "@/lib/preview/press-preview";
import type { IPress } from "@/models";
import type { IPressPage, IPressSection } from "@/services/content/press.service";

interface PressPreviewClientProps {
  initialPayload: PressPreviewPayload;
}

export default function PressPreviewClient({ initialPayload }: PressPreviewClientProps) {
  const [payload, setPayload] = useState<PressPreviewPayload>(initialPayload);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data.type !== "AYAHAY_PRESS_PREVIEW_SYNC") {
        return;
      }

      const nextPayload = event.data.payload as PressPreviewPayload;
      if (nextPayload) {
        setPayload(nextPayload);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <PressPageContent
      pressPage={payload.page as IPressPage | null}
      sections={(payload.sections ?? []) as IPressSection[]}
      press={((payload.press ?? []) as IPress[]).filter((item) => item.is_active)}
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
