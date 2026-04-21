import { SEO_API } from "constants/api";
import { IS_BUILD_TIME, SHOULD_FETCH_REMOTE_WHITELABEL } from "../config";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  normalizeLandingBuilderContent,
  type LandingBuilderContent,
} from "@/lib/landing-builder";

export async function getLandingBuilderContent(): Promise<LandingBuilderContent | null> {
  if (IS_BUILD_TIME) {
    return null;
  }

  if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
    return null;
  }

  try {
    const isBrowser = typeof window !== "undefined";
    const response = await fetchWithTimeout(`${SEO_API}/home`, {
      ...(isBrowser
        ? { cache: "no-store" as RequestCache }
        : { next: { tags: ["landing-builder"], revalidate: 0 } }),
      timeoutMs: 12_000,
    });

    if (!response.ok) {
      return null;
    }

    const { data } = await response.json();
    if (
      !data?.content ||
      typeof data.content !== "object" ||
      data.content.page_key !== "landing" ||
      !Array.isArray(data.content.sections)
    ) {
      return null;
    }

    return normalizeLandingBuilderContent(data.content);
  } catch (error) {
    if (typeof window === "undefined") {
      console.error("Error fetching landing builder config:", error);
    }
    return null;
  }
}
