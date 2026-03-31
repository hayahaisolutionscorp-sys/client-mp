
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

export default function BookingOverlay({ theme, ports = [], routes = [] }: BookingTemplateProps) {
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
    <section id="Book" className="relative z-30 -mt-32 px-4 pb-20 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto max-w-[1300px]"
      >
        <div className="group relative rounded-[48px] border border-white/60 bg-white/70 p-1 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.2)] backdrop-blur-3xl transition-all duration-500 hover:shadow-[0_48px_140px_-20px_rgba(0,0,0,0.25)]">
          <div className="relative rounded-[44px] border border-white/20 bg-white/40 p-6 md:p-10">
            <div
              className="pointer-events-none absolute -left-[5%] -top-[5%] h-[30%] w-[30%] rounded-full opacity-10 blur-[80px]"
              style={{ backgroundColor: theme.primary }}
            />
            <div
              className="pointer-events-none absolute -bottom-[5%] -right-[5%] h-[30%] w-[30%] rounded-full opacity-10 blur-[80px]"
              style={{ backgroundColor: theme.accent }}
            />

            <div className="relative z-10 mb-8 flex flex-col justify-between gap-4 border-b border-black/5 pb-6 md:flex-row md:items-end">
              <div className="space-y-1">
                <span
                  className="inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  Quick Booking
                </span>
                <h2 className="text-2xl font-black italic tracking-tight md:text-3xl" style={{ color: theme.text }}>
                  READY TO GO?
                </h2>
              </div>
              <p className="max-w-[300px] text-[10px] font-medium leading-tight text-slate-500/70 md:text-right">
                Explore the beautiful islands of the Philippines with our seamless terminal booking system.
              </p>
            </div>

            {mode === "chat" && tripSearchEnabled ? (
              <div className="relative z-[40] overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-3 backdrop-blur-xl">
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
              <>
                <div className="relative z-10 mb-6 flex items-center justify-end">
                  {tripSearchEnabled && <HayahAIButton onClick={() => setMode("chat")} variant="overlay" />}
                </div>

                <div className="booking-overlay-form-wrapper relative z-[40]">
                  <SearchBoxFormContent
                    bookingType={bookingType}
                    setBookingType={setBookingType}
                    initialPorts={ports}
                    initialRoutes={routes}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .booking-overlay-form-wrapper > div {
          overflow: visible !important;
        }

        .booking-overlay-form-wrapper fieldset {
          border-radius: 16px !important;
          background: rgba(255, 255, 255, 0.4) !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease !important;
          backdrop-filter: blur(4px) !important;
          position: relative !important;
          z-index: 10 !important;
        }

        .booking-overlay-form-wrapper fieldset:focus-within {
          background: white !important;
          border-color: ${theme.primary} !important;
          transform: translateY(-2px);
          z-index: 50 !important;
        }

        .booking-overlay-form-wrapper fieldset legend {
          font-weight: 700 !important;
          text-transform: uppercase !important;
          color: #94a3b8 !important;
          font-size: 9px !important;
          background: transparent !important;
        }

        .booking-overlay-form-wrapper button[variant="default"] {
          border-radius: 16px !important;
          background: ${theme.primary} !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          border: none !important;
          box-shadow: 0 10px 25px -5px ${theme.primary}44 !important;
        }

        .booking-overlay-form-wrapper button[variant="default"]:hover {
          filter: brightness(1.05) !important;
          box-shadow: 0 15px 30px -5px ${theme.primary}66 !important;
        }

        .booking-overlay-form-wrapper button.rounded-md {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        .booking-overlay-form-wrapper ul {
          border-radius: 12px !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </section>
  );
}

