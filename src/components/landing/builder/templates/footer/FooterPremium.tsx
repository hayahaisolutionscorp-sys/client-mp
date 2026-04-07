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

interface FooterPremiumProps {
  theme: BuilderThemeTokens;
}

export default function FooterPremium({ theme }: FooterPremiumProps) {
  const branding = useBranding();
  const footerSection = useFooter();
  const contactInfo = useContactUs();

  const socialLinks = {
    facebook: contactInfo.find(c => c.type === 'facebook' && c.is_active),
    instagram: contactInfo.find(c => c.type === 'instagram' && c.is_active),
    twitter: contactInfo.find(c => c.type === 'twitter' && c.is_active),
    linkedin: contactInfo.find(c => c.type === 'linkedin' && c.is_active),
  };

  const phones = contactInfo.filter(c => c.type === 'phone' && c.is_active).slice(0, 1);
  const emails = contactInfo.filter(c => c.type === 'email' && c.is_active).slice(0, 1);

  return (
    <div className="w-full relative" id="Resources">
    <footer 
      className="py-24 px-6 sm:px-10 lg:px-24 border-t-8"
      style={{ backgroundColor: theme.surface, borderTopColor: theme.primary }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Logo and Slogan */}
        <div className="mb-14 flex flex-col items-center text-center">
           <Image
            src={branding?.logo?.dark || "/assets/images/ayahay_logo.png"}
            alt="Logo"
            width={180}
            height={60}
            className="h-12 w-auto object-contain mb-6"
          />
          <p className="max-w-md text-lg opacity-80" style={{ color: theme.text }}>
            {branding?.slogan || "Revolutionizing maritime travel across the Philippine seas."}
          </p>
        </div>

        {/* Info Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-16 border-b border-black/5">
           {/* Section 1: Explore */}
           <div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-8 opacity-40">Company</h4>
              <ul className="space-y-4" style={{ color: theme.text }}>
                {footerSection?.hasAboutUs && <li><Link href="/about-us" className="hover:opacity-60">About us</Link></li>}
                {footerSection?.hasPress && <li><Link href="/press" className="hover:opacity-60">Press</Link></li>}
              </ul>
           </div>

           {/* Section 2: Support */}
           <div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-8 opacity-40">Support</h4>
              <ul className="space-y-4" style={{ color: theme.text }}>
                {footerSection?.hasFaq && <li><Link href="/faq" className="hover:opacity-60">FAQ</Link></li>}
              </ul>
           </div>

           {/* Section 3: Legal */}
           <div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-8 opacity-40">Legal Docs</h4>
              <ul className="space-y-4" style={{ color: theme.text }}>
                {footerSection?.hasPrivacyPolicy && <li><Link href="/privacy-policy" className="hover:opacity-60">Privacy Policy</Link></li>}
                {footerSection?.hasTermsAndConditions && <li><Link href="/terms" className="hover:opacity-60">Terms and Conditions</Link></li>}
              </ul>
           </div>

           {/* Section 4: Contact */}
           <div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-8 opacity-40">Contact Us</h4>
              <div className="space-y-4 font-medium" style={{ color: theme.text }}>
                {phones.map(p => (
                   <div key={p.id} className="flex items-center gap-3">
                      <FaPhone className="w-4 h-4 opacity-50" />
                      <a href={`tel:${p.value}`} className="hover:opacity-60">{p.value}</a>
                   </div>
                ))}
                {emails.map(e => (
                   <div key={e.id} className="flex items-center gap-3">
                      <FaEnvelope className="w-4 h-4 opacity-50" />
                      <a href={`mailto:${e.value}`} className="hover:opacity-60">{e.value}</a>
                   </div>
                ))}
              </div>
           </div>
        </div>

        {/* Social and Bottom */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center py-10 gap-8">
           <div className="text-sm opacity-40 flex items-center gap-2" style={{ color: theme.text }}>
              <span>© {new Date().getFullYear()} {branding?.brand_name}.</span>
              <span>All rights reserved.</span>
           </div>

           <div className="flex gap-8">
              {socialLinks.facebook && (
                 <a href={socialLinks.facebook.value} target="_blank" rel="noreferrer" style={{ color: theme.text }} className="hover:opacity-50">
                    <FaFacebook className="w-6 h-6" />
                 </a>
              )}
              {socialLinks.twitter && (
                 <a href={socialLinks.twitter.value} target="_blank" rel="noreferrer" style={{ color: theme.text }} className="hover:opacity-50">
                    <FaXTwitter className="w-6 h-6" />
                 </a>
              )}
              {socialLinks.instagram && (
                 <a href={socialLinks.instagram.value} target="_blank" rel="noreferrer" style={{ color: theme.text }} className="hover:opacity-50">
                    <FaInstagram className="w-6 h-6" />
                 </a>
              )}
              {socialLinks.linkedin && (
                 <a href={socialLinks.linkedin.value} target="_blank" rel="noreferrer" style={{ color: theme.text }} className="hover:opacity-50">
                    <FaLinkedin className="w-6 h-6" />
                 </a>
              )}
           </div>
        </div>
      </div>
    </footer>
    </div>
  );
}
