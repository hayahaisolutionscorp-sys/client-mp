import type { BookingTemplateProps } from "../../types";
import LandingBookingSection from "../../LandingBookingSection";

export default function BookingBanner({ theme }: BookingTemplateProps) {
  return (
    <section
      id="Book"
      className="relative py-16 px-4 sm:px-6 lg:px-10 overflow-hidden"
      style={{ backgroundColor: theme.primary }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
        style={{ backgroundColor: theme.secondary }}
      />
      <div className="relative container mx-auto max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-customText">
            Ready to Set Sail?
          </h2>
          <p className="mt-2 text-customText/70 text-base">
            Search available trips and book your ferry in minutes.
          </p>
        </div>
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
          <LandingBookingSection variant="framed" />
        </div>
      </div>
    </section>
  );
}
