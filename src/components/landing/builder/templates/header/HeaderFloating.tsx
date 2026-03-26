"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "@/components/UserDropdown";
import { useBranding } from "@/hooks/branding";

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
}

export default function HeaderFloating({ navItems, scrollToElement, theme }: HeaderFloatingProps) {
  const branding = useBranding();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoSrc = branding?.logo?.dark || branding?.logo?.light;

  const handleScroll = (id: string) => {
    scrollToElement(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-10">
        <header 
            className="flex items-center justify-between gap-6 rounded-2xl border border-white/20 px-6 py-4 shadow-lg backdrop-blur-md transition-all w-full"
            style={{ backgroundColor: `${theme.surface}B3` }} // ~70% opacity
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.surface}CC`)} // ~80% opacity
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${theme.surface}B3`)}
        >
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

          {/* Desktop Nav */}
          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex lg:gap-8" style={{ color: theme.text }}>
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
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
            <div className="hidden lg:flex">
              <UserDropdown shouldBeTransparent={false} />
            </div>
            <button
              className="relative z-50 inline-flex items-center justify-center p-2 lg:hidden"
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
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ backgroundColor: theme.surface }}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 z-50 p-2"
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
                  onClick={() => handleScroll(item.id)}
                  className="block w-full text-left text-lg font-medium transition-colors hover:opacity-80"
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
