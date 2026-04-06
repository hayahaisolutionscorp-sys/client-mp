"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { TripData } from "@oltek/hayahai-sdk/react";
import { HayahAIButton, SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import type { BookingTemplateProps } from "../../types";
import { DEFAULT_BOOKING_TYPE } from "constants/default";

const TripSearchWidget = dynamic(
  () => import("@oltek/hayahai-sdk/react").then((mod) => mod.TripSearchWidget),
  { ssr: false }
);

interface BookingBannerProps extends BookingTemplateProps {}

export default function BookingBanner({ theme, ports = [], routes = [] }: BookingBannerProps) {
  const [mode, setMode] = useState<"form" | "chat">("form");
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);
  const [tripSearchEnabled, setTripSearchEnabled] = useState(true);

  const tenantId = process.env.NEXT_PUBLIC_IS_CLIENT === "true" && process.env.NEXT_PUBLIC_TENANT_ID
    ? Number(process.env.NEXT_PUBLIC_TENANT_ID)
    : 1;

  useEffect(() => {
    (async () => {
      try {
        const configRes = await fetch(`/api/agent-config?tenantId=${tenantId}&type=trip-search`);

        if (configRes.ok) {
          const data = await configRes.json();
          const cfg = data?.config;
          setTripSearchEnabled(cfg?.enabled ?? true);
        }
      } catch {
        setTripSearchEnabled(true);
      }
    })();
  }, [tenantId]);

  const portNameToCode = new Map(ports.map((port) => [port.name.toLowerCase(), port.code]));

  const handleTripSelect = (trip: TripData) => {
    const depDate = trip.departureTime
      ? new Date(trip.departureTime).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const originCode = portNameToCode.get(trip.srcPort.toLowerCase());
    const destinationCode = portNameToCode.get(trip.destPort.toLowerCase());
    const params = new URLSearchParams({
      departure_date: depDate,
      passenger_count: "1",
      vehicle_count: "0",
      sort: "departureDate",
      page: "1",
    });

    if (originCode) params.set("origin_code", originCode);
    if (destinationCode) params.set("destination_code", destinationCode);

    window.location.href = `/booking/destination?${params.toString()}`;
  };

  return (
    <section id="Book" className="relative z-30 -mt-24 px-4 pb-20 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="container mx-auto max-w-[1300px]"
      >
        <div
          className="rounded-[28px] border p-6 shadow-xl md:p-8"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}18 0%, ${theme.accent}20 100%)`,
            borderColor: `${theme.primary}22`,
          }}
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: theme.text }}>
                Plan Your Next Sailing
              </h2>
              <p className="text-sm" style={{ color: `${theme.text}CC` }}>
                Same booking flow, now in a banner-first visual shell.
              </p>
            </div>
            {mode === "form" && tripSearchEnabled ? <HayahAIButton onClick={() => setMode("chat")} variant="default" /> : null}
          </div>

          {mode === "chat" && tripSearchEnabled ? (
            <div className="overflow-hidden rounded-[20px] border border-white/60 bg-white/85 p-3 backdrop-blur-xl">
              <TripSearchWidget
                tenantId={tenantId}
                chatApiUrl="/api/chat-booking"
                routesApiUrl="/api/routes"
                tripsApiUrl="/api/trips"
                configApiUrl="/api/agent-config"
                onSwitchToForm={() => setMode("form")}
                onTripSelect={handleTripSelect}
                showFormToggle={true}
                poweredByText="Powered by HayahAI"
              />
            </div>
          ) : (
            <div className="booking-banner-form-wrapper relative z-[40]">
              <SearchBoxFormContent
                bookingType={bookingType}
                setBookingType={setBookingType}
                initialPorts={ports}
                initialRoutes={routes}
              />
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .booking-banner-form-wrapper > div {
          overflow: visible !important;
        }

        .booking-banner-form-wrapper fieldset {
          border-radius: 14px !important;
        }

        .booking-banner-form-wrapper fieldset:focus-within {
          border-color: ${theme.primary} !important;
        }

        .booking-banner-form-wrapper button[variant="default"] {
          background: ${theme.primary} !important;
          border: none !important;
        }
      `}</style>
    </section>
  );
}
