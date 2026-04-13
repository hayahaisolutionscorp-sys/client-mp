"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { IThemeSettings, IBrandingConfig } from "@/models";
import { IDestination } from "@/services/ui/destinations.service";
import { getReadableTextColor, hexToHsl, toRgbCssValue } from "@/lib/color-utils";
import { deriveThemeFromBranding } from "@/lib/derive-theme-from-branding";
import { getBrandRadiusCssLength, resolveBrandCornerRadiusClass } from "@/lib/branding/brand-radius";

interface ThemeContextType {
  themeSettings: IThemeSettings | null;
  setThemeSettings: (theme: IThemeSettings) => void;
  branding: IBrandingConfig | null;
  setBranding: (branding: IBrandingConfig) => void;
  destinations: IDestination[] | null;
  setDestinations: (destinations: IDestination[]) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: IThemeSettings | null;
  initialBranding?: IBrandingConfig | null;
  initialDestinations?: IDestination[] | null;
}

export default function ThemeProvider({ children, initialTheme, initialBranding, initialDestinations }: ThemeProviderProps) {
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(
    () => initialTheme ?? deriveThemeFromBranding(initialBranding ?? null)
  );
  const [branding, setBranding] = useState<IBrandingConfig | null>(initialBranding || null);
  const [destinations, setDestinations] = useState<IDestination[] | null>(initialDestinations || null);

  const buttonTemplate = ((branding?.colors as any)?.buttonTemplate || "modern-solid") as
    | "modern-solid"
    | "gradient-shift"
    | "glass-frost"
    | "outline-tech"
    | "soft-minimal";

  const primary = branding?.colors?.primaryColor || branding?.colors?.primary || "#23abff";
  const secondary = branding?.colors?.secondaryColor || branding?.colors?.secondary || "#0ea5e9";

  const templateButtonCss = useMemo(() => {
    const selector = `
      [data-button-template-scope] button:not([data-template-ignore="true"]):not([role="switch"]):not([data-slot="accordion-trigger"]),
      [data-button-template-scope] input[type="submit"]:not([data-template-ignore="true"])
    `;

    const shared = `
      ${selector} {
        border-radius: var(--wl-br, 0.9rem);
        transition:
          transform 220ms ease,
          box-shadow 220ms ease,
          background 220ms ease,
          background-color 220ms ease,
          border-color 220ms ease,
          color 220ms ease,
          filter 220ms ease;
        animation: templateButtonIn 460ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      ${selector}:hover {
        transform: translateY(-1px);
      }

      ${selector}:active {
        transform: translateY(0) scale(0.98);
      }

      @keyframes templateButtonIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;

    const variants: Record<typeof buttonTemplate, string> = {
      "modern-solid": `
        ${selector} {
          background: ${primary};
          color: #ffffff;
          border: 1px solid ${primary};
          box-shadow: 0 10px 24px ${primary}33;
        }

        ${selector}:hover {
          filter: brightness(1.05);
          box-shadow: 0 14px 28px ${primary}44;
        }
      `,
      "gradient-shift": `
        ${selector} {
          background: linear-gradient(120deg, ${primary}, ${secondary}, ${primary});
          background-size: 200% 200%;
          color: #ffffff;
          border: 1px solid transparent;
          box-shadow: 0 12px 28px ${primary}33;
        }

        ${selector}:hover {
          background-position: 100% 50%;
          box-shadow: 0 16px 32px ${primary}44;
        }
      `,
      "glass-frost": `
        ${selector} {
          background: rgba(255, 255, 255, 0.40);
          color: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }

        ${selector}:hover {
          background: rgba(255, 255, 255, 0.55);
        }
      `,
      "outline-tech": `
        ${selector} {
          background: transparent;
          color: ${primary};
          border: 2px solid ${primary};
          box-shadow: inset 0 0 0 1px ${primary}10;
        }

        ${selector}:hover {
          background: ${primary};
          color: #ffffff;
        }
      `,
      "soft-minimal": `
        ${selector} {
          background: ${primary}16;
          color: ${primary};
          border: 1px solid ${primary}24;
          box-shadow: inset 0 0 0 1px ${primary}12;
        }

        ${selector}:hover {
          background: ${primary}24;
        }
      `,
    };

    return `${shared}\n${variants[buttonTemplate]}`;
  }, [buttonTemplate, primary, secondary]);

  useEffect(() => {
    if (initialTheme) {
      setThemeSettings(initialTheme);
    }
  }, [initialTheme]);

  useEffect(() => {
    if (initialBranding) {
      setBranding(initialBranding);
    }
  }, [initialBranding]);

  useEffect(() => {
    if (initialDestinations) {
      setDestinations(initialDestinations);
    }
  }, [initialDestinations]);

  // Resolved theme: explicit settings win; else branding-derived (matches SSR layout + avoids gaps on navigation).
  const resolvedTheme = useMemo(
    () => themeSettings ?? deriveThemeFromBranding(branding),
    [themeSettings, branding]
  );

  // Keep :root CSS variables aligned with resolved theme (same tokens as app/layout.tsx head block).
  useEffect(() => {
    if (typeof document === "undefined" || !resolvedTheme) return;
    const root = document.documentElement;
    const surface = resolvedTheme.surface || "#FFFFFF";
    const surfaceAlt = resolvedTheme.surfaceAlt || "#EEF8FC";
    const textOnSurface = getReadableTextColor(surface);
    const textOnSurfaceAlt = getReadableTextColor(surfaceAlt);
    const mutedOnSurface = textOnSurface === "#f8fafc" ? "#cbd5e1" : "#64748b";

    root.style.setProperty("--primary", hexToHsl(resolvedTheme.primary));
    root.style.setProperty("--secondary", hexToHsl(resolvedTheme.secondary));
    root.style.setProperty("--accent", hexToHsl(resolvedTheme.accent));
    root.style.setProperty("--surface", surface);
    root.style.setProperty("--surface-alt", surfaceAlt);
    root.style.setProperty("--text-on-surface", textOnSurface);
    root.style.setProperty("--text-on-surface-alt", textOnSurfaceAlt);
    root.style.setProperty("--muted-on-surface", mutedOnSurface);
    root.style.setProperty("--text-default-rgb", toRgbCssValue(textOnSurface));
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const length = getBrandRadiusCssLength(resolveBrandCornerRadiusClass(branding));
    root.style.setProperty("--wl-br", length);
    root.setAttribute("data-wl-br-active", "true");
  }, [branding]);

  const contextValue = useMemo(() => ({
    themeSettings, setThemeSettings,
    branding, setBranding,
    destinations, setDestinations,
  }), [themeSettings, branding, destinations]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div data-button-template-scope data-button-template={buttonTemplate}>
        <style dangerouslySetInnerHTML={{ __html: templateButtonCss }} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
