import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ThemeProvider from '@/components/ThemeProvider';
import { getBrandingConfig } from '@/services/ui/branding.service';
import { getDestinations } from '@/services/ui/destinations.service';
import { getLandingBuilderContent } from '@/services/content/landing-builder.service';
import PwaInstallBanner from '@/components/pwa/PwaInstallBanner';
import DevServiceWorkerReset from '@/components/pwa/DevServiceWorkerReset';
import { ToasterProvider } from '@/components/ui/ToasterProvider';
import { getReadableTextColor, hexToHsl, toRgbCssValue } from '@/lib/color-utils';
import ThemeHydrator from '@/components/ThemeHydrator';
import { IThemeSettings } from "@/models";
import { getHeadersSections } from '@/services/ui/header-section.service';


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
  const [brandingConfig, destinations, landingBuilderConfig, initialHeaderSection] = await Promise.all([
    getBrandingConfig(),
    getDestinations(),
    getLandingBuilderContent(),
    getHeadersSections(),
  ]);

  // Derive theme settings from branding config with fallback to local theme-settings.json
  const themeSettings: IThemeSettings = {
    primary: brandingConfig?.colors?.primaryColor || (brandingConfig?.colors as any)?.primary || '#004C70',
    secondary: brandingConfig?.colors?.secondaryColor || (brandingConfig?.colors as any)?.secondary || '#7ACCFA',
    accent: brandingConfig?.colors?.accent || '#042B3F',
    primaryColor: brandingConfig?.colors?.primaryColor || (brandingConfig?.colors as any)?.primary || '#004C70',
    secondaryColor: brandingConfig?.colors?.secondaryColor || (brandingConfig?.colors as any)?.secondary || '#7ACCFA',
    fontStyle: brandingConfig?.font_family || brandingConfig?.fontFamily || 'Jost',
    fontTitle: brandingConfig?.font_family_title || brandingConfig?.fontFamilyTitle || brandingConfig?.font_family || brandingConfig?.fontFamily || 'Jost',
    surface: brandingConfig?.colors?.surface || '#FFFFFF',
    surfaceAlt: brandingConfig?.colors?.surfaceAlt || '#EEF8FC',
  };

  const primaryHsl = hexToHsl(themeSettings.primary);
  const secondaryHsl = hexToHsl(themeSettings.secondary);
  const accentHsl = hexToHsl(themeSettings.accent);
  const textOnSurface = getReadableTextColor(themeSettings.surface);
  const textOnSurfaceAlt = getReadableTextColor(themeSettings.surfaceAlt);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';


  const fontScaleMap: Record<string, string> = {
    'Jost': '100%',
    'Roboto': '100%',
    'Inter': '100%',
    'Poppins': '98%',
    'Montserrat': '95%',
    'League Spartan': '105%',
    'Manrope': '100%',
    'Urbanist': '100%',
    'Plus Jakarta Sans': '98%'
  };

  const fontScale = fontScaleMap[themeSettings.fontStyle] || '100%';

  return (
    <html lang="en" style={{ fontSize: fontScale }}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=${(themeSettings.fontStyle || 'Jost').replace(/ /g, '+')}:wght@400;700&family=${(themeSettings.fontTitle || themeSettings.fontStyle || 'Jost').replace(/ /g, '+')}:wght@400;700&display=swap');
            
            :root {
              --primary: ${primaryHsl};
              --secondary: ${secondaryHsl};
              --accent: ${accentHsl};
              --surface: ${themeSettings.surface};
              --surface-alt: ${themeSettings.surfaceAlt};
              --text-on-surface: ${textOnSurface};
              --text-on-surface-alt: ${textOnSurfaceAlt};
              --muted-on-surface: ${mutedOnSurface};
              --text-default-rgb: ${toRgbCssValue(textOnSurface)};
              --font-body: "${themeSettings.fontStyle}", sans-serif;
              --font-title: "${themeSettings.fontTitle || themeSettings.fontStyle}", sans-serif;
            }
            body, html {
              background-color: var(--surface);
              color: var(--text-on-surface);
            }
            body, html, * {
              font-family: var(--font-body) !important; 
            }
            h1, h2, h3, h4, h5, h6, .brand-title, .title {
              font-family: var(--font-title), var(--font-body) !important;
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider initialTheme={themeSettings} initialBranding={brandingConfig} initialDestinations={destinations}>
          <AuthContextProvider>
            <ThemeHydrator theme={themeSettings} />
            <BodyWrapper>
              <ToasterProvider />
              <DevServiceWorkerReset />
              <PwaInstallBanner />
              <LayoutWrapper
                initialLandingBuilderConfig={landingBuilderConfig}
                initialHeaderSection={initialHeaderSection ?? null}
              >
                {children}
              </LayoutWrapper>
            </BodyWrapper>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>

  );
}
