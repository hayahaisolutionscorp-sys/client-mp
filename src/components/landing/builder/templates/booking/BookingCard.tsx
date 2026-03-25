import type { BookingTemplateProps } from "../../types";
import LandingBookingSection from "../../LandingBookingSection";

export default function BookingCard({ theme }: BookingTemplateProps) {
  return (
    <section id="Book" className="py-16 px-4 sm:px-6 lg:px-10" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
            Book Now
          </p>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>
            Find Your Trip
          </h2>
        </div>
        <div
          className="rounded-3xl shadow-xl overflow-hidden border"
          style={{ borderColor: `color-mix(in srgb, ${theme.primary} 15%, #e2e8f0)` }}
        >
          <div className="h-2 w-full" style={{ backgroundColor: theme.primary }} />
          <LandingBookingSection variant="framed" />
        </div>
      </div>
    </section>
  );
}
