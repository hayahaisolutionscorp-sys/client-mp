import type { AboutPreviewPayload } from "@/lib/preview/about-preview";
import { PreviewPageShell } from "@/lib/preview/PreviewPageShell";

interface AboutPreviewClientProps {
  initialPayload: AboutPreviewPayload | null;
}

export default function AboutPreviewClient({ initialPayload }: AboutPreviewClientProps) {
  return (
    <PreviewPageShell
      initialPayload={initialPayload}
      messageType="AYAHAY_ABOUT_PREVIEW_SYNC"
      pageKey="about"
    />
  );
}
