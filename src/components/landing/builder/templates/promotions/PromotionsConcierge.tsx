'use client';

import { motion, type Variants } from 'framer-motion';
import type { PromotionsTemplateProps } from '../../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.11, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/**
 * Concierge promotions variant — editorial mosaic layout.
 * Large feature promo + smaller secondary promo cards.
 * Mirrors "Exclusive Voyages" editorial section from the Stitch design.
 */
export default function PromotionsConcierge({ promos = [], theme }: PromotionsTemplateProps) {
  const main = promos[0];
  const side = promos.slice(1, 3);

  return (
    <section className="py-28" style={{ backgroundColor: `${theme.surfaceAlt}` }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-serif mb-4"
              style={{ color: theme.primary }}
            >
              Exclusive{' '}
              <span className="italic" style={{ color: theme.secondary }}>
                Offers
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-light leading-loose text-base"
              style={{ color: theme.muted }}
            >
              Curated promotions for those who seek the exceptional journey.
            </motion.p>
          </div>

          <motion.a
            href="/promos"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 font-bold pb-1 border-b-2 transition-all group hover:gap-3"
            style={{ color: theme.primary, borderColor: theme.secondary }}
          >
            View All Offers
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.a>
        </div>

        {/* Mosaic grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
          {/* Feature promo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="md:col-span-8 relative group overflow-hidden rounded-xl"
          >
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)` }}
            />
            {(main as any)?.image_url && (
              <img
                src={(main as any).image_url}
                alt={(main as any)?.title || 'Featured Promo'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/80 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12 text-white max-w-lg">
              <span
                className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.2em] border mb-4 inline-block backdrop-blur-sm"
                style={{ backgroundColor: `${theme.secondary}25`, borderColor: `${theme.secondary}55`, color: '#e9c176' }}
              >
                {(main as any)?.badge || 'Limited Time'}
              </span>
              <h3 className="text-3xl md:text-4xl font-serif mb-3">
                {(main as any)?.title || 'Premium Seasonal Offer'}
              </h3>
              <p className="text-white/70 font-light text-sm leading-relaxed mb-6">
                {(main as any)?.description || 'Exclusive rates for select routes — book early to secure the finest experience.'}
              </p>
              <button
                className="px-6 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors text-sm font-semibold"
              >
                View Details
              </button>
            </div>
          </motion.div>

          {/* Side promos */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {(side.length > 0 ? side : [{} as any, {} as any]).slice(0, 2).map((promo: any, i) => (
              <motion.div
                key={promo?.id || i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex-1 relative group overflow-hidden rounded-xl min-h-[200px]"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: i === 0
                      ? `linear-gradient(135deg, ${theme.primary}dd 0%, ${theme.accent}dd 100%)`
                      : `linear-gradient(135deg, ${theme.secondary}cc 0%, ${theme.primary}cc 100%)`,
                  }}
                />
                {promo?.image_url && (
                  <img
                    src={promo.image_url}
                    alt={promo.title || ''}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/60 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h4 className="text-xl font-serif mb-1">
                    {promo?.title || (i === 0 ? 'Weekend Special' : 'Group Discount')}
                  </h4>
                  <p className="text-white/60 text-xs">
                    {promo?.subtitle || (i === 0 ? 'Exclusive weekend rates' : 'Book a party of 4 or more')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
