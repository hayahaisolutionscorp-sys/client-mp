import "./globals.css";

import { generateMetadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';
import ServiceWorkerRegistry from '@/components/ServiceWorkerRegistry';

export { generateMetadata };

import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body> {/* Ensure <body> is present */}
        <AuthContextProvider>
          <ServiceWorkerRegistry />
          <BodyWrapper> {/* Wrap everything inside BodyWrapper */}
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </BodyWrapper>
        </AuthContextProvider>
      </body>
    </html>
  );
}