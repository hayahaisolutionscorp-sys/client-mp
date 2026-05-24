"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { TripData } from "@oltek/hayahai-sdk/react";
import { HayahAIButton, SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import type { BookingTemplateProps } from "../../types";
import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { isEffectiveClientApiMode } from "constants/api";

const TripSearchWidget = dynamic(
  () => import("@oltek/hayahai-sdk/react").then((mod) => mod.TripSearchWidget),
  { ssr: false }
);

interface BookingGlassmorphicProps extends BookingTemplateProps {
  variant?: string;
}

export default function BookingGlassmorphic({ theme, ports = [], routes = [], variant = "glassmorphic" }: BookingGlassmorphicProps) {
  const [mode, setMode] = useState<"form" | "chat">("form");
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);
  const [tripSearchEnabled, setTripSearchEnabled] = useState(true);

  const tenantId =
    isEffectiveClientApiMode && process.env.NEXT_PUBLIC_TENANT_ID
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
    <section id="Book" className="relative z-30 -mt-36 sm:-mt-24 px-4 pb-24 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto max-w-[1300px]"
      >
        <div className="relative overflow-hidden rounded-[3.5rem] border border-white/40 bg-white/10 p-1 shadow-2xl backdrop-blur-2xl transition-all duration-700 hover:shadow-primary/10">
          
          {/* Internal Orbs for depth */}
          <div 
             className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-[100px] opacity-[0.15] -z-10"
             style={{ backgroundColor: theme.primary }}
          />
          <div 
             className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-[100px] opacity-[0.15] -z-10"
             style={{ backgroundColor: theme.accent }}
          />

          <div className="relative rounded-[3.25rem] border border-white/20 bg-white/40 p-5 sm:p-8 md:p-14">
            <div className="relative z-10 mb-10 hidden flex-col justify-between gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end sm:flex">
              <div className="space-y-3">
                <span
                  className="inline-block rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl"
                  style={{ backgroundColor: theme.primary }}
                >
                  Book Your Journey
                </span>
                <h2 className="text-3xl font-black md:text-5xl tracking-tight" style={{ color: theme.text }}>
                  Where to Next?
                </h2>
              </div>
              <p className="max-w-[340px] text-xs font-semibold leading-relaxed opacity-70 md:text-right" style={{ color: theme.text }}>
                Secure your ferry tickets instantly through our modern booking system.
              </p>
            </div>

            {mode === "chat" && tripSearchEnabled ? (
              <div className="relative z-[40] overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/20 p-4 backdrop-blur-xl shadow-inner">
                <TripSearchWidget
                  tenantId={tenantId}
                  chatApiUrl="/api/chat-booking"
                  routesApiUrl="/api/routes"
                  tripsApiUrl="/api/trips"
                  configApiUrl="/api/agent-config"
                  onSwitchToForm={() => setMode("form")}
                  onTripSelect={handleTripSelect}
                  showFormToggle={true}
                  poweredByText="Powered by Ayahay AI"
                />
              </div>
            ) : (
              <>
                <div className="relative z-10 mb-8 hidden items-center justify-end sm:flex">
                  {tripSearchEnabled && (
                    <button 
                        onClick={() => setMode("chat")}
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        Ask AI Assistant
                    </button>
                  )}
                </div>

                <div className="booking-glass-form-wrapper relative z-[40]">
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
        .booking-glass-form-wrapper > div {
          overflow: visible !important;
        }

        .booking-glass-form-wrapper fieldset {
          border-radius: 24px !important;
          background: rgba(255, 255, 255, 0.4) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          border-width: 1.5px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          backdrop-filter: blur(8px) !important;
          box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05) !important;
          position: relative !important;
          z-index: 10 !important;
        }

        .booking-glass-form-wrapper fieldset:focus-within {
          background: white !important;
          border-color: ${theme.primary} !important;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08) !important;
          z-index: 50 !important;
        }

        .booking-glass-form-wrapper fieldset legend {
          font-weight: 800 !important;
          text-transform: uppercase !important;
          color: ${theme.primary} !important;
          letter-spacing: 0.1em !important;
          font-size: 9px !important;
          background: transparent !important;
          padding: 0 12px !important;
        }

        .booking-glass-form-wrapper button[variant="default"] {
          border-radius: 20px !important;
          background: ${theme.primary} !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border: none !important;
          height: 60px !important;
          box-shadow: 0 15px 35px -5px ${theme.primary}55 !important;
          transition: all 0.3s ease !important;
        }

        .booking-glass-form-wrapper button[variant="default"]:hover {
          transform: translateY(-2px);
          filter: brightness(1.1) !important;
          box-shadow: 0 20px 45px -5px ${theme.primary}77 !important;
        }

        .booking-glass-form-wrapper button.rounded-md {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        .booking-glass-form-wrapper ul {
          border-radius: 24px !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.2) !important;
          padding: 8px !important;
        }
      `}</style>
    </section>
  );
}
