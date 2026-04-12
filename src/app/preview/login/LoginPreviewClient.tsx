import type { LoginPreviewPayload } from "@/lib/preview/login-preview";
import { PreviewPageShell } from "@/lib/preview/PreviewPageShell";

interface LoginPreviewClientProps {
  initialPayload: LoginPreviewPayload | null;
}

export default function LoginPreviewClient({ initialPayload }: LoginPreviewClientProps) {
  return (
    <PreviewPageShell
      initialPayload={initialPayload}
      messageType="AYAHAY_LOGIN_PREVIEW_SYNC"
      pageKey="login"
    />
  );
}
