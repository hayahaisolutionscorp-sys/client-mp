import type { ContactPreviewPayload } from "@/lib/preview/contact-preview";
import { PreviewPageShell } from "@/lib/preview/PreviewPageShell";

interface ContactPreviewClientProps {
  initialPayload: ContactPreviewPayload;
}

export default function ContactPreviewClient({ initialPayload }: ContactPreviewClientProps) {
  return (
    <PreviewPageShell
      initialPayload={initialPayload}
      messageType="AYAHAY_CONTACT_PREVIEW_SYNC"
      pageKey="contact"
    />
  );
}
