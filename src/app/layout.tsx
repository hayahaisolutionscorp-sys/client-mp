import "./globals.css";

import { metadata } from "./metadata";
import AuthContextProvider from "@/contexts/AuthContexts";
import LayoutWrapper from "./layoutWrapper";
import BodyWrapper from '@/components/BodyWrapper';

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body> {/* Ensure <body> is present */}
      <AuthContextProvider>
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