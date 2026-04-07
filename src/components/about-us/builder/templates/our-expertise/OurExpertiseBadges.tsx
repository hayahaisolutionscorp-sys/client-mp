import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurExpertiseBadgesProps {
  content: IAboutUsSection | null;
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

export default function OurExpertiseBadges({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurExpertiseBadgesProps) {
  // Don't render if there's no content at all
  if (!content) {
    return null;
  }

  return (
    <section
      className="rounded-[32px] border border-slate-200 p-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div
        className="px-8 py-6 border-b"
        style={{
          backgroundColor: `${primaryColor}08`,
          borderColor: `${primaryColor}20`
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
            Our Expertise
          </p>
        </div>
      </div>
      <div className="px-8 py-8 md:px-10">
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
      </div>
    </section>
  );
}
