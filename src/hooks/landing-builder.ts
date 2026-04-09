"use client";

import { useState, useEffect } from "react";
import { getLandingBuilderContent } from "@/services/content/landing-builder.service";
import type { LandingBuilderContent } from "@/lib/landing-builder";

const LANDING_BUILDER_CACHE_KEY = "landing_builder_config";

const getCachedLandingBuilderConfig = (): LandingBuilderContent | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = localStorage.getItem(LANDING_BUILDER_CACHE_KEY);
  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as LandingBuilderContent;
  } catch (e) {
    console.error("Failed to parse cached landing builder:", e);
    return null;
  }
};

export const useLandingBuilder = (initialConfig: LandingBuilderContent | null = null) => {
  // Only use initialConfig for the initial state to avoid hydration mismatch.
  // localStorage is read in the useEffect below (client-only).
  const [config, setConfig] = useState<LandingBuilderContent | null>(initialConfig);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      // Restore from cache on client mount (not in useState to avoid hydration mismatch)
      const cached = getCachedLandingBuilderConfig();
      if (cached) {
        setConfig(cached);
      }
    }

    getLandingBuilderContent()
      .then((data) => {
        if (data) {
          setConfig(data);
          localStorage.setItem(LANDING_BUILDER_CACHE_KEY, JSON.stringify(data));
        }
      })
      .catch((error) => console.error("Error fetching landing builder:", error));
  }, [initialConfig]);

  return config;
};
