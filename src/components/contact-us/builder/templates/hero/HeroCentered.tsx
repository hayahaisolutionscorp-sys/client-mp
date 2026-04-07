import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroCenteredProps {
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

export default function HeroCentered({
  hero,
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroCenteredProps) {
  if (!hero) {
    return null;
  }

  return (
    <section className="relative min-h-[400px] overflow-hidden rounded-[32px] bg-slate-900 shadow-xl">
      {hero?.bg_url ? (
        <Image
          src={hero.bg_url}
          alt={hero.bg_alt || ''}
          fill
          priority
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      <div className="relative flex min-h-[400px] items-center justify-center px-8 py-12 text-center">
        <div className="max-w-3xl text-white">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
            Contact Us
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            {hero?.title || contactPageTitle}
          </h1>
          {hero?.subtitle ? (
            <p className="mt-3 text-xl font-medium text-white/90">
              {hero.subtitle}
            </p>
          ) : null}
          {hero?.description ? (
            <div
              className="prose prose-invert mx-auto mt-5 max-w-none text-white/90"
              dangerouslySetInnerHTML={renderRichText(hero.description)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
