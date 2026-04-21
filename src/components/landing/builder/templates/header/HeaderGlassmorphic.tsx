"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandingLogo } from "@/components/BrandingLogo";
import UserDropdown from "@/components/UserDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContexts";
import { useBranding } from "@/hooks/branding";
import type { IThemeSettings } from "@/models";
import { cn } from "@/lib/utils";

interface HeaderGlassmorphicProps {
  navItems: any[];
  scrollToElement: (id: string) => void;
  theme: IThemeSettings & { text: string; surfaceAlt: string };
}

export default function HeaderGlassmorphic({
  navItems,
  scrollToElement,
  theme,
}: HeaderGlassmorphicProps) {
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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[200] transition-all duration-500 px-4 sm:px-6 lg:px-10 py-4",
          scrolled ? "py-3" : "py-6"
        )}
      >
        <div 
          className={cn(
            "mx-auto max-w-7xl rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between gap-4 px-8 py-3",
            scrolled 
              ? "border-white/50 bg-white/60 shadow-2xl backdrop-blur-2xl" 
              : "border-white/40 bg-white/35 backdrop-blur-xl shadow-lg"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <BrandingLogo
              logoSrc={logoSrc}
              brandName={branding?.brand_name}
              imageClassName={cn("h-[40px] w-auto object-contain transition-all duration-500", scrolled && "h-[36px]")}
              textClassName="text-xl font-black tracking-tighter"
              textStyle={{ color: theme.text, fontFamily: "var(--font-title)" }}
            />
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  data-template-ignore="true"
                  onClick={() => scrollToElement(item.id)}
                  className="text-sm font-bold uppercase tracking-widest text-slate-900 hover:text-black transition-colors relative group"
                >
                  {item.name}
                  <span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: theme.primary }}
                  />
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  className="text-sm font-bold uppercase tracking-widest text-slate-900 hover:text-black transition-colors relative group"
                >
                  {item.name}
                  <span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: theme.primary }}
                  />
                </Link>
              )
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {currentUser && (
               <Link href={bookingsHref} className="hidden lg:block text-xs font-black uppercase tracking-widest text-slate-900 hover:text-black transition-colors">
                History
              </Link>
            )}
            
            <div className="flex items-center gap-2">
                <NotificationDropdown shouldBeTransparent={!scrolled} />
                <div className="h-8 w-[1px] bg-black/10 mx-2" />
                <UserDropdown shouldBeTransparent={!scrolled} />
            </div>

            {/* Mobile Toggle */}
            <button
                type="button"
                data-template-ignore="true"
                className="lg:hidden p-2 rounded-2xl bg-white/20 border border-white/40"
                onClick={() => setIsMenuOpen(true)}
            >
                <div className="w-5 h-0.5 bg-slate-900 mb-1.5" />
                <div className="w-5 h-0.5 bg-slate-900" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[300] bg-white/80 backdrop-blur-2xl transition-all duration-500 lg:hidden",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
         <div className="flex flex-col h-full p-10">
            <div className="flex items-center justify-between mb-20">
                 <BrandingLogo
                  logoSrc={logoSrc}
                  brandName={branding?.brand_name}
                  imageClassName="h-10 w-auto"
                />
                <button 
                    type="button"
                    data-template-ignore="true"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-4 rounded-full bg-black/5"
                >
                    <div className="w-6 h-0.5 bg-black rotate-45 translate-y-0.5" />
                    <div className="w-6 h-0.5 bg-black -rotate-45 -translate-y-0.5" />
                </button>
            </div>
            
            <div className="flex flex-col gap-8">
                {navItems.map((item) => (
                  item.trigger.toLowerCase() === "scroll" ? (
                    <button
                      key={item.id}
                      type="button"
                      data-template-ignore="true"
                      onClick={() => {
                          setIsMenuOpen(false);
                          scrollToElement(item.id);
                      }}
                      className="text-4xl font-black tracking-tighter text-left"
                      style={{ color: theme.text }}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.redirect_url}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-4xl font-black tracking-tighter text-left"
                      style={{ color: theme.text }}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
            </div>
         </div>
      </div>
    </>
  );
}
