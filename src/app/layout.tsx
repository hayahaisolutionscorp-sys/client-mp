import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ThemeProvider from '@/components/ThemeProvider';
import { getHeadersSections } from '@/services/ui/header-section.service';
import { getBrandingConfig } from '@/services/ui/branding.service';
import PwaInstallBanner from '@/components/pwa/PwaInstallBanner';
import DevServiceWorkerReset from '@/components/pwa/DevServiceWorkerReset';
import { ToasterProvider } from '@/components/ui/ToasterProvider';
import { hexToHsl } from '@/lib/color-utils';
import ThemeHydrator from '@/components/ThemeHydrator';
import { IThemeSettings } from "@/models";


export { generateMetadata };

import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch theme and header sections on server-side
  const brandingConfig = await getBrandingConfig();
  const headerSections = await getHeadersSections();

  // Derive theme settings from branding config with fallback to local theme-settings.json
  const themeSettings: IThemeSettings = {
    primary: brandingConfig?.colors?.primaryColor || (brandingConfig?.colors as any)?.primary || '#004C70',
    secondary: brandingConfig?.colors?.secondaryColor || (brandingConfig?.colors as any)?.secondary || '#7ACCFA',
    accent: brandingConfig?.colors?.accent || '#042B3F',
    primaryColor: brandingConfig?.colors?.primaryColor || (brandingConfig?.colors as any)?.primary || '#004C70',
    secondaryColor: brandingConfig?.colors?.secondaryColor || (brandingConfig?.colors as any)?.secondary || '#7ACCFA',
    fontStyle: 'Inter'
  };

  const primaryHsl = hexToHsl(themeSettings.primary);
  const secondaryHsl = hexToHsl(themeSettings.secondary);
  const accentHsl = hexToHsl(themeSettings.accent);


  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryHsl};
              --secondary: ${secondaryHsl};
              --accent: ${accentHsl};
            }
          `
        }} />
      </head>
      <body> {/* Ensure <body> is present */}
        <ThemeProvider initialTheme={themeSettings}>
          <AuthContextProvider>
            <ThemeHydrator theme={themeSettings} />
            <BodyWrapper> {/* Wrap everything inside BodyWrapper */}
              <ToasterProvider />
              <DevServiceWorkerReset />
              <PwaInstallBanner />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </BodyWrapper>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>

  );
}