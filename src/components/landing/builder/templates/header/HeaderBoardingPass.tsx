"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandingLogo } from "@/components/BrandingLogo";
import UserDropdown from "@/components/UserDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContexts";
import { useBranding } from "@/hooks/branding";
import type { IThemeSettings } from "@/models";
import { cn } from "@/lib/utils";

interface HeaderBoardingPassProps {
  navItems: any[];
  scrollToElement: (id: string) => void;
  theme: IThemeSettings & { text: string; surfaceAlt: string };
}

export default function HeaderBoardingPass({
  navItems,
  scrollToElement,
  theme,
}: HeaderBoardingPassProps) {
  const branding = useBranding();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const logoSrc = branding?.logo?.dark || branding?.logo?.light;
  const bookingsHref = "/profile?tab=booking-history";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setNow(`${hh}:${mm}`);
    };
    tick();
    const i = setInterval(tick, 30_000);
    return () => clearInterval(i);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[200] transition-all duration-300 px-3 sm:px-4 lg:px-6",
          scrolled ? "pt-2" : "pt-4"
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-6xl rounded-xl border-2 transition-all duration-300 flex items-stretch gap-0 overflow-hidden",
            scrolled
              ? "shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18)]"
              : "shadow-[0_2px_0_rgba(15,23,42,0.08)]"
          )}
          style={{
            borderColor: theme.text + "1a",
            backgroundColor: "#FFFDF7",
          }}
        >
          {/* Stub strip */}
          <div
            className="hidden sm:flex items-center justify-center px-4 font-mono text-[10px] uppercase tracking-[0.2em] border-r-2 border-dashed"
            style={{
              borderColor: theme.text + "26",
              color: theme.text,
              backgroundColor: theme.primary + "0d",
            }}
          >
            <span className="opacity-70">BRD · {now}</span>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center pl-4 pr-3 py-3 flex-shrink-0">
            <BrandingLogo
              logoSrc={logoSrc}
              brandName={branding?.brand_name}
              imageClassName={cn(
                "h-[36px] w-auto object-contain transition-all",
                scrolled && "h-[32px]"
              )}
              textClassName="text-lg font-black tracking-tight"
              textStyle={{ color: theme.text, fontFamily: "var(--font-title)" }}
            />
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center flex-1 gap-1 px-4">
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => scrollToElement(item.id)}
                  className="group relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                  style={{ color: theme.text }}
                >
                  <span className="opacity-40 mr-1">›</span>
                  {item.name}
                  <span
                    className="absolute left-3 right-3 bottom-1 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
                    style={{ backgroundColor: theme.primary }}
                  />
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  className="group relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                  style={{ color: theme.text }}
                >
                  <span className="opacity-40 mr-1">›</span>
                  {item.name}
                  <span
                    className="absolute left-3 right-3 bottom-1 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
                    style={{ backgroundColor: theme.primary }}
                  />
                </Link>
              )
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 px-3 border-l-2 border-dashed" style={{ borderColor: theme.text + "26" }}>
            {currentUser && (
              <Link
                href={bookingsHref}
                className="hidden lg:inline-block font-mono text-[10px] uppercase tracking-[0.2em] font-black px-2 py-1 border-2"
                style={{ color: theme.primary, borderColor: theme.primary }}
              >
                ★ Trips
              </Link>
            )}
            <NotificationDropdown shouldBeTransparent={false} />
            <div className="h-6 w-[1px]" style={{ backgroundColor: theme.text + "1a" }} />
            <UserDropdown shouldBeTransparent={false} />

            <button
              type="button"
              data-template-ignore="true"
              className="lg:hidden p-2 border-2"
              style={{ borderColor: theme.text + "33" }}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
            >
              <div className="w-5 h-0.5 mb-1" style={{ backgroundColor: theme.text }} />
              <div className="w-5 h-0.5 mb-1" style={{ backgroundColor: theme.text }} />
              <div className="w-5 h-0.5" style={{ backgroundColor: theme.text }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[300] transition-all duration-300 lg:hidden",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ backgroundColor: "#FAF7F0" }}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between pb-6 border-b-2 border-dashed" style={{ borderColor: theme.text + "33" }}>
            <BrandingLogo
              logoSrc={logoSrc}
              brandName={branding?.brand_name}
              imageClassName="h-9 w-auto"
            />
            <button
              type="button"
              data-template-ignore="true"
              onClick={() => setIsMenuOpen(false)}
              className="p-3 border-2"
              style={{ borderColor: theme.text + "33" }}
              aria-label="Close"
            >
              <div className="w-5 h-0.5 rotate-45 translate-y-0.5" style={{ backgroundColor: theme.text }} />
              <div className="w-5 h-0.5 -rotate-45 -translate-y-0" style={{ backgroundColor: theme.text }} />
            </button>
          </div>

          <nav className="flex flex-col mt-6 divide-y-2 divide-dashed" style={{ borderColor: theme.text + "1a" }}>
            {navItems.map((item, idx) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToElement(item.id);
                  }}
                  className="flex items-baseline gap-4 py-5 text-left"
                >
                  <span className="font-mono text-xs opacity-40">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>
                    {item.name}
                  </span>
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-baseline gap-4 py-5"
                >
                  <span className="font-mono text-xs opacity-40">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>
                    {item.name}
                  </span>
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
