import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroMinimalProps {
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

export default function HeroMinimal({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroMinimalProps) {
  return (
    <section
      className="rounded-[28px] border border-slate-200 px-8 py-10 md:px-10 md:py-12 shadow-sm"
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
    </section>
  );
}
