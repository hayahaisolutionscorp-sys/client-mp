"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import type { BookingTemplateProps } from "../../types";
import { DEFAULT_BOOKING_TYPE } from "constants/default";

export default function BookingOverlay({ theme, ports = [], routes = [] }: BookingTemplateProps) {
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);

  return (
    <section id="Book" className="relative z-30 -mt-32 px-4 pb-20 sm:px-6 lg:px-10">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto max-w-[1300px]"
      >
        {/* Removed overflow-hidden to prevent clipping of dropdowns */}
        <div className="group relative rounded-[48px] bg-white/70 p-1 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.2)] backdrop-blur-3xl border border-white/60 transition-all duration-500 hover:shadow-[0_48px_140px_-20px_rgba(0,0,0,0.25)]">
          
          <div className="rounded-[44px] bg-white/40 p-6 md:p-10 border border-white/20 relative">
            
            {/* Background Accents (Moved outside or made non-clipping) */}
            <div 
              className="absolute -top-[5%] -left-[5%] h-[30%] w-[30%] rounded-full blur-[80px] opacity-10 pointer-events-none"
              style={{ backgroundColor: theme.primary }}
            />
            <div 
              className="absolute -bottom-[5%] -right-[5%] h-[30%] w-[30%] rounded-full blur-[80px] opacity-10 pointer-events-none"
              style={{ backgroundColor: theme.accent }}
            />

            {/* Header Content */}
            <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-6">
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

            {/* Form Content with Fixed Z-Index and Style Overrides */}
            <div className="booking-overlay-form-wrapper relative z-[40]">
              <SearchBoxFormContent
                bookingType={bookingType}
                setBookingType={setBookingType}
                initialPorts={ports}
                initialRoutes={routes}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        /* Fix for dropdowns being covered */
        .booking-overlay-form-wrapper > div {
           overflow: visible !important;
        }

        /* Fixed clashing animations/colors */
        .booking-overlay-form-wrapper fieldset {
          border-radius: 16px !important;
          background: rgba(255, 255, 255, 0.4) !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease !important;
          backdrop-filter: blur(4px) !important;
          position: relative !important;
          z-index: 10 !important;
        }
        
        /* Ensure focus doesn't overlap painfully */
        .booking-overlay-form-wrapper fieldset:focus-within {
          background: white !important;
          border-color: ${theme.primary} !important;
          transform: translateY(-2px);
          z-index: 50 !important; /* Bring focused fieldset to front */
        }

        .booking-overlay-form-wrapper fieldset legend {
          font-weight: 700 !important;
          text-transform: uppercase !important;
          color: #94a3b8 !important;
          font-size: 9px !important;
          background: transparent !important;
        }

        /* Fix search button to follow theme better without being too aggressive */
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

        /* Inner form components cleanup */
        .booking-overlay-form-wrapper button.rounded-md {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Fixed clashing dropdown backgrounds */
        .booking-overlay-form-wrapper ul {
          border-radius: 12px !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </section>
  );
}
