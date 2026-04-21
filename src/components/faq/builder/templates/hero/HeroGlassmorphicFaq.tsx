interface HeroGlassmorphicFaqProps {
  title: string;
  description: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function HeroGlassmorphicFaq({
  title,
  description,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroGlassmorphicFaqProps) {
  return (
    <section className="relative px-4 py-20 w-full overflow-hidden">
      {/* Decorative Orbs */}
      <div 
         className="absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-[0.08]"
         style={{ backgroundColor: primaryColor }}
      />
      <div 
         className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[100px] opacity-[0.06]"
         style={{ backgroundColor: '#ffffff' }}
      />
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div 
            className="inline-block rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30`, color: primaryColor }}
        >
          Help Center
        </div>
        
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl lg:text-7xl drop-shadow-sm" style={{ color: textColor }}>
          {title}
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium md:text-xl drop-shadow-sm leading-relaxed" style={{ color: mutedColor }}>
          {description}
        </p>
      </div>


    </section>
  );
}
