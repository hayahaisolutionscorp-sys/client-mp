import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface WelcomeQuoteProps {
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

export default function WelcomeQuote({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: WelcomeQuoteProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div className="relative">
        <div
          className="absolute -left-2 -top-2 text-6xl font-bold opacity-10"
          style={{ color: primaryColor }}
        >
          "
        </div>
        <div className="relative pl-8">
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: primaryColor }}
          >
            Welcome
          </p>
          {content?.title ? (
            <h2 className="mt-4 text-3xl font-bold italic" style={{ color: textColor }}>
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
      </div>
    </section>
  );
}
