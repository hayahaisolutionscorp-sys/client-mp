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

interface BookingGlassmorphicOverlayProps extends BookingTemplateProps {
  variant?: string;
  /**
   * When true, renders only the floating card (no outer <section> with negative
   * margin/padding) so the caller can absolutely-position it inside a hero.
   */
  floatingInHero?: boolean;
}

export default function BookingGlassmorphicOverlay({ theme, ports = [], routes = [], variant = "glassmorphic-overlay", floatingInHero = false }: BookingGlassmorphicOverlayProps) {
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

  const card = (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto max-w-[1300px]"
      >
        <div className="relative overflow-hidden rounded-[3.5rem] border border-white/30 bg-white/5 p-1 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-all duration-700 hover:shadow-primary/20 hover:bg-white/10">
          
          {/* Internal Orbs for depth */}
          <div 
             className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-[100px] opacity-[0.15] -z-10"
             style={{ backgroundColor: theme.primary }}
          />
          <div 
             className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-[100px] opacity-[0.15] -z-10"
             style={{ backgroundColor: theme.accent }}
          />

          <div className="relative rounded-[3.25rem] border border-white/30 bg-white/60 p-5 sm:p-7 md:p-9 backdrop-blur-xl">
            <div className="relative z-10 mb-5 flex flex-col justify-between gap-3 border-b border-black/5 pb-4 md:mb-6 md:flex-row md:items-end md:gap-6 md:pb-5">
              <div className="space-y-2">
                <span
                  className="inline-block rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg sm:text-[10px]"
                  style={{ backgroundColor: theme.primary }}
                >
                  Book Your Journey
                </span>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl md:text-3xl" style={{ color: theme.text }}>
                  Where to Next?
                </h2>
              </div>
              <p className="max-w-[340px] text-[11px] font-medium leading-relaxed opacity-70 md:text-right md:text-xs" style={{ color: theme.text }}>
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
                <div className="relative z-10 mb-4 flex items-center justify-end sm:mb-5">
                  {tripSearchEnabled && (
                    <button 
                        onClick={() => setMode("chat")}
                        className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-slate-900 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] hover:scale-105 transition-transform shadow-lg"
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
  );

  const styles = (
      <style jsx global>{`
        .booking-glass-form-wrapper > div {
          overflow: visible !important;
        }

        .booking-glass-form-wrapper fieldset {
          border-radius: 20px !important;
          background: rgba(255, 255, 255, 0.75) !important;
          border-color: rgba(255, 255, 255, 0.6) !important;
          border-width: 1px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 14px -4px rgba(15, 23, 42, 0.08) !important;
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
          color: rgba(15, 23, 42, 0.6) !important;
          letter-spacing: 0.12em !important;
          font-size: 9px !important;
          background: transparent !important;
          padding: 0 10px !important;
        }

        .booking-glass-form-wrapper fieldset:focus-within legend {
          color: ${theme.primary} !important;
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

        /* Top-row dropdown pills (Trip type / Passenger / Vehicle).
           Match the fieldset pill styling so they read as a cohesive row. */
        .booking-glass-form-wrapper button.rounded-md {
          border-radius: 16px !important;
          background: rgba(255, 255, 255, 0.75) !important;
          border: 1px solid rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 14px -4px rgba(15, 23, 42, 0.08) !important;
          padding: 0 18px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          color: rgba(15, 23, 42, 0.85) !important;
        }

        .booking-glass-form-wrapper button.rounded-md:hover {
          background: rgba(255, 255, 255, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.8) !important;
          transform: translateY(-1px);
        }

        /* The search submit button uses variant="default" and bypasses these styles. */
        .booking-glass-form-wrapper button[variant="default"].rounded-md,
        .booking-glass-form-wrapper button[data-booking-search-submit].rounded-md {
          background: ${theme.primary} !important;
          border: none !important;
          color: white !important;
          height: 60px !important;
          padding: 0 24px !important;
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
  );

  if (floatingInHero) {
    return (
      <div id="Book" className="w-full">
        {card}
        {styles}
      </div>
    );
  }

  return (
    <section id="Book" className="relative z-40 -mt-36 md:-mt-48 px-4 pb-24 sm:px-6 lg:px-10">
      {card}
      {styles}
    </section>
  );
}
