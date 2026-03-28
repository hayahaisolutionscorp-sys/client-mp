import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroSplitProps {
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

export default function HeroSplit({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroSplitProps) {
  return (
    <section
      className="rounded-[32px] overflow-hidden border border-slate-200 shadow-xl"
      style={{ backgroundColor: surfaceColor }}
    >
      <div className="grid md:grid-cols-2">
        <div className="px-8 py-10 md:px-10 md:py-12 flex flex-col justify-center">
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
        <div className="relative min-h-[280px] md:min-h-[420px] bg-slate-100">
          {hero?.bg_url ? (
            <Image
              src={hero.bg_url}
              alt={hero.bg_alt || hero.title || aboutPageTitle}
              fill
              priority
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
        </div>
      </div>
    </section>
  );
}
