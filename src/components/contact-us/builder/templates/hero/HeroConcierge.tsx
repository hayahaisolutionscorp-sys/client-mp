import { motion } from 'framer-motion';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroConciergeContactProps {
  hero: IContactSection | null;
  contactPageTitle: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

/**
 * Concierge contact hero — editorial dark with asymmetric columns,
 * serif type and gold accent label.
 */
export default function HeroConciergeContact({
  hero,
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroConciergeContactProps) {
  if (!hero) return null;

  return (
    <section
      className="relative overflow-hidden rounded-xl py-20 md:py-28 px-8 md:px-16"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 85% 15%, #e9c17640 0%, transparent 45%), radial-gradient(circle at 15% 85%, #ffffff15 0%, transparent 35%)`,
        }}
      />

      <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="tracking-[0.4em] uppercase text-xs font-bold block mb-6"
            style={{ color: '#e9c176' }}
          >
            Contact Us
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="text-4xl md:text-6xl font-serif leading-tight mb-6"
            style={{ color: '#f0f4f8' }}
          >
            {hero?.title || contactPageTitle}
          </motion.h1>

          {hero?.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-light mb-4"
              style={{ color: 'rgba(240,244,248,0.85)' }}
            >
              {hero.subtitle}
            </motion.p>
          )}

          {/* Gold divider */}
          <div className="w-16 h-0.5 rounded-full mt-6" style={{ backgroundColor: '#e9c176' }} />
        </div>

        {hero?.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose text-base font-light leading-relaxed"
            style={{ color: 'rgba(240,244,248,0.7)' }}
            dangerouslySetInnerHTML={renderRichText(hero.description)}
          />
        )}
      </div>
    </section>
  );
}
