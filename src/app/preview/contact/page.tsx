export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import ContactPreviewClient from "./ContactPreviewClient";
import { getContactDraft } from "@/lib/preview/contact-draft-store";
interface ContactPreviewPageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}
export default async function ContactPreviewPage({ searchParams }: ContactPreviewPageProps) {
  const params = await searchParams;
  const draftId = params.draftId;
  const initialPayload = draftId ? getContactDraft(draftId) : null;
  return <Suspense><ContactPreviewClient initialPayload={initialPayload} /></Suspense>;
}
