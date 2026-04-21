import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroBoardingPassContactProps {
  hero: IContactSection | undefined;
  contactPageTitle: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

function renderRichText(content?: string | null) {
  return { __html: DOMPurify.sanitize(content || '') };
}

export default function HeroBoardingPassContact({
  hero,
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
}: HeroBoardingPassContactProps) {
  const d = new Date();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(d.getDate()).padStart(2, '0');
  const yr = d.getFullYear();

  return (
    <section className="relative w-full px-2 py-8">
      <div
        className="relative rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]"
        style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textColor }}>
            ✉ Counter · {month} {day}
          </span>
          <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-[0.25em] font-black px-2 py-1 border-2 rotate-[-3deg]"
            style={{ borderColor: primaryColor, color: primaryColor }}>
            ★ Open · 24/7
          </span>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-12 text-center flex flex-col items-center gap-4">
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight max-w-2xl" style={{ color: textColor, fontFamily: 'var(--font-title)' }}>
            {hero?.title || contactPageTitle}
          </h1>
          {hero?.subtitle && (
            <p className="text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: mutedColor }}>
              {hero.subtitle}
            </p>
          )}
          {hero?.description && (
            <div
              className="prose prose-sm max-w-xl leading-relaxed"
              style={{ color: mutedColor }}
              dangerouslySetInnerHTML={renderRichText(hero.description)}
            />
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="block" style={{ backgroundColor: textColor, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap" style={{ color: textColor }}>
            MSG-{yr.toString().slice(-2)}
          </span>
        </div>
      </div>
    </section>
  );
}
