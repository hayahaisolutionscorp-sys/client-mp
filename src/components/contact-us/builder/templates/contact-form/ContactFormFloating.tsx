'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';

interface ContactFormFloatingProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactFormFloating({
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactFormFloatingProps) {
  return (
    <section className="relative px-4 py-16">
      <div
        className="mx-auto max-w-3xl rounded-[32px] border-2 px-8 py-12 shadow-2xl md:px-12"
        style={{ backgroundColor: surfaceColor, borderColor: `${primaryColor}40` }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: primaryColor }}
          >
            Contact Form
          </p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl" style={{ color: textColor }}>
            Let&apos;s Connect
          </h2>
          <p className="mt-3" style={{ color: mutedColor }}>
            We&apos;re here to answer your questions and discuss your needs.
          </p>
        </div>
        <div className="mt-8">
          <ContactUsForm />
        </div>
      </div>
    </section>
  );
}
