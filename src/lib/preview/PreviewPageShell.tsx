"use client";

import { useLayoutEffect, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";
import AboutPageBuilder from "@/components/about-us/builder/AboutPageBuilder";
import ContactPageBuilder from "@/components/contact-us/builder/ContactPageBuilder";
import FAQPageBuilder from "@/components/faq/builder/FAQPageBuilder";
import { LoginPageBuilder } from "@/components/auth/builder/LoginPageBuilder";
import { PressPageContent } from "@/components/press/PressPageContent";
import type { ICoreValue } from "@/models";
import type { IAboutUsSection } from "@/services/content/about-us.service";
import type { IContactPage, IContactSection } from "@/services/content/contact-us.service";
import type { IContactInformation } from "@/models/content-management/contact-us.model";
import type { IFaq } from "@/models";
import type { IPress } from "@/models";
import type { IPressPage, IPressSection } from "@/services/content/press.service";
import { buildPreviewThemeSettings } from "./theme";
import { usePreviewSyncPayload } from "./use-preview-sync-payload";
import { usePreviewScrollToSection } from "./use-preview-scroll-to-section";
import type { PreviewGeneralConfig } from "./landing-preview";
import type { AboutPreviewPayload } from "./about-preview";
import type { ContactPreviewPayload } from "./contact-preview";
import type { FaqPreviewPayload } from "./faq-preview";
import type { PressPreviewPayload } from "./press-preview";
import type { LoginPreviewPayload } from "./login-preview";
import type { IBrandingConfig } from "@/models";

export type PreviewPageKey = "about" | "contact" | "faq" | "press" | "login";

interface PreviewPageShellProps<TPayload extends { config?: PreviewGeneralConfig | null }> {
  initialPayload: TPayload | null;
  messageType: string;
  pageKey: PreviewPageKey;
  baseBranding?: IBrandingConfig | null;
}

export function PreviewPageShell<TPayload extends { config?: PreviewGeneralConfig | null }>({
  initialPayload,
  messageType,
  pageKey,
  baseBranding = null,
}: PreviewPageShellProps<TPayload>) {
  const { setBranding, setThemeSettings } = useTheme();
  const payload = usePreviewSyncPayload(initialPayload, messageType);
  usePreviewScrollToSection();

  const theme = useMemo(
    () => (payload ? buildPreviewThemeSettings(payload.config ?? null, baseBranding) : null),
    [payload, baseBranding]
  );

  useLayoutEffect(() => {
    if (!theme) return;
    setBranding(theme.branding);
    setThemeSettings(theme.themeSettings);
  }, [theme, setBranding, setThemeSettings]);

  if (!payload) {
    // Standalone visit (no parent iframe sending data) — show a hint instead
    // of a permanent "Loading..." spinner.
    const isStandalone = typeof window !== "undefined" && window.parent === window;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-alt)] text-slate-500 text-sm">
        {isStandalone ? "Open this preview from the TMS editor." : "Loading preview..."}
      </div>
    );
  }

  if (!theme) {
    return null;
  }

  if (pageKey === "about") {
    const aboutPayload = payload as unknown as AboutPreviewPayload;
    return (
      <AboutPageBuilder
        aboutPage={aboutPayload.page}
        sections={(aboutPayload.sections ?? []) as IAboutUsSection[]}
        coreValues={(aboutPayload.coreValues ?? []) as ICoreValue[]}
        themeSettings={theme.themeSettings}
        branding={theme.branding as any}
      />
    );
  }

  if (pageKey === "contact") {
    const contactPayload = payload as unknown as ContactPreviewPayload;
    return (
      <ContactPageBuilder
        contactPage={contactPayload.page as IContactPage}
        sections={(contactPayload.sections ?? []) as IContactSection[]}
        contactInfo={(contactPayload.contacts ?? []) as IContactInformation[]}
        themeSettings={theme.themeSettings}
        branding={theme.branding as any}
      />
    );
  }

  if (pageKey === "faq") {
    const faqPayload = payload as unknown as FaqPreviewPayload;
    const faqs = (faqPayload.faqs ?? []) as IFaq[];
    const categories = Array.from(new Set(faqs.map((item) => item.category)));
    return (
      <FAQPageBuilder
        faqPageContent={faqPayload.page?.content}
        faqs={faqs}
        categories={categories}
        themeSettings={theme.themeSettings}
        branding={theme.branding as any}
      />
    );
  }

  if (pageKey === "login") {
    const loginPayload = payload as unknown as LoginPreviewPayload;
    return (
      <LoginPageBuilder
        loginPage={loginPayload.page as any}
        step="email"
        themeSettings={theme.themeSettings}
        branding={theme.branding as any}
      />
    );
  }

  const pressPayload = payload as unknown as PressPreviewPayload;
  return (
    <PressPageContent
      pressPage={pressPayload.page as IPressPage | null}
      sections={(pressPayload.sections ?? []) as IPressSection[]}
      press={((pressPayload.press ?? []) as IPress[]).filter((item) => item.is_active)}
      themeSettings={theme.themeSettings}
      branding={theme.branding as any}
    />
  );
}
