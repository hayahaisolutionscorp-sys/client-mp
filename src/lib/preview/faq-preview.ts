import type { PreviewGeneralConfig } from "./landing-preview";

export interface PreviewFaqPage {
  id: string;
  title: string;
  content: unknown | null;
  slug: string;
}

export interface PreviewFaq {
  id: number;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface FaqPreviewPayload {
  page: PreviewFaqPage | null;
  faqs?: PreviewFaq[];
  config?: PreviewGeneralConfig | null;
}
