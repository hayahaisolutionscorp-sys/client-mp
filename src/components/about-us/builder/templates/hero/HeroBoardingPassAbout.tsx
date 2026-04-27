import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroBoardingPassAboutProps {
  hero: IAboutUsSection | null;
  aboutPageTitle: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

function renderRichText(content?: string | null) {
  return { __html: DOMPurify.sanitize(content || '') };
}

export default function HeroBoardingPassAbout({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
}: HeroBoardingPassAboutProps) {
  const d = new Date();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(d.getDate()).padStart(2, '0');
  const yr = d.getFullYear();

  return (
    <section className="relative w-full px-2 py-8">
      <div
        className="relative overflow-hidden rounded-2xl border-2 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)]"
        style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
      >
        {/* Top stub */}
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textColor }}>
            ✦ About · {month} {day} · {yr}
          </span>
          <span
            className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-[0.25em] font-black px-2 py-1 border-2 rotate-[-3deg]"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            ★ Chapter 01
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          {/* Content */}
          <div className="p-6 sm:p-10 flex flex-col gap-5">
            <span
              className="self-start inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Who We Are
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight" style={{ color: textColor, fontFamily: 'var(--font-title)' }}>
              {hero?.title || aboutPageTitle}
            </h1>
            {hero?.subtitle && (
              <p className="text-base sm:text-lg leading-relaxed opacity-85" style={{ color: textColor }}>
                {hero.subtitle}
              </p>
            )}
            {hero?.description && (
              <div
                className="prose prose-sm max-w-none leading-relaxed"
                style={{ color: mutedColor }}
                dangerouslySetInnerHTML={renderRichText(hero.description)}
              />
            )}
          </div>

          {/* Photo stub */}
          {hero?.bg_url ? (
            <div className="relative p-3 sm:p-4 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2" style={{ borderColor: 'rgba(15,23,42,0.12)' }}>
                <Image
                  src={hero.bg_url}
                  alt={hero.bg_alt || ''}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-6 left-6 font-mono text-[9px] uppercase tracking-[0.3em] font-black px-2 py-1 bg-white/90 border-2"
                style={{ borderColor: primaryColor, color: primaryColor }}>
                Photo · 01
              </div>
            </div>
          ) : (
            <div className="relative p-3 sm:p-4 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed hidden lg:block" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
              <div className="aspect-[4/5] rounded-xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-40" style={{ color: textColor }}>
                  ··· No Image ···
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Barcode footer */}
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="block" style={{ backgroundColor: textColor, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap" style={{ color: textColor }}>
            ABT-{yr.toString().slice(-2)}
          </span>
        </div>
      </div>
    </section>
  );
}
