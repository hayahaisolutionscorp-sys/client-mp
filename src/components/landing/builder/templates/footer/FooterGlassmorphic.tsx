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

interface FooterGlassmorphicProps {
  theme: BuilderThemeTokens;
}

export default function FooterGlassmorphic({ theme }: FooterGlassmorphicProps) {
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
    <div className="w-full relative px-4 sm:px-6 lg:px-10 pb-10" id="Resources">
      <footer 
        className="relative overflow-hidden rounded-[4rem] border border-white/40 bg-white/10 p-12 md:p-20 shadow-2xl backdrop-blur-2xl"
      >
        {/* Decorative Orbs */}
        <div 
           className="absolute -right-20 -top-20 h-80 w-80 rounded-full blur-[120px] opacity-[0.08]"
           style={{ backgroundColor: theme.primary }}
        />
        <div 
           className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[120px] opacity-[0.08]"
           style={{ backgroundColor: theme.accent }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-20">
            
            {/* Brand Information */}
            <div className="lg:col-span-5 flex flex-col items-start gap-8">
              <Image
                src={branding?.logo?.dark || "/assets/images/ayahay_logo.png"}
                alt="Logo"
                width={200}
                height={80}
                className="h-14 w-auto object-contain drop-shadow-sm"
              />
              {branding?.slogan && (
                <p className="text-xl font-medium leading-relaxed opacity-80" style={{ color: theme.text }}>
                  {branding.slogan}
                </p>
              )}
              
              <div className="flex gap-4">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook.value} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/20 border border-white/40 hover:bg-white/40 transition-all">
                    <FaFacebook className="w-5 h-5 text-slate-800" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter.value} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/20 border border-white/40 hover:bg-white/40 transition-all">
                    <FaXTwitter className="w-5 h-5 text-slate-800" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram.value} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-white/20 border border-white/40 hover:bg-white/40 transition-all">
                    <FaInstagram className="w-5 h-5 text-slate-800" />
                  </a>
                )}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
               <div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-40">Company</h4>
                  <ul className="space-y-4 font-bold text-sm" style={{ color: theme.text }}>
                    {footerSection?.hasAboutUs && <li><Link href="/about-us" className="hover:opacity-60 transition-opacity">About us</Link></li>}
                    {footerSection?.hasPress && <li><Link href="/press" className="hover:opacity-60 transition-opacity">Press</Link></li>}
                  </ul>
               </div>

               <div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-40">Support</h4>
                  <ul className="space-y-4 font-bold text-sm" style={{ color: theme.text }}>
                    {footerSection?.hasFaq && <li><Link href="/faq" className="hover:opacity-60 transition-opacity">FAQ</Link></li>}
                    <li><Link href="/contact-us" className="hover:opacity-60 transition-opacity">Contact Us</Link></li>
                  </ul>
               </div>

               <div className="col-span-2 sm:col-span-1">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-40">Contact</h4>
                  <div className="space-y-4 font-bold text-sm" style={{ color: theme.text }}>
                    {phones.map(p => (
                       <div key={p.id} className="flex items-center gap-3">
                          <FaPhone className="w-3 h-3 opacity-40" />
                          <a href={`tel:${p.value}`} className="hover:opacity-60 transition-opacity">{p.value}</a>
                       </div>
                    ))}
                    {emails.map(e => (
                       <div key={e.id} className="flex items-center gap-3">
                          <FaEnvelope className="w-3 h-3 opacity-40" />
                          <a href={`mailto:${e.value}`} className="hover:opacity-60 transition-opacity truncate max-w-[150px] inline-block">{e.value}</a>
                       </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-12 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold opacity-30 tracking-widest" style={{ color: theme.text }}>
              © {new Date().getFullYear()} {branding?.brand_name}. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest opacity-40">
                {footerSection?.hasPrivacyPolicy && <Link href="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy</Link>}
                {footerSection?.hasTermsAndConditions && <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
