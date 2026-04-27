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

  // Map legacy/standardized nav IDs to actual section keys used in LandingPageBuilder
  const sectionIdMap: Record<string, string> = {
    'Book': 'section-booking',
    'Promos': 'section-promotions',
    'Routes': 'section-routes',
    'WhyChooseUs': 'section-why_choose',
    'Partner': 'section-partners',
    'Resources': 'section-footer',
  };

  const targetId = sectionIdMap[id] || id;

  if (id === "Resources") {
    const resourcesElement = document.getElementById("Resources") || document.getElementById("section-footer");
    if (resourcesElement) {
      resourcesElement.scrollIntoView({ behavior: "smooth" });
      done();
      return;
    }

    if (!isHomePath) {
      navigate(`/#${targetId}`);
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

  const element = document.getElementById(targetId) || document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
    done();
    return;
  }

  if (!isHomePath) {
    navigate(`/#${targetId}`);
  }
  done();
}
