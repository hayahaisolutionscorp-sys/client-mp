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

interface BookingHorizontalProps extends BookingTemplateProps {}

export default function BookingHorizontal({ theme, ports = [], routes = [] }: BookingHorizontalProps) {
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
    <section id="Book" className="relative z-30 -mt-16 px-4 pb-20 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="container mx-auto max-w-[1100px]"
      >
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-white max-w-5xl mx-auto ring-1 ring-slate-100 relative">
          
          {mode === "form" && tripSearchEnabled && (
             <div className="mb-2 flex justify-end md:absolute md:-top-10 md:right-4 md:mb-0">
               <HayahAIButton onClick={() => setMode("chat")} variant="default" />
             </div>
          )}

          {mode === "chat" && tripSearchEnabled ? (
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-md">
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
            <div className="booking-horizontal-form-wrapper bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-50">
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
        .booking-horizontal-form-wrapper form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 12px;
        }

        .booking-horizontal-form-wrapper form > div {
           margin-bottom: 0 !important;
        }

        @media (min-width: 768px) {
           .booking-horizontal-form-wrapper form {
              flex-direction: row;
              align-items: center;
              gap: 12px;
           }
           .booking-horizontal-form-wrapper fieldset {
              flex: 1;
           }
           .booking-horizontal-form-wrapper .grid {
              display: flex;
              flex-direction: row;
              gap: 8px;
           }
        }
        
        .booking-horizontal-form-wrapper fieldset {
          border-radius: 10px !important;
          background: #f8fafc !important;
          border: 1px solid #f1f5f9 !important;
          padding: 8px 14px !important;
          transition: all 0.3s ease;
        }

        .booking-horizontal-form-wrapper fieldset:focus-within {
          border-color: ${theme.primary} !important;
          background: white !important;
          box-shadow: 0 0 0 3px ${theme.primary}15 !important;
        }
        
        .booking-horizontal-form-wrapper legend {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.65rem !important;
          font-weight: 700;
          color: #64748b;
          padding: 0 4px;
        }

        .booking-horizontal-form-wrapper button[variant="default"], 
        .booking-horizontal-form-wrapper button[type="submit"] {
          background: ${theme.primary} !important;
          color: ${theme.textOnPrimary || 'white'} !important;
          border: none !important;
          border-radius: 10px !important;
          height: 100%;
          min-height: 52px;
          padding: 0 24px;
          font-weight: 600;
          letter-spacing: 0.02em;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
      `}</style>
    </section>
  );
}
