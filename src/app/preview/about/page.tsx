import AboutPreviewClient from "./AboutPreviewClient";
import { getAboutDraft } from "@/lib/preview/about-draft-store";

interface AboutPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function AboutPreviewPage({ searchParams }: AboutPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getAboutDraft(draftId) : null;

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return <AboutPreviewClient initialPayload={initialPayload} />;
}
