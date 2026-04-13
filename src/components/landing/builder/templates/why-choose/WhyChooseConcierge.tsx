'use client';

import { motion, type Variants } from 'framer-motion';
import type { WhyChooseTemplateProps } from '../../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/**
 * Concierge why-choose — dark navy editorial section with large serif heading,
 * gold stat counters and a descriptive paragraph. Mirrors the "Brand Heritage" 
 * section of the Modern Classic Concierge Stitch design.
 */
export default function WhyChooseConcierge({
  section,
  reasons = [],
  theme,
}: WhyChooseTemplateProps) {
  const title = (section as any)?.title || 'Why Choose Us';
  const subtitle = (section as any)?.subtitle || 'A legacy of service excellence tailored for the most discerning travelers.';

  return (
    <section
      className="py-28"
      style={{ backgroundColor: theme.primary, color: '#f0f4f8' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-20">

        {/* Left: Text content */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="tracking-[0.4em] uppercase text-xs font-bold mb-8 block"
            style={{ color: theme.secondary }}
          >
            Our Promise
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="text-4xl md:text-5xl font-serif leading-tight mb-8"
          >
            {title}
            {' '}
            <span className="italic" style={{ color: theme.secondary }}>
              redefined.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg font-light leading-relaxed mb-12 opacity-80"
          >
            {subtitle}
          </motion.p>

          {/* Stats */}
          <div className="flex gap-12 flex-wrap">
            {reasons.slice(0, 3).map((reason, i) => (
              <motion.div
                key={reason.id || i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <p className="text-3xl font-serif mb-1" style={{ color: theme.secondary }}>
                  {(reason as any).stat || '—'}
                </p>
                <p className="text-xs uppercase tracking-widest opacity-70">
                  {reason.title}
                </p>
              </motion.div>
            ))}
            {reasons.length === 0 && (
              <>
                {[
                  { stat: '100+', label: 'Routes Served' },
                  { stat: '1M+', label: 'Passengers Yearly' },
                  { stat: '24/7', label: 'Support Available' },
                ].map((item, i) => (
                  <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <p className="text-3xl font-serif mb-1" style={{ color: theme.secondary }}>{item.stat}</p>
                    <p className="text-xs uppercase tracking-widest opacity-70">{item.label}</p>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right: Reason cards */}
        <div className="space-y-4">
          {reasons.slice(0, 4).map((reason, i) => (
            <motion.div
              key={reason.id || i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-1 h-12 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: theme.secondary }}
                />
                <div>
                  <h3 className="font-semibold text-base mb-1">{reason.title}</h3>
                  <p className="text-sm opacity-65 font-light leading-relaxed">{reason.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {reasons.length === 0 && (
            <div className="p-6 rounded-lg border border-white/10 bg-white/5 text-center opacity-50 text-sm">
              Add reasons in the editor to display them here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
