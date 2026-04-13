"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";



import { useBranding } from "@/hooks/branding";
import { useFooter } from "@/hooks/footer";
import { useContactUs } from "@/hooks/contact-us";
import SubscribeBanner from "@/components/landing/SubscribeBanner";

interface FooterProps {
  showSubscribeBanner?: boolean;
}

const Footer = ({ showSubscribeBanner = true }: FooterProps) => {
  const branding = useBranding();
  const footerSection = useFooter();
  const contactInfo = useContactUs();



  const socialLinks = {
    facebook: contactInfo.find(c => c.type === 'facebook' && c.is_active),
    instagram: contactInfo.find(c => c.type === 'instagram' && c.is_active),
    twitter: contactInfo.find(c => c.type === 'twitter' && c.is_active),
    linkedin: contactInfo.find(c => c.type === 'linkedin' && c.is_active),
  };

  const phoneNumbers = contactInfo.filter(c => c.type === 'phone' && c.is_active);
  const emails = contactInfo.filter(c => c.type === 'email' && c.is_active);

  return (
    <>
      <div className={`w-full relative ${showSubscribeBanner ? "lg:pt-56" : ""}`} id="Resources">
        {showSubscribeBanner && (
          <div className="flex items-center justify-center w-full">
            <SubscribeBanner />
          </div>
        )}
        <footer
          className="bg-primary py-10 px-6 text-primary-foreground sm:px-10 lg:pt-48"
        >
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">

          {/* Logo and Tagline */}
          <div className="flex flex-col items-center mb-2 lg:mb-0 lg:items-start">
            <div
              className={`flex justify-center items-center overflow-hidden ${(branding?.logo?.light || '').toLowerCase().endsWith('.png') ? 'bg-white p-2 rounded-lg' : ''
                }`}
            >
              <Image
                src={branding?.logo?.light || "/assets/images/ayahay_logo_white.png"}
                alt="Ayahay Logo"
                width={200}
                height={500}
                className={`w-auto h-[100px] object-contain`}
              />
            </div>

            <p className="mt-4 text-center lg:text-left text-sm sm:text-base">
              {branding?.slogan}
            </p>
          </div>

          {/* Company Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(footerSection?.hasAboutUs || footerSection?.hasPress) && (
              <div key="company-links">
                <h3 className="font-semibold mb-5">Company</h3>
                <ul className="space-y-3 text-sm sm:text-base opacity-80">
                  {footerSection?.hasAboutUs && (
                    <li key="about"><Link href="/about-us" className="hover:underline">About us</Link></li>
                  )}
                  {footerSection?.hasPress && (
                    <li key="press"><Link href="/press" className="hover:underline">Press</Link></li>
                  )}
                </ul>
              </div>
            )}

            {(footerSection?.hasFaq) && (
              <div key="support-links">
                <h3 className="font-semibold mb-5">Support</h3>
                <ul className="space-y-3 text-sm sm:text-base opacity-80">
                  {footerSection?.hasFaq && (
                    <li key="faq"><Link href="/faq" className="hover:underline">FAQ</Link></li>
                  )}
                </ul>
              </div>
            )}

            {(footerSection?.hasPrivacyPolicy || footerSection?.hasTermsAndConditions) && (
              <div key="legal-links">
                <h3 className="font-semibold mb-5">Legal Docs</h3>
                <ul className="space-y-3 text-sm sm:text-base opacity-80">
                  {footerSection?.hasPrivacyPolicy && (
                    <li key="privacy"><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
                  )}
                  {footerSection?.hasTermsAndConditions && (
                    <li key="terms"><Link href="/terms" className="hover:underline">Terms and Conditions</Link></li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold mb-5">Customer Care</h3>
            {phoneNumbers.map((phone, idx) => (
              <p key={`phone-${phone.id || idx}`} className="mb-5 text-sm sm:text-base opacity-80 whitespace-nowrap">
                {phone.label}:{' '}
                <a href={`tel:${phone.value.replace(/\s/g, '')}`} className="hover:underline">
                  {phone.value}
                </a>
              </p>
            ))}

            <h4 className="font-semibold mt-8 mb-5">Need support?</h4>
            {emails.map((email, idx) => (
              <a key={`email-${email.id || idx}`} href={`mailto:${email.value}`} className="block mb-2 text-sm sm:text-base opacity-80 hover:underline">
                {email.value}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white opacity-80 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm">
          <p className="mb-4 sm:mb-0 text-center sm:text-left">
            © {new Date().getFullYear()} {branding?.brand_name}. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {socialLinks.twitter && (
              <a href={`${socialLinks.twitter.value}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-60" aria-label="Visit us on Twitter">
                <FaXTwitter className="opacity-80 w-5 h-5" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={`${socialLinks.linkedin.value}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-60" aria-label="Visit us on LinkedIn">
                <FaLinkedin className="opacity-80 w-5 h-5" />
              </a>
            )}
            {socialLinks.facebook && (
              <a href={`${socialLinks.facebook.value}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-60" aria-label="Visit us on Facebook">
                <FaFacebook className="opacity-80 w-5 h-5" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={`${socialLinks.instagram.value}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-60" aria-label="Visit us on Instagram">
                <FaInstagram className="opacity-80 w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Footer;