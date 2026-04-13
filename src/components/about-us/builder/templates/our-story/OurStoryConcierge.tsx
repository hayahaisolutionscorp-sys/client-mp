import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryConciergeProps {
  content: IAboutUsSection | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  surfaceAltColor?: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

/**
 * Concierge our-story — dark primary panel on left, rich text on right.
 * Mirrors the "Brand Heritage / Mission Section" from the Stitch design with
 * large counters and an image panel.
 */
export default function OurStoryConcierge({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  surfaceAltColor,
}: OurStoryConciergeProps) {
  if (!content?.title && !content?.description) return null;

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — editorial image/art placeholder */}
        <div className="relative min-h-[280px] lg:min-h-[440px]">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 40%, rgba(233,193,118,0.15) 0%, transparent 60%), linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 80%, #0f172a) 100%)`,
            }}
          />
          {/* Decorative frame */}
          <div className="absolute inset-8 border border-white/10 rounded-sm" />
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-4xl font-serif" style={{ color: '#e9c176' }}>
              Est.
            </p>
            <p className="text-xs uppercase tracking-widest opacity-50 mt-1">Our Heritage</p>
          </div>
        </div>

        {/* Right — content */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="tracking-[0.4em] uppercase text-xs font-bold mb-8 block"
            style={{ color: '#e9c176' }}
          >
            Our Story
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-serif leading-tight mb-8"
            style={{ color: '#f0f4f8' }}
          >
            {content?.title || 'A century of defining maritime prestige.'}
          </motion.h2>

          {content?.description && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="prose prose-invert prose-sm max-w-none text-base font-light leading-loose opacity-80"
              dangerouslySetInnerHTML={renderRichText(content.description)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
