import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaMobileAlt, FaTwitter } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

import ContactUsForm from "@/components/contact-us/ContactUsForm";
import { createBuilderTheme } from "@/components/landing/builder/theme";
import { Button } from "@/components/ui/Button";
import { getReadableTextColor } from "@/lib/color-utils";
import { normalizeContactBuilderContent } from "@/lib/contact-builder";
import type { IBrandingConfig, IThemeSettings } from "@/models";
import type { IContactInformation } from "@/models";
import type { IContactPage, IContactSection } from "@/services/content/contact-us.service";

type ContactRenderableSectionKey = "hero" | "contact_info" | "contact_form";

const RENDERABLE_SECTION_KEYS = new Set<ContactRenderableSectionKey>([
  "hero",
  "contact_info",
  "contact_form",
]);

function ContactIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case "facebook":
      return <FaFacebook className="text-xl shrink-0" style={{ color }} />;
    case "instagram":
      return <FaInstagram className="text-xl shrink-0" style={{ color }} />;
    case "twitter":
      return <FaTwitter className="text-xl shrink-0" style={{ color }} />;
    case "linkedin":
      return <FaLinkedin className="text-xl shrink-0" style={{ color }} />;
    case "email":
      return <MdOutlineMail className="text-xl shrink-0" style={{ color }} />;
    case "address":
      return <FaMapMarkerAlt className="text-xl shrink-0" style={{ color }} />;
    default:
      return <FaMobileAlt className="text-xl shrink-0" style={{ color }} />;
  }
}

