'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';

interface ContactFormSideBySideProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
}

export default function ContactFormSideBySide({
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: ContactFormSideBySideProps) {
  return (
    <section
      className="grid gap-8 overflow-hidden rounded-[28px] border border-slate-200 shadow-lg md:grid-cols-2"
      style={{ backgroundColor: surfaceColor }}
    >
      <div
        className="flex flex-col justify-center px-8 py-10 md:px-10"
        style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: primaryColor }}
        >
          Send Us A Message
        </p>
        <h2 className="mt-4 text-3xl font-bold" style={{ color: textOnSurfaceAlt }}>
          We&apos;d Love to Hear From You
        </h2>
        <p className="mt-4 text-base" style={{ color: textOnSurfaceAlt, opacity: 0.8 }}>
          Whether you have a question, feedback, or just want to say hello, feel free to reach out.
          Our team is here to help and will respond as quickly as possible.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: textOnSurfaceAlt }}>Quick response time</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: textOnSurfaceAlt }}>Professional support</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: textOnSurfaceAlt }}>Secure communication</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-10 md:px-10">
        <ContactUsForm />
      </div>
    </section>
  );
}
