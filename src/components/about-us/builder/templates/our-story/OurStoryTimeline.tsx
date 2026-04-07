import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryTimelineProps {
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

export default function OurStoryTimeline({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurStoryTimelineProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
        Our Story
      </p>
      <div className="mt-6 flex gap-5">
        <div className="relative w-6 shrink-0">
          <span className="absolute left-2 top-0 h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span className="absolute left-[11px] top-3 h-[calc(100%-6px)] w-px bg-slate-200" />
        </div>
        <div className="pb-2">
          <h2 className="text-2xl font-bold md:text-3xl" style={{ color: textColor }}>
            {content?.title || 'Our Journey'}
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
