import { getHeroSections } from "@/services/ui/hero-section.service";
import { getHeadersSections } from "@/services/ui/header-section.service";
import { getPromos } from "@/services/ui/promos.service";
import { getDestinations } from "@/services/ui/destinations.service";
import { getPartners } from "@/services/ui/partners.service";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { getBrandingConfig } from "@/services/ui/branding.service";
import {
  getGetToKnow,
  getGetToKnowMission,
  getGetToKnowVision,
} from "@/services/ui/get-to-know.service";
import { getPorts } from "@/services/shipping-line/port.service";
import { getRoutes } from "@/services/shipping-line/route.service";
import {
  getWhyChooseReasons,
  getWhyChooseSection,
  type IWhyChooseReason,
  type IWhyChooseSection,
} from "@/services/content/features.service";
import type { IBrandingConfig, IHeaderSection, IPort, IThemeSettings } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";
import type { IPromo } from "@/services/ui/promos.service";
import type { IDestination } from "@/services/ui/destinations.service";
import type { IGetToKnowData } from "@/services/ui/get-to-know.service";
import type { IPartner } from "@/services/ui/partners.service";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";

export interface LandingPageData {
  brandingConfig: IBrandingConfig | null;
  themeSettings: IThemeSettings | null;
  headerSection: IHeaderSection | null;
  heroSection: PreviewPageSection | null;
  ports: IPort[];
  bookingRoutes: IRoute[];
  promotions: IPromo[];
  routes: IDestination[];
  whyChooseSection: IWhyChooseSection | null;
  whyChooseReasons: IWhyChooseReason[];
  getToKnowMain: IGetToKnowData | null;
  getToKnowMission: IGetToKnowData | null;
  getToKnowVision: IGetToKnowData | null;
  partners: IPartner[];
}

export async function getLandingPageData(): Promise<LandingPageData> {
  const [
    brandingConfig,
    themeSettings,
    headerSection,
    heroSection,
    ports,
    bookingRoutes,
    promotions,
    routes,
    whyChooseSection,
    whyChooseReasons,
    getToKnowMain,
    getToKnowMission,
    getToKnowVision,
    partnersResponse,
  ] = await Promise.all([
    getBrandingConfig().catch(() => null),
    getThemeSettings().catch(() => null),
    getHeadersSections().catch(() => null),
    getHeroSections().catch(() => null),
    getPorts().catch(() => []),
    getRoutes().catch(() => []),
    getPromos().catch(() => []),
    getDestinations().catch(() => []),
    getWhyChooseSection().catch(() => null),
    getWhyChooseReasons().catch(() => []),
    getGetToKnow().catch(() => null),
    getGetToKnowMission().catch(() => null),
    getGetToKnowVision().catch(() => null),
    getPartners().catch(() => ({ data: [] })),
  ]);

  return {
    brandingConfig,
    themeSettings: themeSettings ?? null,
    headerSection: headerSection ?? null,
    heroSection: heroSection as PreviewPageSection | null,
    ports: ports ?? [],
    bookingRoutes: bookingRoutes ?? [],
    promotions: promotions ?? [],
    routes: routes ?? [],
    whyChooseSection: whyChooseSection ?? null,
    whyChooseReasons: whyChooseReasons ?? [],
    getToKnowMain: getToKnowMain?.data ?? null,
    getToKnowMission: getToKnowMission?.data ?? null,
    getToKnowVision: getToKnowVision?.data ?? null,
    partners: partnersResponse?.data ?? [],
  };
}
