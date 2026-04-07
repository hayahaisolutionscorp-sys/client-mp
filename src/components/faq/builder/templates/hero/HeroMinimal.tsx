interface HeroMinimalProps {
  title: string;
  description: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function HeroMinimal({
  title,
  description,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroMinimalProps) {
  return (
    <div
      className="rounded-[28px] border border-slate-200 px-8 py-12 shadow-sm md:px-12"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.28em] text-center"
        style={{ color: primaryColor }}
      >
        FAQ
      </p>
      <h1 className="mt-4 text-4xl font-bold text-center md:text-5xl" style={{ color: textColor }}>
        {title}
      </h1>
      <p className="mt-3 text-center text-lg" style={{ color: mutedColor }}>
        {description}
      </p>
    </div>
  );
}
