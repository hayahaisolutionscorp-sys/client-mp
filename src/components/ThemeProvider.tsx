"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { IThemeSettings } from "@/models";

interface ThemeContextType {
  themeSettings: IThemeSettings | null;
  setThemeSettings: (theme: IThemeSettings) => void;
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
}

export default function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(initialTheme || null);

  useEffect(() => {
    if (initialTheme) {
      setThemeSettings(initialTheme);
    }
  }, [initialTheme]);

  return (
    <ThemeContext.Provider value={{ themeSettings, setThemeSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}
