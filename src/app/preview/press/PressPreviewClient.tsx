import type { PressPreviewPayload } from "@/lib/preview/press-preview";
import { PreviewPageShell } from "@/lib/preview/PreviewPageShell";

interface PressPreviewClientProps {
  initialPayload: PressPreviewPayload | null;
}

export default function PressPreviewClient({ initialPayload }: PressPreviewClientProps) {
  return (
    <PreviewPageShell
      initialPayload={initialPayload}
      messageType="AYAHAY_PRESS_PREVIEW_SYNC"
      pageKey="press"
    />
  );
}
