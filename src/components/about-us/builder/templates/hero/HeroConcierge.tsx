import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroConciergeProps {
  hero: IAboutUsSection | null;
  aboutPageTitle: string;
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
 * Concierge hero for About Us page — dark navy full-bleed with gold serif headline
 * and an editorial left-right asymmetric layout. 
 */
export default function HeroConcierge({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroConciergeProps) {
  return (
    <section
      className="relative overflow-hidden rounded-xl py-20 md:py-28 px-8 md:px-16"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, #e9c17640 0%, transparent 50%), radial-gradient(circle at 10% 80%, #ffffff15 0%, transparent 40%)`,
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
            About Us
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="text-4xl md:text-6xl font-serif leading-tight mb-6"
            style={{ color: '#f0f4f8' }}
          >
            {hero?.title || aboutPageTitle}
          </motion.h1>

          {/* Gold divider line */}
          <div className="w-16 h-0.5 rounded-full mb-8" style={{ backgroundColor: '#e9c176' }} />
        </div>

        {hero?.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="prose text-base font-light leading-relaxed"
            style={{ color: 'rgba(240,244,248,0.75)' }}
            dangerouslySetInnerHTML={renderRichText(hero.description)}
          />
        )}
      </div>
    </section>
  );
}
