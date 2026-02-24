import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ThemeProvider from '@/components/ThemeProvider';
import { getHeadersSections } from '@/services/ui/header-section.service';
import { getBrandingConfig } from '@/services/ui/branding.service';
import PwaInstallBanner from '@/components/pwa/PwaInstallBanner';
import { ToasterProvider } from '@/components/ui/ToasterProvider';

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
  const themeSettings = {
    primary: brandingConfig?.colors?.primaryColor || (brandingConfig?.colors as any)?.primary,
    secondary: brandingConfig?.colors?.secondaryColor || (brandingConfig?.colors as any)?.secondary,
    accent: brandingConfig?.colors?.accent,
    fontStyle: 'Inter'
  };

  return (
    <html lang="en">
      <body> {/* Ensure <body> is present */}
        <AuthContextProvider>
          <ThemeProvider initialTheme={themeSettings}>
            <BodyWrapper> {/* Wrap everything inside BodyWrapper */}
              <ToasterProvider />
              <PwaInstallBanner />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </BodyWrapper>
          </ThemeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}