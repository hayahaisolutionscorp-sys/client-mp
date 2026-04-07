interface HeroCompactProps {
  title: string;
  description: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function HeroCompact({
  title,
  description,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: HeroCompactProps) {
  return (
    <div
      className="rounded-[28px] border-l-4 px-8 py-6 shadow-sm md:px-10"
      style={{ backgroundColor: surfaceColor, borderLeftColor: primaryColor, color: textColor }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <svg
            className="h-6 w-6"
            style={{ color: primaryColor }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: textColor }}>
            {title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: mutedColor }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
