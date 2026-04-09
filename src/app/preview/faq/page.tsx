import FaqPreviewClient from "./FaqPreviewClient";
import { getFaqDraft } from "@/lib/preview/faq-draft-store";

interface FaqPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function FaqPreviewPage({ searchParams }: FaqPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getFaqDraft(draftId) : null;

  return <FaqPreviewClient initialPayload={initialPayload} />;
}
