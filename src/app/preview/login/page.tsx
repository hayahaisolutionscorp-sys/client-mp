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

  if (!initialPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF8FC] text-slate-500">
        Preview draft not found.
      </div>
    );
  }

  return <LoginPreviewClient initialPayload={initialPayload} />;
}
