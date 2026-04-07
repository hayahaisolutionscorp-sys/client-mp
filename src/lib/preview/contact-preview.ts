import type { PreviewGeneralConfig, PreviewPageSection } from "./landing-preview";

export interface PreviewContactPage {
  id: string;
  title: string;
  content: unknown | null;
  slug: string;
}

export interface PreviewContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  display_order?: number | null;
  is_active?: boolean;
}

export interface ContactPreviewPayload {
  page: PreviewContactPage | null;
  sections?: PreviewPageSection[];
  contacts?: PreviewContactInfo[];
  config?: PreviewGeneralConfig | null;
}
