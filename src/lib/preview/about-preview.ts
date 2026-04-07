import type { PreviewGeneralConfig, PreviewPageSection, PreviewSectionCard } from "./landing-preview";

export interface PreviewAboutPage {
  id: string;
  title: string;
  content: unknown | null;
  slug: string;
}

export interface AboutPreviewPayload {
  page: PreviewAboutPage | null;
  sections?: PreviewPageSection[];
  coreValues?: PreviewSectionCard[];
  config?: PreviewGeneralConfig | null;
}
