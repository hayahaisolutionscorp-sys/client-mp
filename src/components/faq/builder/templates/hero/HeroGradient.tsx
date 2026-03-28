interface HeroGradientProps {
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  textOnPrimary: string;
}

export default function HeroGradient({
  title,
  description,
  primaryColor,
  secondaryColor,
  textOnPrimary,
}: HeroGradientProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[32px] px-8 py-16 shadow-xl md:px-12 md:py-20"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
      <div className="relative max-w-3xl" style={{ color: textOnPrimary }}>
        <p
          className="text-xs font-bold uppercase tracking-[0.28em] opacity-80"
          style={{ color: textOnPrimary }}
        >
          FAQ
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textOnPrimary }}>
          {title}
        </h1>
        <p className="mt-4 text-lg opacity-90" style={{ color: textOnPrimary }}>
          {description}
        </p>
      </div>
    </div>
  );
}
