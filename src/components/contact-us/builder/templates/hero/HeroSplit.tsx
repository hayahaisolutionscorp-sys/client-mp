import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroSplitProps {
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

export default function HeroSplit({
  hero,
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroSplitProps) {
  if (!hero) {
    return null;
  }

  return (
    <section
      className="grid gap-8 overflow-hidden rounded-[32px] border border-slate-200 shadow-lg md:grid-cols-2"
      style={{ backgroundColor: surfaceColor }}
    >
      <div className="flex flex-col justify-center px-8 py-10 md:px-12">
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
      </div>
      <div className="relative min-h-[360px]">
        {hero?.bg_url ? (
          <Image
            src={hero.bg_url}
            alt={hero.bg_alt || ''}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-slate-200" />
        )}
      </div>
    </section>
  );
}
