"use client";

import { useEffect, useState } from "react";
import { fetchEnabledProviderNames } from "@/lib/oauth-providers";
import { isEffectiveClientApiMode } from "constants/api";

// Returns the list of enabled provider names once fetched, or null while loading.
// Falls back to the legacy env flag if the API is unreachable.
export function useEnabledProviders(): string[] | null {
  const [providers, setProviders] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isEffectiveClientApiMode) {
      // Not a tenant deployment — keep legacy behavior (Google + Facebook always shown)
      setProviders(["google", "facebook"]);
      return;
    }
    fetchEnabledProviderNames().then(setProviders);
  }, []);

  return providers;
}
