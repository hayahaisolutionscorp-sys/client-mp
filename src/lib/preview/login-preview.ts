import type { PreviewGeneralConfig } from "./landing-preview";

export interface PreviewLoginPage {
  id: string;
  title: string;
  content: unknown | null;
  slug: string;
}

export interface LoginPreviewPayload {
  page: PreviewLoginPage | null;
  config?: PreviewGeneralConfig | null;
}
