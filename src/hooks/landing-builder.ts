"use client";

import { useState, useEffect } from "react";
import { getLandingBuilderContent } from "@/services/content/landing-builder.service";
import type { LandingBuilderContent } from "@/lib/landing-builder";

const LANDING_BUILDER_CACHE_KEY = "landing_builder_config";

export const useLandingBuilder = () => {
  const [config, setConfig] = useState<LandingBuilderContent | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(LANDING_BUILDER_CACHE_KEY);
    if (cached) {
      try {
        setConfig(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached landing builder:", e);
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
  }, []);

  return config;
};