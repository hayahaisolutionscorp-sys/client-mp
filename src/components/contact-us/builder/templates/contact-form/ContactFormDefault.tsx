'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';

interface ContactFormDefaultProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactFormDefault({
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactFormDefaultProps) {
  return (
    <section
      className="rounded-[28px] border border-slate-200 px-8 py-10 shadow-sm md:px-12"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.24em]"
        style={{ color: primaryColor }}
      >
        Send Us A Message
      </p>
      <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>
        Get In Touch
      </h2>
      <p className="mt-3" style={{ color: mutedColor }}>
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>
      <div className="mt-8">
        <ContactUsForm />
      </div>
    </section>
  );
}
