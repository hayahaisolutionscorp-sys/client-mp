import type { FaqPreviewPayload } from "@/lib/preview/faq-preview";
import { PreviewPageShell } from "@/lib/preview/PreviewPageShell";

interface FaqPreviewClientProps {
  initialPayload: FaqPreviewPayload;
}

export default function FaqPreviewClient({ initialPayload }: FaqPreviewClientProps) {
  return (
    <PreviewPageShell
      initialPayload={initialPayload}
      messageType="AYAHAY_FAQ_PREVIEW_SYNC"
      pageKey="faq"
    />
  );
}
