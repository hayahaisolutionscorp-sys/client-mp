import SchedulePreviewClient from "./SchedulePreviewClient";
import { getScheduleDraft } from "@/lib/preview/schedule-draft-store";

interface SchedulePreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function SchedulePreviewPage({ searchParams }: SchedulePreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getScheduleDraft(draftId) : null;

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return <SchedulePreviewClient initialPayload={initialPayload} />;
}
