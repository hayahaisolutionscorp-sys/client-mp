'use client';

import { motion, type Variants } from 'framer-motion';
import type { RoutesTemplateProps } from '../../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/**
 * Concierge routes variant — luxury editorial mosaic/masonry grid layout.
 * Primary full-span feature card + smaller cards in a bento-like layout.
 * Matches the "Legendary Routes" section from the Modern Classic Concierge design.
 */
export default function RoutesEditorialGrid({ routes = [], theme }: RoutesTemplateProps) {
  const primary = routes[0];
  const secondary = routes.slice(1, 3);
  const remaining = routes.slice(3, 5);

  const placeholderBg = `linear-gradient(135deg, ${theme.primary}cc 0%, ${theme.accent}99 100%)`;

  return (
    <section className="py-28" style={{ backgroundColor: theme.surface }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif mb-4"
            style={{ color: theme.primary }}
          >
            Popular{' '}
            <span className="italic" style={{ color: theme.secondary }}>
              Routes
            </span>
          </motion.h2>
          <div className="w-20 h-0.5 mx-auto rounded-full" style={{ backgroundColor: theme.secondary }} />
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[480px]">

          {/* Feature block — spans 2 cols & rows */}
          {primary || true ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-xl min-h-[300px]"
              style={{ background: primary ? undefined : placeholderBg }}
            >
              {(primary as any)?.bg_url && (
                <img
                  src={(primary as any).bg_url}
                  alt={(primary as any).name || 'Featured route'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 text-white max-w-sm">
                <span
                  className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.2em] border mb-4 inline-block backdrop-blur-md"
                  style={{ backgroundColor: `${theme.secondary}22`, borderColor: `${theme.secondary}55`, color: '#e9c176' }}
                >
                  Featured Route
                </span>
                <h3 className="text-3xl font-serif mb-3">
                  {(primary as any)?.name || 'Premier Crossing'}
                </h3>
                <p className="text-white/70 text-sm font-light leading-relaxed">
                  {(primary as any)?.description || `${(primary as any)?.origin_port_name || ''} → ${(primary as any)?.destination_port_name || ''}`}
                </p>
              </div>
            </motion.div>
          ) : null}

          {/* Secondary cards */}
          {[...secondary, ...(!secondary.length ? [{} as any, {} as any] : [])].slice(0, 2).map((route: any, i) => (
            <motion.div
              key={route?.id || i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-10 rounded-xl flex flex-col justify-between group transition-colors duration-500 cursor-pointer"
              style={{
                backgroundColor: i === 0 ? `${theme.primary}12` : theme.surfaceAlt,
                color: theme.text,
              }}
            >
              <div>
                <h4 className="text-xl font-serif mb-2" style={{ color: theme.primary }}>
                  {route?.name || (i === 0 ? 'Island Express' : 'Coastal Circuit')}
                </h4>
                <p className="text-sm opacity-60">
                  {route?.origin_port_name ? `${route.origin_port_name} → ${route.destination_port_name}` : (i === 0 ? 'Regular crossings to major islands' : 'Scenic coastal ferry service')}
                </p>
              </div>
              <span
                className="text-2xl font-serif mt-6 self-end opacity-30"
                style={{ color: theme.primary }}
              >
                ↗
              </span>
            </motion.div>
          ))}

          {/* Remaining small span */}
          {remaining.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="md:col-span-2 relative group overflow-hidden rounded-xl min-h-[180px]"
            >
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h4 className="text-xl font-serif text-white tracking-widest uppercase">
                  {remaining.map((r: any) => r.name || 'More Routes').join(' · ')}
                </h4>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
