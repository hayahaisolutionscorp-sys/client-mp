import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroOverlayProps {
  hero: IAboutUsSection | null;
  aboutPageTitle: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

export default function HeroOverlay({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
}: HeroOverlayProps) {
  return (
    <section className="relative min-h-[480px] overflow-hidden rounded-[32px] shadow-xl">
      {hero?.bg_url ? (
        <Image
          src={hero.bg_url}
          alt={hero.bg_alt || hero.title || aboutPageTitle}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: `${primaryColor}40` }} />
      <div className="relative flex min-h-[480px] items-center justify-center px-8 py-16 text-center">
        <div className="max-w-4xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
            About Us
          </p>
          <h1 className="mt-4 text-5xl font-bold md:text-6xl">
            {hero?.title || aboutPageTitle}
          </h1>
          {hero?.description ? (
            <div
              className="prose prose-invert prose-lg mt-6 max-w-none text-white/95"
              dangerouslySetInnerHTML={renderRichText(hero.description)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
