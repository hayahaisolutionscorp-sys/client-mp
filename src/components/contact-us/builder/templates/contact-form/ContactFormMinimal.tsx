'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';

interface ContactFormMinimalProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactFormMinimal({
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactFormMinimalProps) {
  return (
    <section
      className="rounded-[28px] px-8 py-10 md:px-12"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: primaryColor }}
          >
            Contact Form
          </p>
          <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>
            Drop Us a Line
          </h2>
        </div>
        <div className="mt-8">
          <ContactUsForm />
        </div>
      </div>
    </section>
  );
}
