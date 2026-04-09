import { SEO_API } from "constants/api";
import { IS_BUILD_TIME } from "../config";
import { DEFAULT_LOGIN_BUILDER_CONTENT, type LoginBuilderContent } from "@/lib/login-builder";

export interface ILoginPage {
  id: string;
  page_type: string;
  title: string;
  content: LoginBuilderContent | null;
  show_in_footer: boolean;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

const FALLBACK_LOGIN_PAGE: ILoginPage = {
  id: "login-fallback",
  page_type: "login",
  title: "Sign In",
  content: DEFAULT_LOGIN_BUILDER_CONTENT,
  show_in_footer: false,
  slug: "login",
  created_at: null,
  updated_at: null,
};

export async function getLoginPage(): Promise<ILoginPage> {
  if (IS_BUILD_TIME) {
    return FALLBACK_LOGIN_PAGE;
  }

  try {
    const res = await fetch(`${SEO_API}/login`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch login page:", res.status, res.statusText);
      return FALLBACK_LOGIN_PAGE;
    }
    const { data } = await res.json();
    return data;
  } catch (error) {
    if (typeof window === "undefined") {
      console.error("Error fetching login page:", error);
    }
    return FALLBACK_LOGIN_PAGE;
  }
}
