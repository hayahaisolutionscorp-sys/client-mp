"use client";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import type { IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";

interface LandingBookingSectionProps {
  variant: string;
  initialPorts?: IPort[];
  initialRoutes?: IRoute[];
}

export default function LandingBookingSection({ variant, initialPorts = [], initialRoutes = [] }: LandingBookingSectionProps) {
  if (variant === "framed") {
    return (
      <section id="Book" className="bg-white px-6 py-12">
        <div className="container mx-auto max-w-7xl">
          <SearchBoxWrapper
            initialTripSearchEnabled={true}
            initialPorts={initialPorts}
            initialRoutes={initialRoutes}
          />
        </div>
      </section>
    );
  }
  return (
    <section id="Book" className="-mt-24 px-6 pb-10 relative z-20">
      <div className="container mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:p-6 md:p-8">
          <SearchBoxWrapper
            initialTripSearchEnabled={true}
            initialPorts={initialPorts}
            initialRoutes={initialRoutes}
            isRelative={true}
          />
        </div>
      </div>
    </section>
  );
}
