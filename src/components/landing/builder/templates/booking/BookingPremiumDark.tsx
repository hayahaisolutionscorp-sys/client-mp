"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import type { BookingTemplateProps } from "../../types";
import { DEFAULT_BOOKING_TYPE } from "constants/default";

export default function BookingCleanMinimal({ theme, ports = [], routes = [] }: BookingTemplateProps) {
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);

  return (
    <section id="Book" className="relative z-30 -mt-20 px-4 pb-12 sm:px-6 lg:px-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto max-w-[1240px]"
      >
        {/* White Premium Container - Shadow based design */}
        <div className="relative rounded-[32px] bg-white p-6 shadow-[0_45px_130px_-20px_rgba(0,0,0,0.15)] border border-slate-100 md:p-8 lg:p-10">
          
          {/* Subtle Accent Edge */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1.5 rounded-r-full"
            style={{ backgroundColor: theme.primary }}
          />

          <div className="flex flex-col gap-6">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl" style={{ backgroundColor: `${theme.primary}15` }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
               </div>
               <h2 className="text-xl font-bold text-slate-900">
                 Find Your Trip
               </h2>
             </div>

             <div className="clean-minimal-form-wrapper">
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
        /* Overriding standard form for Clean Minimal theme */
        .clean-minimal-form-wrapper > div {
           overflow: visible !important;
        }

        .clean-minimal-form-wrapper fieldset {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          transition: all 0.2s ease !important;
          color: #0f172a !important;
          height: 60px !important;
          z-index: 10 !important;
        }

        .clean-minimal-form-wrapper fieldset:focus-within {
          background: white !important;
          border-color: ${theme.primary} !important;
          box-shadow: 0 10px 30px -10px rgba(var(--primary-rgb), 0.2) !important;
          z-index: 50 !important;
        }

        .clean-minimal-form-wrapper fieldset legend {
          color: #64748b !important;
          font-weight: 600 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          background: white !important;
          border-radius: 4px !important;
          padding: 0 6px !important;
          margin-left: 8px !important;
        }

        .clean-minimal-form-wrapper button[variant="default"] {
          background: ${theme.primary} !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          height: 60px !important;
          box-shadow: 0 12px 30px -10px ${theme.primary}55 !important;
          transition: all 0.3s ease !important;
        }

        .clean-minimal-form-wrapper button[variant="default"]:hover {
          filter: brightness(1.1) !important;
          box-shadow: 0 16px 35px -8px ${theme.primary}77 !important;
          transform: translateY(-1px);
        }

        .clean-minimal-form-wrapper button.flex.items-center {
          background: transparent !important;
          box-shadow: none !important;
          height: 100% !important;
        }

        .clean-minimal-form-wrapper span.text-customText {
          color: #1e293b !important;
          font-weight: 500 !important;
        }
      `}</style>
    </section>
  );
}
