import DOMPurify from 'isomorphic-dompurify';
import type { IAboutUsSection } from '@/services/content/about-us.service';

interface WelcomeGlassmorphicProps {
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

export default function WelcomeGlassmorphic({
  content,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: WelcomeGlassmorphicProps) {
  if (!content?.title && !content?.description) {
    return null;
  }

  return (
    <section className="relative px-2 py-10 w-full overflow-hidden">
      {/* Blurred background accents under the form */}
      <div 
        className="absolute left-1/4 top-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 rounded-[100%] blur-[120px] opacity-[0.15]"
        style={{ backgroundColor: primaryColor }}
      />
      
      <div
        className="mx-auto max-w-4xl rounded-[2.5rem] border border-white/20 p-8 md:p-14 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl relative z-10"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
      >
        <div className="flex flex-col md:flex-row gap-8 lg:gap-14 items-center">
            <div className="flex-1">
                <p
                    className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] backdrop-blur-md border shadow-sm"
                    style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}25`, color: primaryColor }}
                >
                    Welcome
                </p>
                {content?.title ? (
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight drop-shadow-sm" style={{ color: textColor }}>
                    {content.title}
                    </h2>
                ) : null}
            </div>
            
            <div className="flex-1">
                {content?.description ? (
                    <div
                    className="prose prose-lg rounded-2xl bg-white/50 p-6 md:p-8 shadow-inner border border-white/60 backdrop-blur-md text-base leading-relaxed"
                    style={{ color: mutedColor }}
                    dangerouslySetInnerHTML={renderRichText(content.description)}
                    />
                ) : null}
            </div>
        </div>
      </div>
    </section>
  );
}
