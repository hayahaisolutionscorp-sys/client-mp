"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandingLogo } from "@/components/BrandingLogo";
import UserDropdown from "@/components/UserDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContexts";
import { useBranding } from "@/hooks/branding";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  name: string;
  trigger: string;
  redirect_url: string;
}

interface HeaderFloatingProps {
  navItems: NavItem[];
  scrollToElement: (id: string) => void;
  theme: any;
  useFloatingBehavior?: boolean;
}

export default function HeaderFloating({
  navItems,
  scrollToElement,
  theme,
  useFloatingBehavior = true,
}: HeaderFloatingProps) {
  const branding = useBranding();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bookingsHref = "/profile?tab=booking-history";

  const logoSrc = branding?.logo?.dark || branding?.logo?.light;

  const handleScroll = (id: string) => {
    scrollToElement(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={cn("z-[200] w-full px-4 sm:px-6 lg:px-10", useFloatingBehavior ? "fixed left-0 right-0 top-6" : "relative pt-4")}>
        <header 
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 px-6 py-4 shadow-lg backdrop-blur-md transition-all w-full max-w-7xl mx-auto"
            style={{ backgroundColor: `${theme.surface}B3` }} // ~70% opacity
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.surface}CC`)} // ~80% opacity
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${theme.surface}B3`)}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <BrandingLogo
              logoSrc={logoSrc}
              brandName={branding?.brand_name}
              imageClassName="h-[40px] w-auto object-contain transition-all duration-300"
              textClassName="text-xl font-semibold capitalize whitespace-nowrap"
              textStyle={{ color: theme.text, fontFamily: "var(--font-title)" }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden flex-1 flex-wrap items-center justify-center gap-4 lg:flex lg:gap-6" style={{ color: theme.text }}>
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => handleScroll(item.id)}
                  className="text-sm font-medium transition-all hover:border-b-2 border-transparent"
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  className="text-sm font-medium transition-all hover:border-b-2 border-transparent"
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
        </header>
      </div>

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
            <div className="pt-6 flex justify-center w-full">
              <UserDropdown shouldBeTransparent={false} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
