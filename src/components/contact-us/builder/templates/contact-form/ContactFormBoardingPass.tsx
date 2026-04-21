'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';

interface ContactFormBoardingPassProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactFormBoardingPass({
  primaryColor,
  textColor,
  mutedColor,
}: ContactFormBoardingPassProps) {
  const d = new Date();
  const yr = d.getFullYear();

  return (
    <section className="relative w-full px-2 py-8">
      <div
        className="mx-auto max-w-2xl rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]"
        style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textColor }}>
            ✉ Send Message · Ticket #01
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textColor }}>
            Priority
          </span>
        </div>

        <div className="p-5 sm:p-7">
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2 mb-4"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            ★ Message Form
          </span>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: mutedColor }}>
            Fill out the ticket below and a crew member will reach out shortly.
          </p>

          <div className="boarding-pass-contact-form">
            <ContactUsForm />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="block" style={{ backgroundColor: textColor, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap" style={{ color: textColor }}>
            TKT-{yr.toString().slice(-2)}
          </span>
        </div>
      </div>

      <style jsx global>{`
        .boarding-pass-contact-form input,
        .boarding-pass-contact-form textarea,
        .boarding-pass-contact-form select {
          border-radius: 10px !important;
          border: 2px dashed rgba(15, 23, 42, 0.2) !important;
          background: rgba(250, 247, 240, 0.5) !important;
          padding: 10px 12px !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
          font-size: 14px !important;
        }
        .boarding-pass-contact-form input:focus,
        .boarding-pass-contact-form textarea:focus,
        .boarding-pass-contact-form select:focus {
          border-style: solid !important;
          border-color: ${primaryColor} !important;
          outline: none !important;
          box-shadow: 0 0 0 3px ${primaryColor}22 !important;
        }
        .boarding-pass-contact-form label {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
          text-transform: uppercase !important;
          letter-spacing: 0.2em !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          opacity: 0.7;
        }
        .boarding-pass-contact-form button[type="submit"] {
          border-radius: 10px !important;
          border: 2px solid ${primaryColor} !important;
          background: ${primaryColor} !important;
          color: #fff !important;
          text-transform: uppercase !important;
          letter-spacing: 0.25em !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
          font-weight: 900 !important;
          font-size: 12px !important;
          padding: 12px 20px !important;
          box-shadow: 0 4px 0 rgba(15, 23, 42, 0.18) !important;
          transition: transform 0.12s ease, box-shadow 0.12s ease !important;
        }
        .boarding-pass-contact-form button[type="submit"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 0 rgba(15, 23, 42, 0.18) !important;
        }
        .boarding-pass-contact-form button[type="submit"]:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 rgba(15, 23, 42, 0.18) !important;
        }
      `}</style>
    </section>
  );
}
