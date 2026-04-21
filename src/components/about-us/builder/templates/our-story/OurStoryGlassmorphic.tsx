import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryGlassmorphicProps {
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

export default function OurStoryGlassmorphic({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurStoryGlassmorphicProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section className="relative px-2 py-12 w-full overflow-hidden">
      <div 
        className="absolute right-1/4 top-1/2 -z-10 h-[400px] w-[600px] -translate-y-1/2 rounded-[100%] blur-[140px] opacity-[0.1]"
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
            <p
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md border shadow-sm"
            style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}25`, color: primaryColor }}
            >
            Our Story
            </p>
            {content?.title ? (
            <h2 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: textColor }}>
                {content.title}
            </h2>
            ) : null}
        </div>

        {content?.description ? (
            <div
                className="prose prose-lg mx-auto rounded-[2.5rem] border border-white/30 bg-white/40 p-8 md:p-12 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-2xl text-base leading-relaxed"
                style={{ color: mutedColor }}
                dangerouslySetInnerHTML={renderRichText(content.description)}
            />
        ) : null}
      </div>
    </section>
  );
}
