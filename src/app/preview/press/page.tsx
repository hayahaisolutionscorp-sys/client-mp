export const dynamic = 'force-dynamic';
import { Suspense } from "react";
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
  return <Suspense><PressPreviewClient initialPayload={initialPayload} /></Suspense>;
}
