"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandingLogo } from "@/components/BrandingLogo";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UserDropdown from "@/components/UserDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContexts";
import { useBranding } from "@/hooks/branding";
import { useHeaders } from "@/hooks/headers";
import type { IThemeSettings } from "@/models";
import HeaderFloating from "./templates/header/HeaderFloating";
import HeaderGlassmorphic from "./templates/header/HeaderGlassmorphic";
import HeaderBoardingPass from "./templates/header/HeaderBoardingPass";
import {
  getFilteredLandingNavItems,
  scrollToLandingTarget,
  type HeaderNavigationConfig,
} from "@/lib/landing-nav";

interface BuilderLandingHeaderProps {
  variant: string;
  useFloatingBehavior?: boolean;
  theme: IThemeSettings & { text: string; surfaceAlt: string };
  headerSectionOverride?: HeaderNavigationConfig | null;
}

export default function BuilderLandingHeader({
  variant,
  useFloatingBehavior = true,
  theme,
  headerSectionOverride,
}: BuilderLandingHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const branding = useBranding();
  const { currentUser } = useAuth();
  const headerSection = useHeaders(headerSectionOverride) || headerSectionOverride;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoSrc = branding?.logo?.dark || branding?.logo?.light;
  const navItems = getFilteredLandingNavItems(headerSection);
  const bookingsHref = "/profile?tab=booking-history";

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
        useFloatingBehavior={useFloatingBehavior}
      />
    );
  }

  if (variant === "glassmorphic") {
    return (
      <HeaderGlassmorphic
        navItems={navItems}
        scrollToElement={scrollToElement}
        theme={theme}
        useFloatingBehavior={useFloatingBehavior}
      />
    );
  }

  if (variant === "boarding-pass") {
    return (
      <HeaderBoardingPass
        navItems={navItems}
        scrollToElement={scrollToElement}
        theme={theme}
        useFloatingBehavior={useFloatingBehavior}
      />
    );
  }

  if (variant === "professional-slate") {
    return (
      <>
        <header
          className="relative z-[200] mx-4 mt-4 rounded-[28px] border px-5 py-4 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur"
          style={{
            borderColor: `${theme.text}14`,
            background: `linear-gradient(135deg, ${theme.surface}F4, ${theme.surfaceAlt}F2)`,
            color: theme.text,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex flex-shrink-0 items-center gap-3">
              <BrandingLogo
                logoSrc={logoSrc}
                brandName={branding?.brand_name}
                imageClassName="h-[40px] w-auto object-contain transition-all duration-300"
                textClassName="text-lg font-semibold capitalize"
                textStyle={{ fontFamily: "var(--font-title)" }}
              />
            </Link>

            <nav
              className="hidden flex-1 flex-wrap items-center justify-center gap-4 lg:flex lg:gap-6"
              style={{ color: theme.text }}
            >
              {navItems.map((item) =>
                item.trigger.toLowerCase() === "scroll" ? (
                  <button
                    key={item.id}
                    type="button"
                    data-template-ignore="true"
                    onClick={() => handleScroll(item.id)}
                    className="text-sm font-medium transition-all hover:border-b-2 border-transparent"
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={item.redirect_url}
                    className="text-sm font-medium transition-all hover:border-b-2 border-transparent"
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <div className="hidden items-center gap-4 lg:flex">
                    <Link href={bookingsHref} className="text-sm font-medium" style={{ color: theme.text }}>
                      My Bookings
                    </Link>
                    <NotificationDropdown shouldBeTransparent={false} />
                  </div>
                  <div className="flex items-center gap-3 lg:hidden">
                    <NotificationDropdown shouldBeTransparent={false} mobile />
                  </div>
                </>
              ) : null}
              <div className="hidden lg:flex">
                <UserDropdown shouldBeTransparent={false} />
              </div>
              <button
                type="button"
                className="relative z-50 inline-flex items-center justify-center p-2 lg:hidden"
                data-template-ignore="true"
                aria-label="Toggle menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative h-6 w-6">
                  <span
                    className={`absolute block h-0.5 w-6 transform transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"
                    }`}
                    style={{ backgroundColor: theme.text }}
                  />
                  <span
                    className={`absolute block h-0.5 w-6 transform transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ backgroundColor: theme.text }}
                  />
                  <span
                    className={`absolute block h-0.5 w-6 transform transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"
                    }`}
                    style={{ backgroundColor: theme.text }}
                  />
                </div>
              </button>
            </div>
          </div>
        </header>

        <div
          className={`fixed inset-0 z-[150] transition-opacity duration-300 lg:hidden ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ backgroundColor: theme.surface }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-50 p-2"
            data-template-ignore="true"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="relative h-6 w-6">
              <span
                className="absolute block h-0.5 w-6 translate-y-0 rotate-45"
                style={{ backgroundColor: theme.text }}
              />
              <span
                className="absolute block h-0.5 w-6 translate-y-0 -rotate-45"
                style={{ backgroundColor: theme.text }}
              />
            </div>
          </button>
          <div className="h-full w-full overflow-y-auto px-4 pt-[100px]">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              {navItems.map((item) =>
                item.trigger.toLowerCase() === "scroll" ? (
                  <button
                    key={item.id}
                    type="button"
                    data-template-ignore="true"
                    onClick={() => handleScroll(item.id)}
                    className="block w-full text-center text-lg font-medium transition-colors hover:opacity-80"
                    style={{ color: theme.text }}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={item.redirect_url}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-4 text-center text-lg font-medium transition-colors hover:opacity-80"
                    style={{ color: theme.text }}
                  >
                    {item.name}
                  </Link>
                )
              )}
              <div className="flex w-full justify-center pt-6">
                <UserDropdown shouldBeTransparent={false} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (variant === "island-premium") {
    return (
      <>
        <header
          className="relative z-[200] mx-3 mt-3 rounded-[30px] border px-4 py-3 shadow-[0_24px_80px_-45px_rgba(8,47,73,0.42)] backdrop-blur sm:mx-5 sm:mt-5 sm:px-5"
          style={{
            color: theme.text,
            backgroundColor: `${theme.surfaceAlt}EB`,
            borderColor: `${theme.primary}22`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex flex-shrink-0 items-center gap-3">
              <BrandingLogo
                logoSrc={logoSrc}
                brandName={branding?.brand_name}
                imageClassName="h-[38px] w-auto object-contain transition-all duration-300"
                textClassName="text-lg font-semibold capitalize"
                textStyle={{ color: theme.text, fontFamily: "var(--font-title)" }}
              />
            </Link>
            <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium lg:flex" style={{ color: `${theme.text}CC` }}>
              {navItems.map((item) =>
                item.trigger.toLowerCase() === "scroll" ? (
                  <button
                    key={item.id}
                    type="button"
                    data-template-ignore="true"
                    onClick={() => handleScroll(item.id)}
                    className="transition-opacity hover:opacity-70"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link key={item.id} href={item.redirect_url} className="transition-opacity hover:opacity-70">
                    {item.name}
                  </Link>
                )
              )}
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex">
                <UserDropdown shouldBeTransparent={false} />
              </div>
              <button
                type="button"
                className="relative z-50 inline-flex items-center justify-center p-2 lg:hidden"
                data-template-ignore="true"
                aria-label="Toggle menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative h-6 w-6">
                  <span className={`absolute block h-0.5 w-6 transform transition-all duration-300 ${isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"}`} style={{ backgroundColor: theme.text }} />
                  <span className={`absolute block h-0.5 w-6 transform transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} style={{ backgroundColor: theme.text }} />
                  <span className={`absolute block h-0.5 w-6 transform transition-all duration-300 ${isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"}`} style={{ backgroundColor: theme.text }} />
                </div>
              </button>
            </div>
          </div>
        </header>
        <div
          className={`fixed inset-0 z-[150] transition-opacity duration-300 lg:hidden ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ backgroundColor: theme.surface }}
        >
            <button
              type="button"
            className="absolute right-4 top-4 z-50 p-2"
              data-template-ignore="true"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative h-6 w-6">
              <span className="absolute block h-0.5 w-6 translate-y-0 rotate-45" style={{ backgroundColor: theme.text }} />
              <span className="absolute block h-0.5 w-6 translate-y-0 -rotate-45" style={{ backgroundColor: theme.text }} />
              </div>
            </button>
          <div className="h-full w-full overflow-y-auto px-6 pt-[100px]">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              {navItems.map((item) =>
                item.trigger.toLowerCase() === "scroll" ? (
                  <button
                    key={item.id}
                    type="button"
                    data-template-ignore="true"
                    onClick={() => handleScroll(item.id)}
                    className="block w-full py-3 text-center text-lg font-medium"
                    style={{ color: theme.text }}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={item.redirect_url}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-3 text-center text-lg font-medium"
                    style={{ color: theme.text }}
                  >
                    {item.name}
                  </Link>
                )
              )}
              <div className="flex w-full justify-center pt-6">
                <UserDropdown shouldBeTransparent={false} />
              </div>
            </div>
          </div>
        </div>
      </>
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
        className="relative z-[200] w-full border-b border-black/5 backdrop-blur"
        style={{ backgroundColor: `${theme.surface}F2` }} // ~95% opacity
      >
        <div className="flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-10 py-5">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <BrandingLogo
              logoSrc={logoSrc}
              brandName={branding?.brand_name}
              imageClassName="h-[40px] w-auto object-contain transition-all duration-300"
              textClassName="text-xl font-semibold capitalize"
              textStyle={{ color: theme.text, fontFamily: "var(--font-title)" }}
            />
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
            {currentUser ? (
              <>
                <Link href={bookingsHref} className="hidden text-sm font-medium lg:inline-flex" style={{ color: theme.text }}>
                  My Bookings
                </Link>
                <NotificationDropdown shouldBeTransparent={false} />
              </>
            ) : null}
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
        className={`fixed inset-0 z-[150] transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
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
