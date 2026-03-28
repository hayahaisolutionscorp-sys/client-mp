import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface WelcomeHighlightProps {
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

export default function WelcomeHighlight({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: WelcomeHighlightProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border-2 p-8 shadow-sm md:p-10"
      style={{ backgroundColor: surfaceColor, borderColor: primaryColor, color: textColor }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        </div>
        <div className="flex-1">
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: primaryColor }}
          >
            Welcome
          </p>
          {content?.title ? (
            <h2 className="mt-2 text-3xl font-bold" style={{ color: textColor }}>
              {content.title}
            </h2>
          ) : null}
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
