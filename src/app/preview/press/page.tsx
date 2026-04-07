import PressPreviewClient from "./PressPreviewClient";
import { getPressDraft } from "@/lib/preview/press-draft-store";

interface PressPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function PressPreviewPage({ searchParams }: PressPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getPressDraft(draftId) : null;

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return <PressPreviewClient initialPayload={initialPayload} />;
}
