import LandingPreviewClient from "./LandingPreviewClient";
import { getLandingDraft } from "@/lib/preview/landing-draft-store";
import { getLandingPageData } from "@/services/content/landing-page.service";

interface LandingPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function LandingPreviewPage({ searchParams }: LandingPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getLandingDraft(draftId) : null;
  const initialLandingData = await getLandingPageData();

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return (
    <LandingPreviewClient 
      initialPayload={initialPayload} 
      initialLandingData={initialLandingData} 
    />
  );
}
