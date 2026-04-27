import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface OurExpertiseBoardingPassProps {
  content: IAboutUsSection | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

function renderRichText(content?: string | null) {
  return { __html: DOMPurify.sanitize(content || '') };
}

export default function OurExpertiseBoardingPass({ content, primaryColor, textColor, mutedColor }: OurExpertiseBoardingPassProps) {
  if (!content) return null;

  return (
    <section className="relative w-full px-2 py-8">
      <div
        className="mx-auto max-w-5xl rounded-2xl border-2 overflow-hidden"
        style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textColor }}>
            ◎ Crew Manifest
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textColor }}>
            Certified
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="p-6 sm:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
            <span
              className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2 mb-5"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              ✦ Our Expertise
            </span>
            {content?.title && (
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-[1.1]" style={{ color: textColor, fontFamily: 'var(--font-title)' }}>
                {content.title}
              </h2>
            )}
            <div className="mt-6 grid grid-cols-3 gap-0 divide-x-2 divide-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
              {['PRO', 'LIC', 'ISO'].map((tag, i) => (
                <div key={tag} className={`text-center ${i === 0 ? 'pr-2' : i === 2 ? 'pl-2' : 'px-2'}`}>
                  <div className="font-black text-xl" style={{ color: primaryColor }}>{tag}</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1" style={{ color: textColor }}>Stamp</div>
                </div>
              ))}
            </div>
          </div>

          {content?.description && (
            <div
              className="prose prose-base max-w-none leading-relaxed p-6 sm:p-10"
              style={{ color: mutedColor }}
              dangerouslySetInnerHTML={renderRichText(content.description)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
