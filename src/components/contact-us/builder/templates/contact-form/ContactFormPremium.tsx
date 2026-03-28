'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';

interface ContactFormPremiumProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  textOnPrimary: string;
}

export default function ContactFormPremium({
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  textOnPrimary,
}: ContactFormPremiumProps) {
  return (
    <section className="overflow-hidden rounded-[28px] shadow-xl">
      <div
        className="px-8 py-10 md:px-12"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}cc 100%)` }}
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5" style={{ color: textOnPrimary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p
              className="text-xs font-bold uppercase tracking-[0.24em] opacity-90"
              style={{ color: textOnPrimary }}
            >
              Let&apos;s Talk
            </p>
          </div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl" style={{ color: textOnPrimary }}>
            Start a Conversation
          </h2>
          <p className="mt-3 opacity-90" style={{ color: textOnPrimary }}>
            Have questions or ideas? We&apos;re ready to listen and help you find the right solutions.
          </p>
        </div>
      </div>
      <div
        className="px-8 py-10 md:px-12"
        style={{ backgroundColor: surfaceColor, color: textColor }}
      >
        <ContactUsForm />
      </div>
    </section>
  );
}
