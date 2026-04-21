"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter, FaEnvelope, FaPhone } from "react-icons/fa6";
import type { BuilderThemeTokens } from "@/components/landing/builder/types";
import { useBranding } from "@/hooks/branding";
import { useFooter } from "@/hooks/footer";
import { useContactUs } from "@/hooks/contact-us";

interface FooterBoardingPassProps {
  theme: BuilderThemeTokens;
}

export default function FooterBoardingPass({ theme }: FooterBoardingPassProps) {
  const branding = useBranding();
  const footerSection = useFooter();
  const contactInfo = useContactUs();

  const facebook = contactInfo.find((c) => c.type === "facebook" && c.is_active);
  const instagram = contactInfo.find((c) => c.type === "instagram" && c.is_active);
  const twitter = contactInfo.find((c) => c.type === "twitter" && c.is_active);
  const phone = contactInfo.find((c) => c.type === "phone" && c.is_active);
  const email = contactInfo.find((c) => c.type === "email" && c.is_active);

  return (
    <footer id="Resources" className="relative w-full px-4 py-12" style={{ backgroundColor: "#F3EFE4" }}>
      <div className="mx-auto max-w-5xl">
        <div
          className="relative rounded-2xl border-2 overflow-hidden"
          style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
        >
          {/* Header stub */}
          <div className="flex items-center justify-between px-6 py-3 border-b-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }}>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-65" style={{ color: theme.text }}>
              ✈ Departure Manifest
            </span>
            <span className="font-mono text-[10px] opacity-50" style={{ color: theme.text }}>
              © {new Date().getFullYear()}
            </span>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-10">
            {/* Brand */}
            <div className="flex flex-col items-start gap-5">
              <Image
                src={branding?.logo?.dark || "/assets/images/ayahay_logo.png"}
                alt="Logo"
                width={180}
                height={70}
                className="h-12 w-auto object-contain"
              />
              {branding?.slogan && (
                <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.text }}>
                  {branding.slogan}
                </p>
              )}
              <div className="flex gap-2">
                {facebook && (
                  <a href={facebook.value} target="_blank" rel="noreferrer" className="p-2 border-2 border-dashed hover:border-solid transition" style={{ borderColor: theme.text + "33" }}>
                    <FaFacebook className="w-4 h-4" style={{ color: theme.text }} />
                  </a>
                )}
                {twitter && (
                  <a href={twitter.value} target="_blank" rel="noreferrer" className="p-2 border-2 border-dashed hover:border-solid transition" style={{ borderColor: theme.text + "33" }}>
                    <FaXTwitter className="w-4 h-4" style={{ color: theme.text }} />
                  </a>
                )}
                {instagram && (
                  <a href={instagram.value} target="_blank" rel="noreferrer" className="p-2 border-2 border-dashed hover:border-solid transition" style={{ borderColor: theme.text + "33" }}>
                    <FaInstagram className="w-4 h-4" style={{ color: theme.text }} />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] font-black opacity-50 mb-4" style={{ color: theme.text }}>
                · Company
              </h4>
              <ul className="space-y-2.5 text-sm font-semibold" style={{ color: theme.text }}>
                {footerSection?.hasAboutUs && <li><Link href="/about-us" className="hover:opacity-60 transition">› About us</Link></li>}
                {footerSection?.hasPress && <li><Link href="/press" className="hover:opacity-60 transition">› Press</Link></li>}
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] font-black opacity-50 mb-4" style={{ color: theme.text }}>
                · Support
              </h4>
              <ul className="space-y-2.5 text-sm font-semibold" style={{ color: theme.text }}>
                {footerSection?.hasFaq && <li><Link href="/faq" className="hover:opacity-60 transition">› FAQ</Link></li>}
                <li><Link href="/contact-us" className="hover:opacity-60 transition">› Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] font-black opacity-50 mb-4" style={{ color: theme.text }}>
                · Contact
              </h4>
              <div className="space-y-2.5 text-sm font-semibold" style={{ color: theme.text }}>
                {phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="w-3 h-3 opacity-50" />
                    <a href={`tel:${phone.value}`} className="hover:opacity-60 transition">{phone.value}</a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="w-3 h-3 opacity-50" />
                    <a href={`mailto:${email.value}`} className="hover:opacity-60 transition truncate max-w-[140px] inline-block">{email.value}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Perforated bottom strip */}
          <div className="relative">
            <div className="h-[1px] mx-6 border-t-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }} />
            <div className="absolute left-[-8px] top-[-8px] h-4 w-4 rounded-full" style={{ backgroundColor: "#F3EFE4" }} />
            <div className="absolute right-[-8px] top-[-8px] h-4 w-4 rounded-full" style={{ backgroundColor: "#F3EFE4" }} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4" style={{ backgroundColor: "rgba(250,247,240,0.6)" }}>
            <div className="flex gap-[2px] items-end h-4 overflow-hidden w-40 opacity-70">
              {Array.from({ length: 32 }).map((_, i) => (
                <span key={i} className="block" style={{ backgroundColor: theme.text, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + "px", height: "100%", opacity: i % 4 === 0 ? 0.8 : 0.6 }} />
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50" style={{ color: theme.text }}>
              © {new Date().getFullYear()} {branding?.brand_name} · All rights reserved
            </p>
            <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.2em] opacity-50" style={{ color: theme.text }}>
              {footerSection?.hasPrivacyPolicy && <Link href="/privacy-policy" className="hover:opacity-100 transition">Privacy</Link>}
              {footerSection?.hasTermsAndConditions && <Link href="/terms" className="hover:opacity-100 transition">Terms</Link>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
