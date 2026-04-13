'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter, FaEnvelope, FaPhone } from "react-icons/fa6";
import type { BuilderThemeTokens } from '@/components/landing/builder/types';
import { useBranding } from '@/hooks/branding';
import { useFooter } from '@/hooks/footer';
import { useContactUs } from '@/hooks/contact-us';

interface FooterProfessionalProps {
  theme: BuilderThemeTokens;
}

export default function FooterProfessional({ theme }: FooterProfessionalProps) {
  const branding = useBranding();
  const footerSection = useFooter();
  const contactInfo = useContactUs();

  const socialLinks = {
    facebook: contactInfo.find(c => c.type === 'facebook' && c.is_active),
    instagram: contactInfo.find(c => c.type === 'instagram' && c.is_active),
    twitter: contactInfo.find(c => c.type === 'twitter' && c.is_active),
    linkedin: contactInfo.find(c => c.type === 'linkedin' && c.is_active),
  };

  const phones = contactInfo.filter(c => c.type === 'phone' && c.is_active).slice(0, 2);
  const emails = contactInfo.filter(c => c.type === 'email' && c.is_active).slice(0, 1);

  const hasSocials = Object.values(socialLinks).some(Boolean);
  const hasContact = phones.length > 0 || emails.length > 0;

  const navLinks = [
    footerSection?.hasAboutUs && { href: '/about-us', label: 'About' },
    footerSection?.hasPress && { href: '/press', label: 'Press' },
    footerSection?.hasFaq && { href: '/faq', label: 'FAQ' },
    footerSection?.hasPrivacyPolicy && { href: '/privacy-policy', label: 'Privacy' },
    footerSection?.hasTermsAndConditions && { href: '/terms', label: 'Terms' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="w-full relative" id="Resources">
      <footer
        className="py-16 px-6 sm:px-10 lg:px-20"
        style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Top: Logo + Contact side by side */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 pb-10 border-b border-white/15">
            {/* Left: Logo & slogan */}
            <div className="flex-shrink-0">
              <Image
                src={branding?.logo?.light || "/assets/images/ayahay_logo_white.png"}
                alt="Logo"
                width={160}
                height={50}
                className="h-10 w-auto object-contain mb-4"
              />
              {branding?.slogan && (
                <p className="text-sm opacity-60 max-w-xs">{branding.slogan}</p>
              )}
            </div>

            {/* Right: Contact info inline */}
            {hasContact && (
              <div className="flex flex-wrap gap-6 text-sm">
                {phones.map(p => (
                  <a key={p.id} href={`tel:${p.value}`} className="flex items-center gap-2 hover:opacity-70">
                    <FaPhone className="w-3.5 h-3.5 opacity-60" />
                    <span>{p.value}</span>
                  </a>
                ))}
                {emails.map(e => (
                  <a key={e.id} href={`mailto:${e.value}`} className="flex items-center gap-2 hover:opacity-70">
                    <FaEnvelope className="w-3.5 h-3.5 opacity-60" />
                    <span>{e.value}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Bottom: Nav links + socials + copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
            {/* Nav links */}
            {navLinks.length > 0 && (
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="hover:opacity-70 opacity-80">
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Socials */}
            {hasSocials && (
              <div className="flex gap-5">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook.value} target="_blank" rel="noreferrer" className="hover:opacity-60 opacity-80">
                    <FaFacebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter.value} target="_blank" rel="noreferrer" className="hover:opacity-60 opacity-80">
                    <FaXTwitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram.value} target="_blank" rel="noreferrer" className="hover:opacity-60 opacity-80">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin.value} target="_blank" rel="noreferrer" className="hover:opacity-60 opacity-80">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {/* Copyright */}
            <p className="text-xs opacity-40">
              © {new Date().getFullYear()} {branding?.brand_name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
