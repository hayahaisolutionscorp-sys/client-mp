import type { IBrandingConfig } from "@/models/branding.model";
import type { IHeroSection } from "@/services/ui/hero-section.service";
import type { IPromo } from "@/services/ui/promos.service";
import type { IDestination } from "@/services/ui/destinations.service";
import type { IPartner } from "@/services/ui/partners.service";
import type { IWhyChooseReason, IWhyChooseSection } from "@/services/content/features.service";
import type { IGetToKnowData } from "@/services/ui/get-to-know.service";

export interface BuilderThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
}

export interface HeroTemplateProps {
  branding: IBrandingConfig;
  heroSection?: IHeroSection;
  theme: BuilderThemeTokens;
}

export interface BookingTemplateProps {
  theme: BuilderThemeTokens;
}

export interface PromotionsTemplateProps {
  promos: IPromo[];
  theme: BuilderThemeTokens;
}

export interface RoutesTemplateProps {
  routes: IDestination[];
  theme: BuilderThemeTokens;
}

export interface WhyChooseTemplateProps {
  section?: IWhyChooseSection;
  reasons: IWhyChooseReason[];
  theme: BuilderThemeTokens;
}

export interface GetToKnowTemplateProps {
  main: IGetToKnowData;
  mission: IGetToKnowData;
  vision: IGetToKnowData;
  theme: BuilderThemeTokens;
}

export interface PartnersTemplateProps {
  partners: IPartner[];
  theme: BuilderThemeTokens;
}
