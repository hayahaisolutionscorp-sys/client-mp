"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { IThemeSettings, IBrandingConfig } from "@/models";
import { IDestination } from "@/services/ui/destinations.service";

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
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(initialTheme || null);
  const [branding, setBranding] = useState<IBrandingConfig | null>(initialBranding || null);
  const [destinations, setDestinations] = useState<IDestination[] | null>(initialDestinations || null);

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

  return (
    <ThemeContext.Provider value={{ themeSettings, setThemeSettings, branding, setBranding, destinations, setDestinations }}>
      {children}
    </ThemeContext.Provider>
  );
}
