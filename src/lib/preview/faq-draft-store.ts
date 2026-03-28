import type { FaqPreviewPayload } from "./faq-preview";

const faqDrafts = new Map<string, FaqPreviewPayload>();

export function setFaqDraft(draftId: string, payload: FaqPreviewPayload): void {
  faqDrafts.set(draftId, payload);

  // Auto-cleanup after 15 minutes
  setTimeout(() => {
    faqDrafts.delete(draftId);
  }, 15 * 60 * 1000);
}

export function getFaqDraft(draftId: string): FaqPreviewPayload | null {
  return faqDrafts.get(draftId) ?? null;
}
