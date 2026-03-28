interface HeroDefaultProps {
  title: string;
  description: string;
  primaryColor: string;
  textOnPrimary: string;
}

export default function HeroDefault({
  title,
  description,
  primaryColor,
  textOnPrimary,
}: HeroDefaultProps) {
  return (
    <div
      className="py-8 md:py-12 relative"
      style={{ backgroundColor: primaryColor, color: textOnPrimary }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          {title}
        </h1>
        <p className="text-center text-lg opacity-90 max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
