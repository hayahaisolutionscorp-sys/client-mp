"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { TripData } from "@oltek/hayahai-sdk/react";
import { SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import type { BookingTemplateProps } from "../../types";
import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { isEffectiveClientApiMode } from "constants/api";

const TripSearchWidget = dynamic(
  () => import("@oltek/hayahai-sdk/react").then((mod) => mod.TripSearchWidget),
  { ssr: false }
);

interface BookingBoardingPassProps extends BookingTemplateProps {
  variant?: string;
  /** When true, renders the card only (no <section> wrapper with margins). */
  floatingInHero?: boolean;
}

export default function BookingBoardingPass({
  theme,
  ports = [],
  routes = [],
  floatingInHero = false,
}: BookingBoardingPassProps) {
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

  const portNameToCode = new Map(ports.map((p) => [p.name.toLowerCase(), p.code]));

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-md lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl"
    >
      <div
        className="relative rounded-2xl border-2 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.3)]"
        style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
      >
        {/* Header stub */}
        <div className="flex items-center justify-between px-4 py-2 sm:px-5 lg:px-6 lg:py-3">
          <div className="flex items-center gap-2">
            <span
              className="h-6 w-6 rounded grid place-items-center text-white text-[10px] font-black"
              style={{ backgroundColor: theme.primary }}
            >
              ⚓
            </span>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] opacity-65" style={{ color: theme.text }}>
              Book Trip · Ticket #01
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-50" style={{ color: theme.text }}>
            OPEN
          </span>
        </div>

        {/* Perforation */}
        <div className="relative">
          <div className="h-[1px] mx-5 border-t-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.2)" }} />
          <div className="absolute left-[-8px] top-[-8px] h-4 w-4 rounded-full" style={{ backgroundColor: "#FAF7F0" }} />
          <div className="absolute right-[-8px] top-[-8px] h-4 w-4 rounded-full" style={{ backgroundColor: "#FAF7F0" }} />
        </div>

        {/* AI toggle */}
        {tripSearchEnabled && (
          <div className="px-4 pt-2 sm:px-5 sm:pt-3 lg:px-6">
            <button
              type="button"
              onClick={() => setMode(mode === "form" ? "chat" : "form")}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 border-2 border-dashed font-mono text-[10px] uppercase tracking-[0.2em] font-black hover:bg-slate-50 transition"
              style={{ borderColor: theme.text + "33", color: theme.text }}
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.primary }} />
                  <span className="relative h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                </span>
                {mode === "form" ? "Try AI Assistant" : "Back to Form"}
              </span>
              <span className="opacity-40">{mode === "form" ? "›" : "‹"}</span>
            </button>
          </div>
        )}

        {/* Body: vertical stacked form */}
        <div className="px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4">
          {mode === "chat" && tripSearchEnabled ? (
            <div className="rounded-xl border-2 border-dashed overflow-hidden" style={{ borderColor: theme.text + "26" }}>
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
            <div className="boarding-pass-booking-form">
              <SearchBoxFormContent
                bookingType={bookingType}
                setBookingType={setBookingType}
                initialPorts={ports}
                initialRoutes={routes}
              />
            </div>
          )}
        </div>

        {/* Perforation 2 */}
        <div className="relative">
          <div className="h-[1px] mx-5 border-t-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.2)" }} />
          <div className="absolute left-[-8px] top-[-8px] h-4 w-4 rounded-full" style={{ backgroundColor: "#FAF7F0" }} />
          <div className="absolute right-[-8px] top-[-8px] h-4 w-4 rounded-full" style={{ backgroundColor: "#FAF7F0" }} />
        </div>

        {/* Footer barcode — hidden when nested inside the hero ticket to avoid duplication */}
        {!floatingInHero && (
          <div className="flex items-center justify-between px-4 py-1.5 sm:px-5 sm:py-2 lg:px-6">
            <div className="flex gap-[2px] items-end h-5 overflow-hidden flex-1 opacity-75 mr-3">
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  className="block"
                  style={{
                    backgroundColor: theme.text,
                    width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + "px",
                    height: "100%",
                    opacity: i % 5 === 0 ? 0.85 : 0.6,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] tracking-[0.15em] opacity-50 whitespace-nowrap" style={{ color: theme.text }}>
              AYH-{new Date().getFullYear().toString().slice(-2)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Vertical-first form styling — each fieldset becomes its own stacked row
  const styles = (
    <style>{`
      .boarding-pass-booking-form > div {
        overflow: visible !important;
        width: 100% !important;
      }
      .boarding-pass-booking-form .grid {
        gap: 0.5rem !important;
      }
      .boarding-pass-booking-form .mt-2,
      .boarding-pass-booking-form .mt-3 {
        margin-top: 0.5rem !important;
      }
      .boarding-pass-booking-form .mb-4 {
        margin-bottom: 0.5rem !important;
      }
      .boarding-pass-booking-form fieldset {
        position: relative !important;
        border-radius: 10px !important;
        border: 2px dashed rgba(15, 23, 42, 0.2) !important;
        background: rgba(250, 247, 240, 0.5) !important;
        padding: 0 !important;
        height: 46px !important;
        transition: all 0.2s ease !important;
        width: 100% !important;
      }
      .boarding-pass-booking-form fieldset > legend {
        position: absolute !important;
        top: -8px !important;
        left: 12px !important;
        margin: 0 !important;
        padding: 0 6px !important;
        background: #FFFDF7 !important;
        z-index: 2 !important;
      }
      .boarding-pass-booking-form fieldset > div,
      .boarding-pass-booking-form fieldset > button {
        width: 100% !important;
        height: 100% !important;
      }
      .boarding-pass-booking-form fieldset:focus-within {
        border-style: solid !important;
        border-color: ${theme.primary} !important;
        background: white !important;
      }
      .boarding-pass-booking-form fieldset legend {
        font-family: ui-monospace, Menlo, monospace !important;
        font-weight: 900 !important;
        text-transform: uppercase !important;
        color: rgba(15, 23, 42, 0.5) !important;
        letter-spacing: 0.2em !important;
        font-size: 9px !important;
        padding: 0 6px !important;
        background: transparent !important;
      }
      .boarding-pass-booking-form fieldset:focus-within legend {
        color: ${theme.primary} !important;
      }
      .boarding-pass-booking-form button.rounded-md {
        border-radius: 8px !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        font-family: ui-monospace, Menlo, monospace !important;
        font-weight: 700 !important;
        font-size: 11px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.1em !important;
        padding: 0 12px !important;
        color: rgba(15, 23, 42, 0.85) !important;
        min-height: 38px !important;
        width: 100% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
      }
      .boarding-pass-booking-form button.rounded-md > span {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }
      .boarding-pass-booking-form button.rounded-md:hover {
        background: rgba(255, 253, 247, 0.6) !important;
      }
      .boarding-pass-booking-form button[variant="default"],
      .boarding-pass-booking-form button[data-booking-search-submit] {
        border-radius: 10px !important;
        background: ${theme.primary} !important;
        color: white !important;
        font-weight: 900 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.15em !important;
        font-size: 12px !important;
        border: none !important;
        height: 40px !important;
        padding: 0 16px !important;
        box-shadow: 0 4px 0 rgba(15, 23, 42, 0.15) !important;
        transition: all 0.15s ease !important;
      }
      .boarding-pass-booking-form button[variant="default"]:hover,
      .boarding-pass-booking-form button[data-booking-search-submit]:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 0 rgba(15, 23, 42, 0.18) !important;
        filter: brightness(1.05) !important;
      }
      .boarding-pass-booking-form ul {
        border-radius: 10px !important;
        border: 2px solid rgba(15, 23, 42, 0.12) !important;
        background: #FFFDF7 !important;
        box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.2) !important;
        padding: 6px !important;
      }
      /* Trip/Passenger/Vehicle row: TRIP full-width, PAX + VEH side by side */
      .boarding-pass-booking-form > div:first-child {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 6px !important;
        margin-bottom: 4px !important;
      }
      .boarding-pass-booking-form > div:first-child > *:first-child {
        grid-column: 1 / -1 !important;
      }
      .boarding-pass-booking-form > div:first-child > *:nth-child(4) {
        display: none !important;
      }
      /* Add input-like dashed borders to the trip/passenger/vehicle selectors */
      .boarding-pass-booking-form > div:first-child button.rounded-md {
        border: 2px dashed rgba(15, 23, 42, 0.2) !important;
        border-radius: 10px !important;
        background: rgba(250, 247, 240, 0.5) !important;
        height: 46px !important;
        min-height: 46px !important;
        justify-content: flex-start !important;
        text-align: left !important;
      }
      .boarding-pass-booking-form > div:first-child button.rounded-md:hover,
      .boarding-pass-booking-form > div:first-child button.rounded-md:focus {
        border-style: solid !important;
        border-color: ${theme.primary} !important;
        background: white !important;
      }
      /* Route/date/action row: avoid six controls competing on one laptop-width line. */
      .boarding-pass-booking-form > div:nth-child(2) {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 40px minmax(0, 1fr) !important;
        align-items: start !important;
        gap: 8px !important;
        overflow: visible !important;
      }
      .boarding-pass-booking-form > div:nth-child(2) > * {
        min-width: 0 !important;
      }
      .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(4) {
        grid-column: 1 / 3 !important;
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 8px !important;
        height: auto !important;
        min-width: 0 !important;
        padding-top: 0 !important;
      }
      .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(4) > * {
        min-width: 0 !important;
        width: 100% !important;
      }
      .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(5) {
        grid-column: 3 / 4 !important;
        display: flex !important;
        align-items: stretch !important;
        height: 46px !important;
        min-width: 0 !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(5) [data-booking-search-submit] {
        width: 100% !important;
        min-width: 0 !important;
        height: 46px !important;
        white-space: nowrap !important;
      }
      @media (max-width: 1180px) {
        .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(4),
        .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(5) {
          grid-column: 1 / -1 !important;
        }
      }
      @media (max-width: 640px) {
        .boarding-pass-booking-form > div:nth-child(2) {
          grid-template-columns: 1fr !important;
        }
        .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(2) {
          display: none !important;
        }
        .boarding-pass-booking-form > div:nth-child(2) > *:nth-child(4) {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );

  if (floatingInHero) {
    return (
      <div className="w-full">
        {card}
        {styles}
      </div>
    );
  }

  return (
    <section id="Book" className="relative px-4 py-16 sm:py-20" style={{ backgroundColor: "#FAF7F0" }}>
      {card}
      {styles}
    </section>
  );
}
