import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurExpertiseShowcaseProps {
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

export default function OurExpertiseShowcase({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurExpertiseShowcaseProps) {
  // Don't render if there's no content at all
  if (!content) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div
        className="px-8 py-8 text-white md:px-10"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 70%, #000000))` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">
          Our Expertise
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          {content?.title || 'What We Do Best'}
        </h2>
      </div>
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