function ContactInfoList({
  contacts,
  variant,
  primaryColor,
  cardBackgroundColor,
  cardTextColor,
  cardMutedTextColor,
}: {
  contacts: IContactInformation[];
  variant: string;
  primaryColor: string;
  cardBackgroundColor: string;
  cardTextColor: string;
  cardMutedTextColor: string;
}) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-sm text-slate-500">
        No contact details have been added yet.
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-[24px] px-5 py-5 shadow-sm"
            style={{ backgroundColor: cardBackgroundColor, color: cardTextColor }}
          >
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <ContactIcon type={contact.type} color={getReadableTextColor(primaryColor)} />
            </div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: cardMutedTextColor }}>{contact.type}</p>
            <p className="mt-2 text-lg font-semibold">{contact.label || contact.value}</p>
            {["facebook", "instagram", "twitter", "linkedin"].includes(contact.type) ? (
              <a href={contact.value} target="_blank" rel="noreferrer" className="mt-2 block text-sm hover:underline" style={{ color: cardMutedTextColor }}>
                {contact.value}
              </a>
            ) : (
              <p className="mt-2 text-sm" style={{ color: cardMutedTextColor }}>{contact.value}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {contacts.map((contact) => (
        <li
          key={contact.id}
          className="flex items-start gap-4 rounded-[20px] px-5 py-4"
          style={{ backgroundColor: cardBackgroundColor, color: cardTextColor }}
        >
          <div
            className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <ContactIcon type={contact.type} color={getReadableTextColor(primaryColor)} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: cardMutedTextColor }}>{contact.type}</p>
            <p className="mt-1 font-semibold">{contact.label || contact.value}</p>
            {["facebook", "instagram", "twitter", "linkedin"].includes(contact.type) ? (
              <a href={contact.value} target="_blank" rel="noreferrer" className="mt-1 block text-sm hover:underline" style={{ color: cardMutedTextColor }}>
                {contact.value}
              </a>
            ) : (
              <p className="mt-1 text-sm" style={{ color: cardMutedTextColor }}>{contact.value}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface ContactPageContentProps {
  contactPage: IContactPage | null;
  sections: IContactSection[];
  contacts: IContactInformation[];
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export function ContactPageContent({
  contactPage,
  sections,
  contacts,
  themeSettings,
  branding,
}: ContactPageContentProps) {
  const builderConfig = normalizeContactBuilderContent(contactPage?.content);
  const theme = createBuilderTheme((branding ?? {}) as IBrandingConfig);
  const primaryColor = themeSettings?.primary || theme.primary;
  const secondaryColor = themeSettings?.secondary || theme.secondary;
  const surfaceColor = themeSettings?.surface || theme.surface;
  const surfaceAltColor = themeSettings?.surfaceAlt || theme.surfaceAlt;
  const textOnSurface = getReadableTextColor(surfaceColor);
  const mutedOnSurface = textOnSurface === "#f8fafc" ? "#cbd5e1" : "#64748b";
  const cardBackgroundColor = primaryColor;
  const cardTextColor = getReadableTextColor(cardBackgroundColor);
  const cardMutedTextColor = cardTextColor === "#f8fafc" ? "#e2e8f0" : "#334155";
  const orderedSections = builderConfig.sections.filter(
    (section): section is (typeof builderConfig.sections)[number] & { section_key: ContactRenderableSectionKey } =>
      section.enabled && RENDERABLE_SECTION_KEYS.has(section.section_key as ContactRenderableSectionKey)
  );
  const sectionByType = new Map(sections.map((section) => [section.type, section]));
  const orderedContacts = [...contacts]
    .filter((contact) => contact.is_active !== false)
    .sort((left, right) => (left.display_order || 0) - (right.display_order || 0));
  const hero = sectionByType.get("hero");
  const contactInfoSection = sectionByType.get("contact_info");
  const contactFormSection = sectionByType.get("contact_form");
  const heroEnabled = orderedSections.some((section) => section.section_key === "hero");
  const heroTextColor = hero?.bg_url ? "#f8fafc" : getReadableTextColor(primaryColor);
  const heroMutedTextColor = heroTextColor === "#f8fafc" ? "#e2e8f0" : "#334155";

  return (
    <div style={{ backgroundColor: surfaceAltColor, color: getReadableTextColor(surfaceAltColor) }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        {!heroEnabled ? (
          <div className="rounded-[28px] px-8 py-10 shadow-sm" style={{ backgroundColor: surfaceColor }}>
            <h1 className="text-4xl font-bold" style={{ color: textOnSurface }}>{contactPage?.title || "Contact Us"}</h1>
          </div>
        ) : null}

        {orderedSections.map((section) => {
          switch (section.section_key) {
            case "hero":
              return (
                <section
                  key={section.id}
                  className="relative overflow-hidden rounded-[32px] px-8 py-14 shadow-xl md:px-12 md:py-16"
                  style={{
                    backgroundImage: hero?.bg_url
                      ? `linear-gradient(135deg, rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.32)), url('${hero.bg_url}')`
                      : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    color: heroTextColor,
                  }}
                >
                  <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: heroMutedTextColor }}>Contact Us</p>
                    <h1 className="mt-4 text-4xl font-bold md:text-5xl">{hero?.title || contactPage?.title || "Contact Us"}</h1>
                    {hero?.subtitle ? <p className="mt-4 text-lg" style={{ color: heroMutedTextColor }}>{hero.subtitle}</p> : null}
                  </div>
                </section>
              );
            case "contact_form":
              return (
                <section
                  key={section.id}
                  className="grid gap-8 rounded-[28px] px-6 py-8 shadow-sm md:grid-cols-[0.95fr_1.05fr] md:px-8 md:py-10"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                      Send a Message
                    </p>
                    <h2 className="mt-3 text-3xl font-bold" style={{ color: textOnSurface }}>
                      {contactFormSection?.title || "How can we help?"}
                    </h2>
                    <p className="mt-4" style={{ color: mutedOnSurface }}>
                      {contactFormSection?.description || "Tell us what you need and our team will get back to you."}
                    </p>
                    <div className="mt-6">
                      <Button variant="default">Talk to Our Team</Button>
                    </div>
                  </div>
                  <ContactUsForm />
                </section>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
