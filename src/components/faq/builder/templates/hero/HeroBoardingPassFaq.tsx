interface HeroBoardingPassFaqProps {
  title: string;
  description: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function HeroBoardingPassFaq({
  title,
  description,
  primaryColor,
  textColor,
  mutedColor,
}: HeroBoardingPassFaqProps) {
  const d = new Date();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(d.getDate()).padStart(2, '0');
  const yr = d.getFullYear();

  return (
    <section className="relative w-full px-3 py-8 sm:py-10">
      <div
        className="mx-auto max-w-4xl relative rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]"
        style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textColor }}>
            ❓ Info Desk · {month} {day}
          </span>
          <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-[0.25em] font-black px-2 py-1 border-2 rotate-[-3deg]"
            style={{ borderColor: primaryColor, color: primaryColor }}>
            ★ Gate · FAQ
          </span>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-12 text-center flex flex-col items-center gap-5">
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight max-w-2xl" style={{ color: textColor, fontFamily: 'var(--font-title)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: mutedColor }}>
              {description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] opacity-50" style={{ color: textColor }}>
            <span className="h-px w-8" style={{ backgroundColor: textColor, opacity: 0.3 }} />
            <span>Tear here for answers</span>
            <span className="h-px w-8" style={{ backgroundColor: textColor, opacity: 0.3 }} />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
          <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="block" style={{ backgroundColor: textColor, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap" style={{ color: textColor }}>
            FAQ-{yr.toString().slice(-2)}
          </span>
        </div>
      </div>
    </section>
  );
}
