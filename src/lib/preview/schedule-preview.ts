import type { PreviewGeneralConfig } from "./landing-preview";

export interface PreviewSchedulePage {
  id: string;
  title: string;
  content: unknown | null;
  slug: string;
}

export interface SchedulePreviewPayload {
  page: PreviewSchedulePage | null;
  config?: PreviewGeneralConfig | null;
}
