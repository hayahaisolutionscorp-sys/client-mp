import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurStoryBoardingPassProps {
  content: IAboutUsSection | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

function renderRichText(content?: string | null) {
  return { __html: DOMPurify.sanitize(content || '') };
}

export default function OurStoryBoardingPass({ content, primaryColor, textColor, mutedColor }: OurStoryBoardingPassProps) {
  if (!content?.title && !content?.description) return null;

  return (
    <section className="relative w-full px-2 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            ★ Our Story
          </span>
          <span className="flex-1 h-[2px] border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.2)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textColor }}>
            Chapter · 02
          </span>
        </div>

        {content?.title && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: textColor, fontFamily: 'var(--font-title)' }}>
            {content.title}
          </h2>
        )}

        {content?.description && (
          <div
            className="relative rounded-2xl border-2 p-6 sm:p-10 shadow-[0_12px_24px_-12px_rgba(15,23,42,0.15)]"
            style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
          >
            {/* Punched corners */}
            <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--surface-alt, #F3EFE4)' }} />
            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--surface-alt, #F3EFE4)' }} />
            <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--surface-alt, #F3EFE4)' }} />
            <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--surface-alt, #F3EFE4)' }} />

            <div
              className="prose prose-lg max-w-none leading-relaxed"
              style={{ color: mutedColor }}
              dangerouslySetInnerHTML={renderRichText(content.description)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
