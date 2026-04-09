"use client";

import { useThemeSettings } from "@/hooks/theme-settings";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Jost, Roboto, League_Spartan, Mountains_of_Christmas, Great_Vibes, Henny_Penny, Rubik_Gemstones, Inter } from "next/font/google";

// Define fonts and explicitly set the weight where required
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const roboto = Roboto({ subsets: ["latin"], weight: "400", variable: "--font-roboto" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const leagueSpartan = League_Spartan({ subsets: ["latin"], variable: "--font-league-spartan" });
const mountainsOfChristmas = Mountains_of_Christmas({ subsets: ["latin"], weight: "400", variable: "--font-mountains" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });
const hennyPenny = Henny_Penny({ subsets: ["latin"], weight: "400", variable: "--font-henny-penny" });
const rubikGemstones = Rubik_Gemstones({ subsets: ["latin"], weight: "400", variable: "--font-rubik-gemstones" });

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
  const themeSettings = useThemeSettings();
  const fontStyle = themeSettings?.fontStyle?.trim();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const previewPathMap: Record<string, string> = {
    "/": "/preview/landing",
    "/about-us": "/preview/about",
    "/contact-us": "/preview/contact",
    "/faq": "/preview/faq",
    "/press": "/preview/press",
    "/login": "/preview/login",
    "/schedule-and-fares": "/preview/schedule",
  };

  // Listen for navigation messages from TMS
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scroll-to-section') {
        const { sectionId, path } = event.data;
        const isPreviewRoute = pathname?.startsWith("/preview/");

        if (path) {
          const nextPath = isPreviewRoute ? (previewPathMap[path] || path) : path;
          if (nextPath !== pathname) {
            router.push(`${nextPath}?scroll=${sectionId}`);
            return;
          }
        }

        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router, pathname]);

  // Handle auto-scroll on page load from URL params
  useEffect(() => {
    const scrollId = searchParams.get('scroll');
    if (scrollId) {
      // Delay slightly to ensure content is rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(`section-${scrollId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Clean up only the `scroll` param; keep draftId and other query params.
          const params = new URLSearchParams(searchParams.toString());
          params.delete("scroll");
          const query = params.toString();
          const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div style={{ fontFamily: 'var(--font-body), sans-serif' }}>
      {children}
    </div>
  );
}
