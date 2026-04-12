import { Suspense } from "react";
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
  return <Suspense><SchedulePreviewClient initialPayload={initialPayload} /></Suspense>;
}
