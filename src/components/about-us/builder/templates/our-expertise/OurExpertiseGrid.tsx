import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurExpertiseGridProps {
  content: IAboutUsSection | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

export default function OurExpertiseGrid({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: OurExpertiseGridProps) {
  // Don't render if there's no content at all
  if (!content) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <svg className="h-8 w-8" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
            Our Expertise
          </p>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: textColor }}>
            {content?.title || 'What We Do Best'}
          </h2>
          {content?.description ? (
            <div
              className="prose mt-4 max-w-none"
              style={{ color: mutedColor }}
              dangerouslySetInnerHTML={renderRichText(content.description)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
