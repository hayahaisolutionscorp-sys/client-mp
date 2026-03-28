import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryNarrativeProps {
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

export default function OurStoryNarrative({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurStoryNarrativeProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div
        className="px-8 py-6"
        style={{ background: `linear-gradient(90deg, ${primaryColor}20, ${primaryColor}05)` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
          Our Story
        </p>
      </div>
      <div className="px-8 py-8 md:px-10">
        {content?.title ? (
          <h2 className="text-3xl font-bold" style={{ color: textColor }}>
            {content.title}
          </h2>
        ) : null}
        {content?.description ? (
          <div
            className="prose prose-lg mt-5 max-w-none"
            style={{ color: mutedColor }}
            dangerouslySetInnerHTML={renderRichText(content.description)}
          />
        ) : null}
      </div>
    </section>
  );
}
