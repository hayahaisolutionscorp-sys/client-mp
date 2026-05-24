import { EFFECTIVE_API_BASE_URL, isEffectiveClientApiMode } from "constants/api";

export interface EnabledProvider {
  provider: string;
  enabled: boolean;
}

function legacyEnabledFromEnv(): string[] {
  const providers = ["google", "facebook"];
  if (isEffectiveClientApiMode) providers.push("hayahai");
  return providers;
}

export async function fetchEnabledProviderNames(): Promise<string[]> {
  try {
    const res = await fetch(`${EFFECTIVE_API_BASE_URL}/auth/providers`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch providers");
    const data: EnabledProvider[] = await res.json();
    return data.filter((p) => p.enabled).map((p) => p.provider);
  } catch {
    return legacyEnabledFromEnv();
  }
}
