"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UserDropdown from "@/components/UserDropdown";
import { useBranding } from "@/hooks/branding";
import { useHeaders } from "@/hooks/headers";
import HeaderFloating from "./templates/header/HeaderFloating";
import {
  getFilteredLandingNavItems,
  scrollToLandingTarget,
  type HeaderNavigationConfig,
} from "@/lib/landing-nav";

interface BuilderLandingHeaderProps {
  variant: string;
  theme: any;
  headerSectionOverride?: HeaderNavigationConfig | null;
}

export default function BuilderLandingHeader({
  variant,
  theme,
  headerSectionOverride,
}: BuilderLandingHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const branding = useBranding();
  const headerSection = useHeaders(headerSectionOverride) || headerSectionOverride;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoSrc = branding?.logo?.dark || branding?.logo?.light;
  const navItems = getFilteredLandingNavItems(headerSection);

  const scrollToElement = (id: string) => {
    scrollToLandingTarget({
      id,
      pathname,
      navigate: (href) => router.push(href),
    });
  };

  const handleScroll = (id: string) => {
    scrollToElement(id);
    setIsMenuOpen(false);
  };

  if (variant === "floating") {
    return (
      <HeaderFloating
        navItems={navItems}
        scrollToElement={scrollToElement}
        theme={theme}
      />
    );
  }

  if (variant === "professional-slate") {
    return (
      <header
        className="mx-4 mt-4 rounded-[28px] border px-5 py-4 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur"
        style={{
          borderColor: `${theme.text}14`,
          background: `linear-gradient(135deg, ${theme.surface}F4, ${theme.surfaceAlt}F2)`,
          color: theme.text,
        }}
      >
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            {logoSrc ? (
              <Image
                alt="Company Logo"
                src={logoSrc}
                width={150}
                height={150}
                className="h-[40px] w-auto object-contain"
              />
            ) : (
              <span className="text-lg font-semibold capitalize" style={{ fontFamily: 'var(--font-title)' }}>
                {branding?.brand_name || "Ayahay"}
              </span>
            )}
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => handleScroll(item.id)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: `${theme.text}BF` }}
                >
                  {item.name}
                </button>
              ) : (
                <Link key={item.id} href={item.redirect_url} className="text-sm font-medium transition-colors" style={{ color: `${theme.text}BF` }}>
                  {item.name}
                </Link>
              )
            )}
          </div>
          <button
            type="button"
            data-template-ignore="true"
            className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{
              borderColor: `${theme.primary}33`,
              backgroundColor: `${theme.primary}14`,
              color: theme.primary,
            }}
          >
            Login
          </button>
        </div>
      </header>
    );
  }

  if (variant !== "centered") {
    return (
      <Navbar
        initialHeaderSection={headerSectionOverride}
        showLandingNav
      />
    );
  }

  return (
    <>
      <header 
        className="w-full border-b border-black/5 backdrop-blur"
        style={{ backgroundColor: `${theme.surface}F2` }} // ~95% opacity
      >
        <div className="flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-10 py-5">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {logoSrc ? (
              <Image
                alt="Company Logo"
                src={logoSrc}
                width={150}
                height={150}
                className="h-[40px] w-auto object-contain transition-all duration-300"
              />
            ) : (
              <span className="text-xl font-semibold capitalize" style={{ color: theme.text, fontFamily: 'var(--font-title)' }}>
                {branding?.brand_name || "Ayahay"}
              </span>
            )}
          </Link>

          {/* Desktop Nav — centered */}
          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex lg:gap-8 text-sm" style={{ color: theme.text }}>
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => handleScroll(item.id)}
                  className="font-medium transition-all hover:border-b-2 border-transparent"
                  style={{ "--hover-color": theme.primary } as any}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  className="font-medium transition-all hover:border-b-2 border-transparent"
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right: UserDropdown + mobile hamburger */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex">
              <UserDropdown shouldBeTransparent={false} />
            </div>
            <button
              className="relative z-50 inline-flex items-center justify-center p-2 lg:hidden"
              data-template-ignore="true"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative h-6 w-6">
                <span
                  className={`absolute block h-0.5 w-6 bg-customText transform transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-2"}`}
                />
                <span
                  className={`absolute block h-0.5 w-6 bg-customText transform transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute block h-0.5 w-6 bg-customText transform transition-all duration-300 ${isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-2"}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ backgroundColor: theme.surface }}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 z-50 p-2"
          data-template-ignore="true"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="relative h-6 w-6">
            <span className="absolute block h-0.5 w-6 rotate-45 translate-y-0" style={{ backgroundColor: theme.text }} />
            <span className="absolute block h-0.5 w-6 -rotate-45 translate-y-0" style={{ backgroundColor: theme.text }} />
          </div>
        </button>
        <div className="h-full w-full overflow-y-auto px-4 pt-[100px]">
          <div className="space-y-1">
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => handleScroll(item.id)}
                  className="block w-full py-4 text-left text-lg font-medium transition-colors hover:opacity-80"
                  style={{ color: theme.text }}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-4 text-lg font-medium transition-colors hover:opacity-80"
                  style={{ color: theme.text }}
                >
                  {item.name}
                </Link>
              )
            )}
            <div className="pt-4">
              <UserDropdown shouldBeTransparent={false} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
