import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface HeroDefaultProps {
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

export default function HeroDefault({
  hero,
  aboutPageTitle,
  primaryColor,
  textColor,
  mutedColor,
}: HeroDefaultProps) {
  return (
    <section className="relative min-h-[360px] overflow-hidden rounded-[32px] bg-slate-900 shadow-xl">
      {hero?.bg_url ? (
        <Image
          src={hero.bg_url}
          alt={hero.bg_alt || hero.title || aboutPageTitle}
          fill
          priority
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
      <div className="relative flex min-h-[360px] items-end px-8 py-10 md:px-12">
        <div className="max-w-3xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
            About Us
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            {hero?.title || aboutPageTitle}
          </h1>
          {hero?.description ? (
            <div
              className="prose prose-invert mt-5 max-w-none text-white/90"
              dangerouslySetInnerHTML={renderRichText(hero.description)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
