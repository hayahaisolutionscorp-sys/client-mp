'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { BuilderThemeTokens } from '@/components/landing/builder/types';
import { useBranding } from '@/hooks/branding';
import { useFooter } from '@/hooks/footer';
import { useContactUs } from '@/hooks/contact-us';

interface FooterCenteredProps {
  theme: BuilderThemeTokens;
}

export default function FooterCentered({ theme }: FooterCenteredProps) {
  const branding = useBranding();
  const footerSection = useFooter();
  const contactInfo = useContactUs();

  const socialLinks = {
    facebook: contactInfo.find(c => c.type === 'facebook' && c.is_active),
    instagram: contactInfo.find(c => c.type === 'instagram' && c.is_active),
    twitter: contactInfo.find(c => c.type === 'twitter' && c.is_active),
    linkedin: contactInfo.find(c => c.type === 'linkedin' && c.is_active),
  };

  return (
    <div className="w-full relative" id="Resources">
      <footer 
        className="py-20 px-6 border-t border-black/5"
        style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
      >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8">
           <Image
            src={branding?.logo?.light || "/assets/images/ayahay_logo_white.png"}
            alt="Logo"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-sm font-medium">
          {footerSection?.hasAboutUs && <Link href="/about-us" className="hover:opacity-70">About us</Link>}
          {footerSection?.hasPress && <Link href="/press" className="hover:opacity-70">Press</Link>}
          {footerSection?.hasFaq && <Link href="/faq" className="hover:opacity-70">FAQ</Link>}
          {footerSection?.hasPrivacyPolicy && <Link href="/privacy-policy" className="hover:opacity-70">Privacy Policy</Link>}
          {footerSection?.hasTermsAndConditions && <Link href="/terms" className="hover:opacity-70">Terms and Conditions</Link>}
        </div>

        {/* Social */}
        <div className="flex gap-6 mb-10">
          {socialLinks.facebook && (
             <a href={socialLinks.facebook.value} target="_blank" rel="noreferrer" className="hover:opacity-70 text-white">
                <FaFacebook className="w-5 h-5" />
             </a>
          )}
          {socialLinks.twitter && (
             <a href={socialLinks.twitter.value} target="_blank" rel="noreferrer" className="hover:opacity-70 text-white">
                <FaXTwitter className="w-5 h-5" />
             </a>
          )}
          {socialLinks.instagram && (
             <a href={socialLinks.instagram.value} target="_blank" rel="noreferrer" className="hover:opacity-70 text-white">
                <FaInstagram className="w-5 h-5" />
             </a>
          )}
          {socialLinks.linkedin && (
             <a href={socialLinks.linkedin.value} target="_blank" rel="noreferrer" className="hover:opacity-70 text-white">
                <FaLinkedin className="w-5 h-5" />
             </a>
          )}
        </div>

        {/* Copyright */}
        <div className="text-xs opacity-50" style={{ color: theme.text }}>
          © {new Date().getFullYear()} {branding?.brand_name}. All rights reserved.
        </div>
      </div>
    </footer>
    </div>
  );
}
