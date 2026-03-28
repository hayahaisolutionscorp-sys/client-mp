interface HeroCenteredProps {
  title: string;
  description: string;
  primaryColor: string;
  textOnPrimary: string;
}

export default function HeroCentered({
  title,
  description,
  primaryColor,
  textOnPrimary,
}: HeroCenteredProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[32px] px-8 py-16 text-center shadow-xl md:px-12 md:py-20"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
      <div className="relative mx-auto max-w-3xl" style={{ color: textOnPrimary }}>
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        >
          <svg
            className="h-8 w-8"
            style={{ color: textOnPrimary }}
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
        <h1 className="text-4xl font-bold md:text-5xl" style={{ color: textOnPrimary }}>
          {title}
        </h1>
        <p className="mt-4 text-lg opacity-90" style={{ color: textOnPrimary }}>
          {description}
        </p>
      </div>
    </div>
  );
}
