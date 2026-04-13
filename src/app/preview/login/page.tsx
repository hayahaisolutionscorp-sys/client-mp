export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import LoginPreviewClient from "./LoginPreviewClient";
import { getLoginDraft } from "@/lib/preview/login-draft-store";
interface LoginPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}
export default async function LoginPreviewPage({ searchParams }: LoginPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getLoginDraft(draftId) : null;
  return <Suspense><LoginPreviewClient initialPayload={initialPayload} /></Suspense>;
}
