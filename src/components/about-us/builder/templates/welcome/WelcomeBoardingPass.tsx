import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface WelcomeBoardingPassProps {
  content: IAboutUsSection | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

function renderRichText(content?: string | null) {
  return { __html: DOMPurify.sanitize(content || '') };
}

export default function WelcomeBoardingPass({ content, primaryColor, textColor, mutedColor }: WelcomeBoardingPassProps) {
  if (!content?.title && !content?.description) return null;

  return (
    <section className="relative w-full px-2 py-8">
      <div
        className="mx-auto max-w-4xl rounded-2xl border-2 overflow-hidden"
        style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textColor }}>
            ✦ Welcome Aboard
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textColor }}>
            Gate · 01
          </span>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6 md:gap-10">
          <div>
            <span
              className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2 rotate-[-3deg] mb-4"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              ★ Welcome
            </span>
            {content?.title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: textColor, fontFamily: 'var(--font-title)' }}>
                {content.title}
              </h2>
            )}
          </div>

          {content?.description && (
            <div
              className="prose prose-sm max-w-none leading-relaxed p-4 rounded-lg border-2 border-dashed"
              style={{ color: mutedColor, borderColor: 'rgba(15,23,42,0.18)', backgroundColor: 'rgba(250,247,240,0.5)' }}
              dangerouslySetInnerHTML={renderRichText(content.description)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
