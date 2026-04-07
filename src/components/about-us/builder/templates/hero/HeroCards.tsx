import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroCardsProps {
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

export default function HeroCards({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroCardsProps) {
  return (
    <section className="relative">
      <div className="relative h-[240px] overflow-hidden rounded-[32px] bg-slate-900 shadow-xl">
        {hero?.bg_url ? (
          <Image
            src={hero.bg_url}
            alt={hero.bg_alt || hero.title || aboutPageTitle}
            fill
            priority
            className="object-cover opacity-40"
          />
        ) : null}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}99)` }} />
      </div>

      <div className="relative -mt-20 px-4">
        <div
          className="rounded-[28px] border border-slate-200 px-8 py-10 shadow-2xl md:px-12"
          style={{ backgroundColor: surfaceColor }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
            About Us
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textColor }}>
            {hero?.title || aboutPageTitle}
          </h1>
          {hero?.description ? (
            <div
              className="prose mt-5 max-w-none"
              style={{ color: mutedColor }}
              dangerouslySetInnerHTML={renderRichText(hero.description)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
