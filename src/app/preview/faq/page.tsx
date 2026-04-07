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

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return <FaqPreviewClient initialPayload={initialPayload} />;
}
