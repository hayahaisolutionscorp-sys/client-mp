import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface WelcomeSpotlightProps {
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

export default function WelcomeSpotlight({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: WelcomeSpotlightProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div
        className="px-8 py-5 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 45%, #ffffff))` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">Welcome</p>
      </div>
      <div className="px-8 py-8 md:px-10">
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
