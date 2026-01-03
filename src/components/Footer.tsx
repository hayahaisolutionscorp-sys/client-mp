"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';

import { SHIPPING_LINE_LOGO } from "constants/storage"
import { useShippingLineForWhiteLabel } from '@/hooks/shipping-line';
import { getFooterSections } from "@/services";
import { IFooterSection } from "@/models";
import { getBrandingConfig } from "@/services/ui/branding.service";

const Footer = () => {
  const [footerSection, setFooterSection] = useState<IFooterSection | undefined>(undefined);
  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || "3"; // Default to Ayahay "3"
  const [cacheBuster, setCacheBuster] = useState("");
  const shippingLine = useShippingLineForWhiteLabel();

  useEffect(() => {
    setCacheBuster(uuidv4());
  }, []);

  useEffect(() => {
    const fetchFooterSection = async () => {
      const footerSection = await getFooterSections();
      if (footerSection) {
        setFooterSection(footerSection);
      }
    };

    fetchFooterSection();
  }, [shippingLineId]);

  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      const config = await getBrandingConfig();
      setBranding(config);
    };
    fetchBranding();
  }, []);

  return (
    <>
      <footer className="bg-[#13357B] text-white py-10 px-6 
        sm:px-10 lg:pt-48"
      >
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">

          {/* Logo and Tagline */}
          <div className="flex flex-col items-center mb-2 lg:mb-0 lg:items-start">
            <div
              className={`flex justify-center items-center overflow-hidden 
                ${(shippingLineId && shippingLineId !== "3") ? "rounded-lg bg-white p-2" : ""}`}
            >
              <Image
                src={
                  branding?.logo
                    ? branding.logo.light // Footer usually has dark background, so maybe light logo? 
                    // Wait, `Navbar` used logic based on `shouldBeTransparent`.
                    // The Footer background is `#13357B` (dark blue).
                    // So we probably want the Light logo ("white-ish").
                    // The existing code uses `ayahay_logo_white.png` for default. 
                    // So `branding.logo.light` is appropriate.
                    : (shippingLineId && shippingLineId !== "3")
                      ? `${SHIPPING_LINE_LOGO}${shippingLine?.logoFilename}?cache_buster=${cacheBuster}`
                      : "/assets/images/ayahay_logo_white.png"
                }
                alt="Ayahay Logo"
                width={200}
                height={500}
                className={`w-auto h-[100px] object-contain ${shippingLineId ? "rounded-full" : ""}`}
              />
            </div>

            {(shippingLineId && shippingLineId === "3") && (
              <p className="mt-4 text-center lg:text-left text-sm sm:text-base">
                Kay Ang Pagsakay, Dapat AYAHAY!
              </p>
            )}
          </div>

          {/* Company Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(footerSection?.hasAboutUs || footerSection?.hasPress) && (
              <div>
                <h3 className="font-semibold mb-5">Company</h3>
                <ul className="space-y-3 text-sm sm:text-base opacity-80">
                  {footerSection?.hasAboutUs && (
                    <li><Link href="/about-us" className="hover:underline">About us</Link></li>
                  )}
                  {footerSection?.hasPress && (
                    <li><Link href="/press" className="hover:underline">Press</Link></li>
                  )}
                </ul>
              </div>
            )}

            {(footerSection?.hasFaq) && (
              <div>
                <h3 className="font-semibold mb-5">Support</h3>
                <ul className="space-y-3 text-sm sm:text-base opacity-80">
                  {footerSection?.hasFaq && (
                    <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
                  )}
                </ul>
              </div>
            )}

            {(footerSection?.hasPrivacyPolicy || footerSection?.hasTermsAndConditions) && (
              <div>
                <h3 className="font-semibold mb-5">Legal Docs</h3>
                <ul className="space-y-3 text-sm sm:text-base opacity-80">
                  {footerSection?.hasPrivacyPolicy && (
                    <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
                  )}
                  {footerSection?.hasTermsAndConditions && (
                    <li><Link href="/terms" className="hover:underline">Terms and Conditions</Link></li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold mb-5">Customer Care</h3>
            {(footerSection?.primaryContactNumberNetwork && footerSection?.primaryContactNumber) && (
              <p className="mb-5 text-sm sm:text-base opacity-80">
                {footerSection.primaryContactNumberNetwork}: {footerSection.primaryContactNumber}
              </p>
            )}
            {(footerSection?.secondaryContactNumberNetwork && footerSection?.secondaryContactNumber) && (
              <p className="mb-5 text-sm sm:text-base opacity-80">
                {footerSection.secondaryContactNumberNetwork}: {footerSection.secondaryContactNumber}
              </p>
            )}

            <h4 className="font-semibold mt-8 mb-5">Need support?</h4>
            {footerSection?.email && (
              <a href={`mailto:${footerSection.email}`} className="text-sm sm:text-base opacity-80 hover:underline">
                {footerSection.email}
              </a>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white opacity-80 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm">
          {(shippingLineId && shippingLineId !== "3") ? (
            <div className="flex items-center justify-center mb-4 sm:mb-0">
              <p className="mr-2 text-center sm:text-left">
                © 2025 Powered by Ayahay.
              </p>
              <Image
                src="/assets/images/ayahay_logo_only.png"
                alt="Ayahay Logo"
                width={70}
                height={70}
                className="h-[35px] w-[35px] object-contain"
              />
            </div>
          ) : (
            <p className="mb-4 sm:mb-0 text-center sm:text-left">
              © 2025 Ayahay. All rights reserved.
            </p>
          )}
          <div className="flex space-x-4">
            {footerSection?.twitterUrl && (
              <a href={`${footerSection.twitterUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Visit us on Twitter">
                <FaXTwitter className="opacity-80 w-5 h-5" />
              </a>
            )}
            {footerSection?.linkedInUrl && (
              <a href={`${footerSection.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Visit us on LinkedIn">
                <FaLinkedin className="opacity-80 w-5 h-5" />
              </a>
            )}
            {footerSection?.facebookUrl && (
              <a href={`${footerSection.facebookUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Visit us on Facebook">
                <FaFacebook className="opacity-80 w-5 h-5" />
              </a>
            )}
            {footerSection?.instagramUrl && (
              <a href={`${footerSection.instagramUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Visit us on Instagram">
                <FaInstagram className="opacity-80 w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;