'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProactiveRefreshScheduler } from '@/components/auth/ProactiveRefreshScheduler';
import BuilderLandingHeader from '@/components/landing/builder/BuilderLandingHeader';
import FooterCentered from '@/components/landing/builder/templates/footer/FooterCentered';
import FooterPremium from '@/components/landing/builder/templates/footer/FooterPremium';
import { useLandingBuilder } from '@/hooks/landing-builder';
import { useBranding } from '@/hooks/branding';
import { createBuilderTheme } from '@/components/landing/builder/theme';
import { cn } from '@/lib/utils';
import type { LandingBuilderContent } from '@/lib/landing-builder';
import type { HeaderNavigationConfig } from '@/lib/landing-nav';

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });
const SessionExpiredModal = dynamic(
  () => import('@/components/auth/SessionExpiredModal').then(m => ({ default: m.SessionExpiredModal })),
  { ssr: false }
);

export default function LayoutWrapper({
  children,
  initialLandingBuilderConfig,
  initialHeaderSection,
}: Readonly<{
  children: React.ReactNode;
  initialLandingBuilderConfig: LandingBuilderContent | null;
  initialHeaderSection: HeaderNavigationConfig | null;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const landingBuilder = useLandingBuilder(initialLandingBuilderConfig);
  const branding = useBranding();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPreviewRoute = pathname.startsWith('/preview');
  const hideLayout =
    isPreviewRoute ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/') ||
    pathname === '/booking/seat-selection';
  const isProfilePage = pathname === '/profile';
  const shouldRenderChrome = !hideLayout && pathname !== '/';
  const headerVariant =
    landingBuilder?.sections.find((section) => section.section_key === 'header')?.variant || 'default';
  const footerVariant =
    landingBuilder?.sections.find((section) => section.section_key === 'footer')?.variant || 'default';
  const builderTheme = createBuilderTheme((branding ?? {}) as any);
  const theme = {
    ...builderTheme,
    fontStyle: builderTheme.fontFamily,
    fontTitle: builderTheme.fontFamilyTitle,
  };
  const mainOffsetClass = shouldRenderChrome
    ? headerVariant === 'floating'
      ? 'pt-[120px]'
      : headerVariant === 'professional-slate'
        ? 'pt-4'
        : ''
    : '';
  const useBuilderLandingHeader =
    headerVariant === 'centered' ||
    headerVariant === 'floating' ||
    headerVariant === 'professional-slate';

  return (
    <>
      {shouldRenderChrome && useBuilderLandingHeader ? (
        <BuilderLandingHeader
          variant={headerVariant}
          theme={theme}
          headerSectionOverride={initialHeaderSection}
        />
      ) : null}
      {shouldRenderChrome && !useBuilderLandingHeader ? (
        <Navbar showLandingNav initialHeaderSection={initialHeaderSection} />
      ) : null}
      <main className={cn("wl-brand-radius-scope", mainOffsetClass)}>{children}</main>
      {shouldRenderChrome && !isProfilePage && footerVariant === 'centered' ? <FooterCentered theme={theme} /> : null}
      {shouldRenderChrome && !isProfilePage && footerVariant === 'premium' ? <FooterPremium theme={theme} /> : null}
      {shouldRenderChrome && !isProfilePage && footerVariant === 'default-no-banner' ? (
        <Footer showSubscribeBanner={false} />
      ) : null}
      {shouldRenderChrome && !isProfilePage && !['centered', 'premium', 'default-no-banner'].includes(footerVariant) ? (
        <Footer />
      ) : null}
      <ProactiveRefreshScheduler />
      {mounted && <SessionExpiredModal />}
      {mounted && !isPreviewRoute && <ChatWidget tenantId={parseInt(process.env.NEXT_PUBLIC_TENANT_ID || "1", 10)} />}
    </>
  );
}
