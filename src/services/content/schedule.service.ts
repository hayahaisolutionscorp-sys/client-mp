import { SEO_API } from "constants/api";
import { IS_BUILD_TIME } from "../config";
import {
  DEFAULT_SCHEDULE_BUILDER_CONTENT,
  type ScheduleBuilderContent,
} from "@/lib/schedule-builder";

export interface ISchedulePage {
  id: string;
  page_type: string;
  title: string;
  content: ScheduleBuilderContent | null;
  seo_config: Record<string, unknown> | null;
  header_config: Record<string, unknown> | null;
  show_in_footer: boolean;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

const FALLBACK_SCHEDULE_PAGE: ISchedulePage = {
  id: "schedule-fallback",
  page_type: "schedule",
  title: "Schedule and Fares",
  content: DEFAULT_SCHEDULE_BUILDER_CONTENT,
  seo_config: null,
  header_config: null,
  show_in_footer: false,
  slug: "schedule-and-fares",
  created_at: null,
  updated_at: null,
};

export async function getSchedulePage(): Promise<ISchedulePage> {
  if (IS_BUILD_TIME) {
    return FALLBACK_SCHEDULE_PAGE;
  }

  try {
    const response = await fetch(`${SEO_API}/schedule-and-fares`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return FALLBACK_SCHEDULE_PAGE;
    }

    const { data } = await response.json();
    return data ?? FALLBACK_SCHEDULE_PAGE;
  } catch (error) {
    if (typeof window === "undefined") {
      console.error("Error fetching schedule page:", error);
    }
    return FALLBACK_SCHEDULE_PAGE;
  }
}
