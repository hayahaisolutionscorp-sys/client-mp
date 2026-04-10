import { Suspense } from "react";
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
  return <Suspense><AboutPreviewClient initialPayload={initialPayload} /></Suspense>;
}
