export interface PreviewGeneralConfig {
  brand_name?: string | null;
  domain_name?: string | null;
  subdomain_name?: string | null;
  favicon_url?: string | null;
  font_family?: string | null;
  font_family_title?: string | null;
  fontFamily?: string | null;
  fontFamilyTitle?: string | null;
  logo?: {
    light?: string;
    dark?: string;
  } | null;
  colors?: {
    primaryColor?: string;
    secondaryColor?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    surface?: string;
    surfaceAlt?: string;
  } | null;
  slogan?: string | null;
  motto?: string | null;
  tagline?: string | null;
}

export interface PreviewPage {
  id: string;
  title: string;
  show_in_footer: boolean;
}

export interface PreviewHeaderConfig {
  showPromos?: boolean;
  showRoutes?: boolean;
  showResources?: boolean;
  showAboutUs?: boolean;
}

export interface PreviewPageSection {
  id: string;
  type: string;
  bg_type: string | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  display_order?: number | null;
}

export interface PreviewTravelPromotion {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_alt: string;
  display_order?: number;
  is_active: boolean;
}

export interface PreviewRouteRecommendation {
  id: string;
  route: string;
  image_url: string;
  image_alt: string;
  display_order?: number;
  is_featured?: boolean;
}

export interface PreviewPartner {
  id: string;
  name: string;
  logo_url: string;
}

export interface PreviewSectionCard {
  id: string;
  title: string;
  description: string;
  icon_url: string;
  icon_alt: string;
  display_order?: number;
  is_active: boolean;
}

export interface LandingPreviewPayload {
  config: PreviewGeneralConfig | null;
  pages?: PreviewPage[];
  sections?: PreviewPageSection[];
  promotions?: PreviewTravelPromotion[];
  routes?: PreviewRouteRecommendation[];
  partners?: PreviewPartner[];
  whyChooseCards?: PreviewSectionCard[];
  headerConfig?: PreviewHeaderConfig | null;
  builderConfig?: unknown;
}
