import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';
import { Network } from 'lucide-react';

interface OurExpertiseGlassmorphicProps {
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

export default function OurExpertiseGlassmorphic({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: OurExpertiseGlassmorphicProps) {
  if (!content) {
    return null;
  }

  return (
    <section className="relative px-2 py-12 w-full overflow-visible">
      {/* Dynamic blurred background element */}
      <div 
        className="absolute left-1/3 top-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-[120px] opacity-[0.12]"
        style={{ backgroundColor: primaryColor }}
      />
      
      <div
        className="mx-auto max-w-6xl rounded-[3rem] border border-white/20 p-8 md:p-14 shadow-2xl backdrop-blur-[40px] relative z-10"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
      >
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex-1 lg:max-w-md sticky top-10">
                <div
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border border-white/40 backdrop-blur-md"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                    <Network className="h-7 w-7" />
                </div>
                <p
                    className="text-xs font-bold uppercase tracking-widest drop-shadow-sm mb-3"
                    style={{ color: primaryColor }}
                >
                    Our Expertise
                </p>
                {content?.title ? (
                    <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ color: textColor }}>
                    {content.title}
                    </h2>
                ) : null}
            </div>
            
            <div className="flex-1 w-full relative">
                 {/* Internal Glass Card for text */}
                 <div className="rounded-[2rem] border border-white/60 bg-white/60 p-6 md:p-10 shadow-sm backdrop-blur-3xl">
                    {content?.description ? (
                        <div
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-current"
                        style={{ color: mutedColor }}
                        dangerouslySetInnerHTML={renderRichText(content.description)}
                        />
                    ) : null}
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
}
