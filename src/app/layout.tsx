import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ServiceWorkerRegistry from '@/components/ServiceWorkerRegistry';
import ThemeProvider from '@/components/ThemeProvider';
import { getHeadersSections } from '@/services/ui/header-section.service';
import { getBrandingConfig } from '@/services/ui/branding.service';

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
      <head>
        {/* Inject theme as CSS to avoid hydration mismatch */}
        {themeSettings && (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  :root {
                    --theme-primary: ${themeSettings.primary};
                    --theme-secondary: ${themeSettings.secondary};
                    --theme-accent: ${themeSettings.accent};
                    --theme-skeleton: ${themeSettings.primary?.replace?.(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/, (_: any, l: any, c: any, h: any) => `oklch(95% 0.01 ${h})`) || 'oklch(95% 0.01 0)'};
                  }
                `,
              }}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    try {
                      localStorage.setItem('theme_settings', JSON.stringify(${JSON.stringify(themeSettings)}));
                      if (${JSON.stringify(headerSections)}) {
                        localStorage.setItem('header_sections', JSON.stringify(${JSON.stringify(headerSections)}));
                      }
                      if (${JSON.stringify(brandingConfig)}) {
                        localStorage.setItem('branding_config', JSON.stringify(${JSON.stringify(brandingConfig)}));
                      }
                    } catch (e) {
                      console.error('Failed to cache theme, header sections, or branding:', e);
                    }
                  })();
                `,
              }}
            />
          </>
        )}
      </head>
      <body> {/* Ensure <body> is present */}
        <AuthContextProvider>
          <ServiceWorkerRegistry />
          <ThemeProvider initialTheme={themeSettings}>
            <BodyWrapper> {/* Wrap everything inside BodyWrapper */}
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