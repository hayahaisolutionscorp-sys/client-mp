import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryMilestoneProps {
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

export default function OurStoryMilestone({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurStoryMilestoneProps) {
  if (!content) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      {/* Header with decorative element */}
      <div className="relative px-8 py-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
              Our Story
            </p>
            {content?.title ? (
              <h2 className="mt-1 text-2xl font-bold" style={{ color: textColor }}>
                {content.title}
              </h2>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 md:px-10">
        {content?.description ? (
          <div
            className="prose max-w-none"
            style={{ color: mutedColor }}
            dangerouslySetInnerHTML={renderRichText(content.description)}
          />
        ) : null}
      </div>
    </section>
  );
}
