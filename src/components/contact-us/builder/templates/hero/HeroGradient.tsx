import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroGradientProps {
  hero: IContactSection | null;
  contactPageTitle: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  textOnPrimary: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

export default function HeroGradient({
  hero,
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
  textOnPrimary,
}: HeroGradientProps) {
  if (!hero) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-[32px] px-8 py-16 shadow-xl md:px-12 md:py-20"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
      <div className="relative max-w-3xl" style={{ color: textOnPrimary }}>
        <p
          className="text-xs font-bold uppercase tracking-[0.28em] opacity-80"
          style={{ color: textOnPrimary }}
        >
          Contact Us
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textOnPrimary }}>
          {hero?.title || contactPageTitle}
        </h1>
        {hero?.subtitle ? (
          <p className="mt-3 text-xl font-medium opacity-90" style={{ color: textOnPrimary }}>
            {hero.subtitle}
          </p>
        ) : null}
        {hero?.description ? (
          <div
            className="prose mt-5 max-w-none opacity-90"
            style={{ color: textOnPrimary }}
            dangerouslySetInnerHTML={renderRichText(hero.description)}
          />
        ) : null}
      </div>
    </section>
  );
}
