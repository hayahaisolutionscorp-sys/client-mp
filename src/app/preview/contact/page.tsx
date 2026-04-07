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

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return <ContactPreviewClient initialPayload={initialPayload} />;
}
