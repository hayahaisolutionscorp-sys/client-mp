import type { PreviewGeneralConfig, PreviewPageSection } from "./landing-preview";

export interface PreviewPressPage {
  id: string;
  title: string;
  content: unknown | null;
  slug: string;
}

export interface PreviewPressRelease {
  id: string;
  title: string;
  content: string | null;
  publish_date: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export interface PressPreviewPayload {
  page: PreviewPressPage | null;
  sections?: PreviewPageSection[];
  press?: PreviewPressRelease[];
  config?: PreviewGeneralConfig | null;
}
