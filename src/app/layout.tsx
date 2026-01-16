import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ServiceWorkerRegistry from '@/components/ServiceWorkerRegistry';
import ThemeProvider from '@/components/ThemeProvider';
import { getThemeSettings } from '@/services/ui/theme-settings.service';

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
  // Fetch theme on server-side
  const themeSettings = await getThemeSettings();

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
                    --theme-skeleton: ${themeSettings.primary.replace(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/, (_, l, c, h) => `oklch(95% 0.01 ${h})`)};
                  }
                `,
              }}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    try {
                      localStorage.setItem('ayahay_theme_settings', JSON.stringify(${JSON.stringify(themeSettings)}));
                    } catch (e) {
                      console.error('Failed to cache theme:', e);
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