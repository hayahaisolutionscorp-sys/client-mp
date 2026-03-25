"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import UserDropdown from "@/components/UserDropdown";
import { NAV_ITEMS } from "constants/index";
import { useBranding } from "@/hooks/branding";
import { useHeaders } from "@/hooks/headers";
import HeaderFloating from "./templates/header/HeaderFloating";

interface BuilderLandingHeaderProps {
  variant: string;
}

export default function BuilderLandingHeader({ variant }: BuilderLandingHeaderProps) {
  const branding = useBranding();
  const headerSection = useHeaders();

  const navItems = NAV_ITEMS.filter((item) => {
    if (!headerSection) return true;
    if (item.id === "Promos") return headerSection.showPromos;
    if (item.id === "Routes") return headerSection.showRoutes;
    if (item.id === "Resources") return headerSection.showResources;
    if (item.id === "AboutUs") return headerSection.showAboutUs;
    return true;
  });

  const scrollToElement = (id: string) => {
    if (id === "Resources") {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (variant === "floating") {
    return (
      <>
        <HeaderFloating navItems={navItems} scrollToElement={scrollToElement} />
        <div className="lg:hidden">
          <Navbar />
        </div>
      </>
    );
  }

  if (variant !== "centered") {
    return <Navbar />;
  }

  return (
    <>
      <header className="hidden border-b border-slate-200 bg-white/95 backdrop-blur lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <div className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Marketplace
          </div>

          <Link href="/" className="text-lg font-bold text-customBlue">
            {branding?.brand_name || "Ayahay"}
          </Link>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            {navItems.map((item) =>
              item.trigger.toLowerCase() === "scroll" ? (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToElement(item.id)}
                  className="font-medium transition-colors hover:text-customBlue"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.redirect_url}
                  className="font-medium transition-colors hover:text-customBlue"
                >
                  {item.name}
                </Link>
              )
            )}
            <UserDropdown shouldBeTransparent={false} />
          </div>
        </div>
      </header>

      <div className="lg:hidden">
        <Navbar />
      </div>
    </>
  );
}
