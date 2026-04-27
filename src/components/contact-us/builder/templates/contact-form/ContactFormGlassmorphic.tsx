'use client';

import ContactUsForm from '@/components/contact-us/ContactUsForm';
import { Mail } from 'lucide-react';

interface ContactFormGlassmorphicProps {
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactFormGlassmorphic({
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactFormGlassmorphicProps) {
  return (
    <section className="relative px-4 py-16 overflow-visible w-full">
      {/* Blurred background accents under the form */}
      <div 
        className="absolute left-1/2 top-1/3 -z-10 h-[400px] w-full max-w-3xl -translate-x-1/2 rounded-full blur-[120px] opacity-20"
        style={{ backgroundColor: primaryColor }}
      />
      
      <div
        className="mx-auto max-w-3xl rounded-[2.5rem] border border-white/20 p-8 md:p-14 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-3xl relative z-10"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-inner border border-white/40"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            <Mail className="h-8 w-8" />
          </div>
          <p
            className="text-xs font-bold uppercase tracking-[0.24em] drop-shadow-sm"
            style={{ color: primaryColor }}
          >
            Send us a message
          </p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-5xl tracking-tight leading-tight" style={{ color: textColor }}>
            We'd love to hear from you
          </h2>
          <p className="mt-4 text-lg font-medium" style={{ color: mutedColor }}>
            Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
        
        <div className="mt-10 rounded-2xl bg-white/60 p-6 md:p-8 border border-white/50 shadow-sm backdrop-blur-md">
          <ContactUsForm />
        </div>
      </div>
    </section>
  );
}
