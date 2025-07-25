import { hexToRgb } from 'helpers/theme.helpers';

interface HeroSectionProps {
  backgroundColor: string;
}

export default function FAQHeroSection({ backgroundColor }: HeroSectionProps) {
  return (
    <div
      className="bg-[rgba(var(--bg-color),1)] text-white py-4 sm:py-6 md:py-8 relative mt-[-0rem] md:mt-[-3rem] lg:mt-[-2.5rem]"
      style={
        {
          '--bg-color': hexToRgb(backgroundColor)
        } as React.CSSProperties
      }
    >
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4 animate-fade-in">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
          Find answers to common questions about our maritime travel services
        </p>
      </div>
    </div>
  );
}
