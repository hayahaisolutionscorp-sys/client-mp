"use client";

import { useState } from "react";
import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";

interface LandingBookingSectionProps {
  variant: string;
}

export default function LandingBookingSection({ variant }: LandingBookingSectionProps) {
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);

  if (variant === "framed") {
    return (
      <section id="Book" className="bg-white px-6 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Booking Widget
            </p>
            <h2 className="mt-2 text-3xl font-bold text-customText">
              Same booking inputs, cleaner presentation
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              This variant keeps the exact booking flow and validation while changing the visual shell.
            </p>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 md:p-8">
            <SearchBoxFormContent
              bookingType={bookingType}
              setBookingType={setBookingType}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="Book" className="-mt-24 px-6 pb-10 relative z-20">
      <div className="container mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:p-6 md:p-8">
          <SearchBoxFormContent
            bookingType={bookingType}
            setBookingType={setBookingType}
          />
        </div>
      </div>
    </section>
  );
}
