import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import { NotificationProvider } from "@/contexts/NotificationContext";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ThemeProvider from '@/components/ThemeProvider';
import { getHeadersSections } from '@/services/ui/header-section.service';
import { getBrandingConfigWithSource } from '@/services/ui/branding.service';
import { getDestinations } from '@/services/ui/destinations.service';
import { getLandingBuilderContent } from '@/services/content/landing-builder.service';
import PwaInstallBanner from '@/components/pwa/PwaInstallBanner';
import DevServiceWorkerReset from '@/components/pwa/DevServiceWorkerReset';
import { ToasterProvider } from '@/components/ui/ToasterProvider';
import NextTopLoader from 'nextjs-toploader';
import { Suspense } from 'react';
import { getReadableTextColor, hexToHsl, toRgbCssValue } from '@/lib/color-utils';
import ThemeHydrator from '@/components/ThemeHydrator';
import { getInitialAuthFromCookies } from '@/lib/auth/get-initial-account-from-cookies';
import { IThemeSettings } from "@/models";
import { getBrandRadiusCssLength, resolveBrandCornerRadiusClass } from '@/lib/branding/brand-radius';
import { THEME_FONT_SCALE_MAP } from '@/lib/theme-document';


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
  const [
    { data: brandingConfig, source: brandingSource },
    destinations,
    landingBuilderConfig,
    initialHeaderSection,
    initialAuth,
  ] = await Promise.all([
    getBrandingConfigWithSource(),
    getDestinations(),
    getLandingBuilderContent(),
    getHeadersSections(),
    getInitialAuthFromCookies(),
  ]);

  const isFallbackBranding = brandingSource === 'fallback';

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
  const textOnPrimary = getReadableTextColor(themeSettings.primaryColor || themeSettings.primary);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';


  const fontScale = THEME_FONT_SCALE_MAP[themeSettings.fontStyle] || '100%';

  const wlBr = getBrandRadiusCssLength(resolveBrandCornerRadiusClass(brandingConfig as any));

  return (
    <html lang="en" data-wl-br-active="true" style={{ fontSize: fontScale }} suppressHydrationWarning>
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
              --text-on-primary: ${textOnPrimary};
              --muted-on-surface: ${mutedOnSurface};
              --text-default-rgb: ${toRgbCssValue(textOnSurface)};
              --font-body: "${themeSettings.fontStyle}", sans-serif;
              --font-title: "${themeSettings.fontTitle || themeSettings.fontStyle}", sans-serif;
              --wl-br: ${wlBr};
            }
            body, html {
              background: var(--surface);
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
          <AuthContextProvider
            initialUser={initialAuth.initialUser}
            hasSessionCookies={initialAuth.hasSessionCookies}
          >
            <NotificationProvider>
              <ThemeHydrator theme={themeSettings} isFallback={isFallbackBranding} />
              <Suspense fallback={null}>
                <BodyWrapper>
                  <NextTopLoader color={themeSettings.primary} height={3} showSpinner={false} />
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
              </Suspense>
            </NotificationProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>

  );
}
