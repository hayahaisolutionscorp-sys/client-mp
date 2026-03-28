import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurExpertiseChecklistProps {
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

export default function OurExpertiseChecklist({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: OurExpertiseChecklistProps) {
  // Don't render if there's no content at all
  if (!content) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border-2 p-8 shadow-md md:p-10"
      style={{ backgroundColor: surfaceColor, borderColor: primaryColor, color: textColor }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <svg className="h-5 w-5" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p
          className="text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: primaryColor }}
        >
          Our Expertise
        </p>
      </div>
      <h2 className="text-3xl font-bold" style={{ color: textColor }}>
        {content?.title || 'What We Do Best'}
      </h2>
      {content?.description ? (
        <div
          className="prose mt-5 max-w-none"
          style={{ color: mutedColor }}
          dangerouslySetInnerHTML={renderRichText(content.description)}
        />
      ) : null}
    </section>
  );
}
