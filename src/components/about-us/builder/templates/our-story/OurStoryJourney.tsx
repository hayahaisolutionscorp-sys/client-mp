import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryJourneyProps {
  content: IAboutUsSection | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

export default function OurStoryJourney({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  surfaceAltColor,
}: OurStoryJourneyProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div
        className="flex items-center justify-center rounded-[28px] p-8"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
            Our Story
          </p>
        </div>
      </div>

      <div
        className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
        style={{ backgroundColor: surfaceColor, color: textColor }}
      >
        {content?.title ? (
          <h2 className="text-3xl font-bold" style={{ color: textColor }}>
            {content.title}
          </h2>
        ) : null}
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
