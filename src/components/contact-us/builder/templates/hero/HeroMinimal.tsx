import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroMinimalProps {
  hero: IContactSection | null;
  contactPageTitle: string;
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
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroMinimalProps) {
  if (!hero) {
    return null;
  }

  return (
    <section
      className="rounded-[32px] border border-slate-200 px-8 py-12 shadow-sm md:px-12 md:py-16"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.28em]"
        style={{ color: primaryColor }}
      >
        Contact Us
      </p>
      <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textColor }}>
        {hero?.title || contactPageTitle}
      </h1>
      {hero?.subtitle ? (
        <p className="mt-3 text-xl font-medium" style={{ color: mutedColor }}>
          {hero.subtitle}
        </p>
      ) : null}
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
