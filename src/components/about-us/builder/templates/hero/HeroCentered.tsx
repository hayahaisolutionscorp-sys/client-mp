import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroCenteredProps {
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

export default function HeroCentered({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroCenteredProps) {
  return (
    <section
      className="rounded-[28px] border border-slate-200 px-8 py-16 text-center shadow-sm md:px-12 md:py-20"
      style={{ backgroundColor: surfaceColor }}
    >
      <div className="mx-auto max-w-3xl">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
          About Us
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textColor }}>
          {hero?.title || aboutPageTitle}
        </h1>
        {hero?.description ? (
          <div
            className="prose prose-lg mt-6 max-w-none"
            style={{ color: mutedColor }}
            dangerouslySetInnerHTML={renderRichText(hero.description)}
          />
        ) : null}
      </div>
    </section>
  );
}
