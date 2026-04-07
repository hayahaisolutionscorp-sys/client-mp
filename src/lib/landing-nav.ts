import { NAV_ITEMS } from "constants/index";
import type { IHeaderSection } from "@/models";

export interface LandingNavItem {
  id: string;
  name: string;
  trigger: string;
  redirect_url: string;
}

export type HeaderNavigationConfig = Partial<
  Pick<IHeaderSection, "showPromos" | "showRoutes" | "showResources" | "showAboutUs">
>;

const ITEMS_TO_SKIP = new Set(["WhyChooseUs", "Partner"]);
const HEADER_CONTROLLED_ITEMS = new Set(["Promos", "Routes", "Resources", "AboutUs"]);

export function getFilteredLandingNavItems(
  headerSection?: HeaderNavigationConfig | null
): LandingNavItem[] {
  const navItems = NAV_ITEMS as LandingNavItem[];

  if (!headerSection) {
    return navItems.filter(
      (item) => !ITEMS_TO_SKIP.has(item.id) && !HEADER_CONTROLLED_ITEMS.has(item.id)
    );
  }

  return navItems.filter((item) => {
    if (ITEMS_TO_SKIP.has(item.id)) return false;
    if (item.id === "Promos") return headerSection.showPromos;
    if (item.id === "Routes") return headerSection.showRoutes;
    if (item.id === "Resources") return headerSection.showResources;
    if (item.id === "AboutUs") return headerSection.showAboutUs;
    return true;
  });
}

interface ScrollToLandingTargetArgs {
  id: string;
  pathname: string;
  navigate: (href: string) => void;
  onDone?: () => void;
}

export function scrollToLandingTarget({
  id,
  pathname,
  navigate,
  onDone,
}: ScrollToLandingTargetArgs) {
  const done = () => onDone?.();
  const isHomePath = pathname === "/";

  if (id === "Resources") {
    const resourcesElement = document.getElementById("Resources");
    if (resourcesElement) {
      resourcesElement.scrollIntoView({ behavior: "smooth" });
      done();
      return;
    }

    if (!isHomePath) {
      navigate("/#Resources");
      done();
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
    done();
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
    done();
    return;
  }

  if (!isHomePath) {
    navigate(`/#${id}`);
  }
  done();
}
