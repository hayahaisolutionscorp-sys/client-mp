"use client";

import { useEffect, useState } from "react";

import ContactPageBuilder from "@/components/contact-us/builder/ContactPageBuilder";
import type { ContactPreviewPayload } from "@/lib/preview/contact-preview";
import type { IContactInformation } from "@/models";
import type { IContactPage, IContactSection } from "@/services/content/contact-us.service";

interface ContactPreviewClientProps {
  initialPayload: ContactPreviewPayload;
}

export default function ContactPreviewClient({ initialPayload }: ContactPreviewClientProps) {
  const [payload, setPayload] = useState<ContactPreviewPayload>(initialPayload);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data.type !== "AYAHAY_CONTACT_PREVIEW_SYNC") {
        return;
      }

      const nextPayload = event.data.payload as ContactPreviewPayload;
      if (nextPayload) {
        setPayload(nextPayload);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <ContactPageBuilder
      contactPage={payload.page as IContactPage}
      sections={(payload.sections ?? []) as IContactSection[]}
      contactInfo={(payload.contacts ?? []) as IContactInformation[]}
      themeSettings={payload.config?.colors ? {
        primary: payload.config.colors.primaryColor || payload.config.colors.primary || "",
        secondary: payload.config.colors.secondaryColor || payload.config.colors.secondary || "",
        accent: payload.config.colors.accent || "",
        primaryColor: payload.config.colors.primaryColor || payload.config.colors.primary || "",
        secondaryColor: payload.config.colors.secondaryColor || payload.config.colors.secondary || "",
        surface: payload.config.colors.surface || "#FFFFFF",
        surfaceAlt: payload.config.colors.surfaceAlt || "#EEF8FC",
        fontStyle: "Jost",
      } : null}
      branding={(payload.config ?? null) as any}
    />
  );
}
