import LandingPageBuilder from "@/components/landing/builder/LandingPageBuilder";
import { getLandingDraft } from "@/lib/preview/landing-draft-store";
import { normalizeLandingBuilderContent } from "@/lib/landing-builder";

interface LandingPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function LandingPreviewPage({ searchParams }: LandingPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const payload = draftId ? getLandingDraft(draftId) : null;

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  const config = normalizeLandingBuilderContent(payload.builderConfig);

  return (
    <LandingPageBuilder config={config} previewPayload={payload} />
  );
}
