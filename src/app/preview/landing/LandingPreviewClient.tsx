"use client";

import { useEffect, useState } from "react";
import LandingPageBuilder from "@/components/landing/builder/LandingPageBuilder";
import { normalizeLandingBuilderContent } from "@/lib/landing-builder";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";
import type { LandingPageData } from "@/services/content/landing-page.service";

interface LandingPreviewClientProps {
  initialPayload: LandingPreviewPayload;
  initialLandingData: LandingPageData | null;
}

export default function LandingPreviewClient({
  initialPayload,
  initialLandingData,
}: LandingPreviewClientProps) {
  const [payload, setPayload] = useState<LandingPreviewPayload>(initialPayload);
  const [config, setConfig] = useState<LandingBuilderContent>(
    normalizeLandingBuilderContent(initialPayload.builderConfig)
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: Trust origin from TMS
      if (typeof event.data !== "object" || event.data.type !== "AYAHAY_LANDING_PREVIEW_SYNC") {
        return;
      }

      const rawPayload = event.data.payload as LandingPreviewPayload;
      if (rawPayload) {
        setPayload(rawPayload);
        setConfig(normalizeLandingBuilderContent(rawPayload.builderConfig));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <LandingPageBuilder 
      config={config} 
      previewPayload={payload} 
      landingData={initialLandingData} 
    />
  );
}
