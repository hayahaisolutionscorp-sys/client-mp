import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import type { IContactSection } from '@/services/content/contact-us.service';

interface HeroGlassmorphicContactProps {
  hero: IContactSection | null;
  contactPageTitle: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

export default function HeroGlassmorphicContact({
  hero,
  contactPageTitle,
  primaryColor,
  textColor,
  mutedColor,
}: HeroGlassmorphicContactProps) {
  if (!hero) {
    return null;
  }

  return (
    <section className="relative min-h-[400px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {hero?.bg_url ? (
          <Image
            src={hero.bg_url}
            alt={hero.bg_alt || ''}
            fill
            priority
            className="object-cover scale-105"
          />
        ) : null}
        
        {/* Soft, vibrant gradients injected over the media */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr mix-blend-multiply opacity-80"
          style={{ backgroundImage: `linear-gradient(to top right, ${primaryColor}, transparent, rgba(0,0,0,0.6))` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--surface)] mix-blend-overlay opacity-60" />

        {/* Decorative Orbs */}
        <div 
           className="absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-20"
           style={{ backgroundColor: primaryColor }}
        />
        <div 
           className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[100px] opacity-10"
           style={{ backgroundColor: '#ffffff' }}
        />
      </div>

      {/* Floating Glass Content Layer */}
      <div className="relative z-10 flex min-h-[400px] items-center justify-center px-6 py-16 md:px-12">
        <div className="w-full max-w-4xl text-center">
          <p 
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-sm"
            style={{ backgroundColor: `${primaryColor}30` }}
          >
            Contact Us
          </p>
          
          <div className="mx-auto rounded-[2rem] border border-white/20 bg-white/10 px-8 py-10 backdrop-blur-xl shadow-xl sm:px-12 transition-all duration-700 ease-out">
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
              {hero?.title || contactPageTitle}
            </h1>
            {hero?.subtitle ? (
              <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-white/90 drop-shadow-sm md:text-xl">
                {hero.subtitle}
              </p>
            ) : null}
            {hero?.description ? (
              <div
                className="prose prose-invert mx-auto mt-5 max-w-2xl text-white/80"
                dangerouslySetInnerHTML={renderRichText(hero.description)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
