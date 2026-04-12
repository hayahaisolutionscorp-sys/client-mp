import { SEO_API } from "constants/api";
import { IS_BUILD_TIME } from "../config";
import {
  normalizeLandingBuilderContent,
  type LandingBuilderContent,
} from "@/lib/landing-builder";

export async function getLandingBuilderContent(): Promise<LandingBuilderContent | null> {
  if (IS_BUILD_TIME) {
    return null;
  }

  try {
    const response = await fetch(`${SEO_API}/home`, {
      next: { tags: ['landing-builder'], revalidate: 3600 },
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
