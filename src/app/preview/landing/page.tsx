export const dynamic = 'force-dynamic';
import { Suspense } from "react";
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

  return (
    <Suspense>
      <LandingPreviewClient 
        initialPayload={initialPayload} 
        initialLandingData={initialLandingData} 
      />
    </Suspense>
  );
}
