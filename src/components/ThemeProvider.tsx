"use client";

import { IThemeSettings } from "@/models";

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: IThemeSettings | null;
}

export default function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  // No need to set styles here - the pre-hydration script already handles it
  // This component exists just to pass theme data through if needed in the future
  return <>{children}</>;
}
