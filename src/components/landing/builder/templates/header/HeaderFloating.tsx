"use client";

import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";
import { useBranding } from "@/hooks/branding";

interface HeaderFloatingProps {
  navItems: any[];
  scrollToElement: (id: string) => void;
}

export default function HeaderFloating({ navItems, scrollToElement }: HeaderFloatingProps) {
  const branding = useBranding();

  return (
    <div className="fixed top-6 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
      <header className="flex items-center justify-between gap-6 rounded-2xl border border-white/20 bg-white/70 px-6 py-4 shadow-lg backdrop-blur-md transition-all hover:bg-white/80">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-customBlue">
            {branding?.brand_name || "Ayahay"}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) =>
            item.trigger.toLowerCase() === "scroll" ? (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToElement(item.id)}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-customBlue"
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.redirect_url}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-customBlue"
              >
                {item.name}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <UserDropdown shouldBeTransparent={false} />
        </div>
      </header>
    </div>
  );
}
