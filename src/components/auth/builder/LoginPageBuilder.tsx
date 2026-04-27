'use client';
import { useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import type { IBrandingConfig, IThemeSettings } from '@/models';
import { createBuilderTheme } from '@/components/landing/builder/theme';
import { getReadableTextColor } from '@/lib/color-utils';
import { getLoginPageLayout, normalizeLoginBuilderContent } from '@/lib/login-builder';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginVerifyForm } from '@/components/auth/LoginVerifyForm';
import { AuthSidebar } from '@/components/auth/AuthSidebar';
import type { ILoginPage } from '@/services/content/login.service';
import { cn } from '@/lib/utils';
import { AnimatedSection } from '@/components/whitelabel/AnimatedSection';
import { useThemeSettings as useThemeSettingsHook } from '@/hooks/theme-settings';
import { useBranding as useBrandingHook } from '@/hooks/branding';
import { brandRadiusScopeStyle, resolveBrandCornerRadiusClass } from '@/lib/branding/brand-radius';
import { formatCssFontStack } from '@/lib/theme-document';

interface LoginPageBuilderProps {
  loginPage: ILoginPage | null;
  step: 'email' | 'verify';
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export function LoginPageBuilder({ loginPage, step, themeSettings, branding }: LoginPageBuilderProps) {
  const contextThemeSettings = useThemeSettingsHook();
  const contextBranding = useBrandingHook();
  const resolvedThemeSettings = themeSettings ?? contextThemeSettings ?? null;
  const resolvedBranding = branding ?? contextBranding ?? null;

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scroll-to-section') {
        const sectionId = event.data?.sectionId;
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setActiveSectionId(sectionId);
          setTimeout(() => setActiveSectionId(null), 2000);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sectionAnimationsRaw = resolvedBranding?.colors?.sectionAnimations;
  let sectionAnimations: Record<string, string> = {};
  if (sectionAnimationsRaw) {
    if (typeof sectionAnimationsRaw === 'string') {
      try {
        sectionAnimations = JSON.parse(sectionAnimationsRaw);
      } catch (e) {}
    } else if (typeof sectionAnimationsRaw === 'object') {
      sectionAnimations = sectionAnimationsRaw as Record<string, string>;
    }
  }

  const getAnimationCSSForSection = (sectionId: string, animation: string) => {
    if (!animation || animation === 'none') return '';
    const scope = `.anim-section-${sectionId}`;
    switch (animation) {
      case 'smooth-up':
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            opacity: 0;
            animation: textSmoothUp-${sectionId} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: 0.2s;
          }
          @keyframes textSmoothUp-${sectionId} {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(1); }
          }
        `;
      case 'staggered':
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            opacity: 0;
            filter: blur(10px);
            animation: textStaggered-${sectionId} 1s ease-out forwards;
            animation-delay: 0.3s;
          }
          @keyframes textStaggered-${sectionId} {
            0% { opacity: 0; filter: blur(10px); transform: scale(0.98); }
            100% { opacity: 1; filter: blur(0px); transform: scale(1); }
          }
        `;
      case 'typewriter':
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            clip-path: inset(0 100% 0 0);
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            clip-path: inset(0 100% 0 0);
            animation: textTypewriterReveal-${sectionId} 3s steps(60, end) forwards;
            animation-delay: 0.2s;
          }
          @keyframes textTypewriterReveal-${sectionId} {
            from { clip-path: inset(0 100% 0 0); }
            to { clip-path: inset(0 0 0 0); }
          }
        `;
      case 'floating':
        return `
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            animation: textFloat-${sectionId} 3s ease-in-out infinite;
          }
          @keyframes textFloat-${sectionId} {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `;
      case 'zoom-in':
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            opacity: 0;
            animation: textZoom-${sectionId} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes textZoom-${sectionId} {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `;
      default:
        return '';
    }
  };

  const fullAnimationCSS = Object.entries(sectionAnimations)
    .filter(([id]) => id.startsWith('login_'))
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join('\n');
  const builderConfig = normalizeLoginBuilderContent(loginPage?.content);
  const theme = createBuilderTheme((resolvedBranding ?? {}) as IBrandingConfig);
  const primaryColor = resolvedThemeSettings?.primaryColor || resolvedThemeSettings?.primary || theme.primary;
  const secondaryColor = resolvedThemeSettings?.secondaryColor || resolvedThemeSettings?.secondary || theme.secondary;
  const accentColor = resolvedThemeSettings?.accent || theme.accent;
  const surfaceColor = resolvedThemeSettings?.surface || theme.surface;
  const surfaceAltColor = resolvedThemeSettings?.surfaceAlt || theme.surfaceAlt;
  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const formSection = builderConfig.sections.find((section) => section.section_key === 'form');
  const sidebarSection = builderConfig.sections.find((section) => section.section_key === 'sidebar');
  const heroSection = builderConfig.sections.find((section) => section.section_key === 'hero');
  const footerSection = builderConfig.sections.find((section) => section.section_key === 'footer');
  const layoutVariant = builderConfig.page_variant || builderConfig.layout_variant || 'split-right';
  const layout = getLoginPageLayout(layoutVariant);
  const heroVariant = heroSection?.variant || 'default';
  const formVariant = formSection?.variant || 'default';
  const sidebarVariant = sidebarSection?.variant || 'default';
  const hasSidebar = sidebarSection?.enabled !== false;
  const isLeftLayout = layoutVariant === 'split-left';
  const isRoundedCanvas = layout.shell === 'canvas' && layoutVariant !== 'glassmorphic-blur';
  const isBrandImmersive = layout.shell === 'immersive';
  const isGlassmorphicBlur = layoutVariant === 'glassmorphic-blur';
  const isBoardingPass = layoutVariant === 'boarding-pass';
  const isIslandPremium = layoutVariant === 'island-premium';
  const heroTextColor = isLeftLayout ? '#f8fafc' : textOnSurface;
  const heroMutedColor = isLeftLayout ? 'rgba(248,250,252,0.74)' : textOnSurfaceAlt;
  const brandName = resolvedBranding?.brand_name || 'Ayahay';
  const brandTagline = resolvedBranding?.tagline || resolvedBranding?.slogan || '';
  const footerCopy = `${brandName} account access`;
  const brandRadiusClass = resolveBrandCornerRadiusClass(resolvedBranding, 'rounded-2xl');
  const bodyFontStack = formatCssFontStack(theme.fontFamily);
  const titleFontStack = formatCssFontStack(theme.fontFamilyTitle, theme.fontFamily);
  const heroFontStyle = { fontFamily: titleFontStack };
  const splitDirectionGradient = isLeftLayout
    ? `radial-gradient(circle at 18% 18%, ${primaryColor}55 0, transparent 28%), radial-gradient(circle at 82% 12%, ${secondaryColor}40 0, transparent 24%), linear-gradient(135deg, color-mix(in srgb, ${primaryColor} 82%, #0f172a 18%), color-mix(in srgb, ${accentColor} 84%, #0f172a 16%))`
    : surfaceColor;
  const splitDirectionPanelClass = isLeftLayout ? 'bg-white/8 text-white backdrop-blur-xl' : 'bg-white';
  const heroTitle =
    step === 'verify'
      ? 'Enter your password'
      : loginPage?.title ||
        (isIslandPremium
          ? 'Welcome back to island travel'
          : heroVariant === 'readable'
          ? 'Welcome back to your account'
          : heroVariant === 'split'
            ? 'Welcome back'
            : heroVariant === 'minimal'
              ? 'Sign in'
            : 'Sign in to continue');
  const heroDescription =
    step === 'verify'
      ? 'Complete your sign in to access your account.'
      : isIslandPremium
        ? 'Sign in to manage your coastal trips, saved passengers, and booking history.'
        : heroVariant === 'readable'
        ? 'Sign in with larger, clearer content to continue your account journey.'
        : heroVariant === 'minimal'
          ? 'Use your email to continue.'
          : heroVariant === 'split'
            ? 'A cleaner sign-in flow built around fast account access.'
            : 'Continue using your email address or social login.';

  const sidebarToneVariant =
    sidebarVariant === 'minimal'
      ? 'image'
      : sidebarVariant === 'clean'
        ? 'gradient'
        : sidebarVariant;

  const formMode = layout.formMode;
  const backHref = step === 'verify' ? '/login' : '/';
  const backLabel = step === 'verify' ? 'Back to email' : 'Back to homepage';
  const renderForm = () => {
    if (step === 'verify') {
      return <LoginVerifyForm mode={formMode} />;
    }
    return <LoginForm mode={formMode} />;
  };

  const renderSidebar = (embedded = false) => {
    if (!hasSidebar) return null;
    if (embedded)
      return (
        <AuthSidebar
          variant={sidebarToneVariant as any}
          embedded
          tone={layoutVariant === 'split-left' ? 'editorial' : 'brand'}
          loginPage={loginPage}
        />
      );
    return (
      <AuthSidebar
        variant={sidebarToneVariant as any}
        tone={layoutVariant === 'split-left' ? 'editorial' : 'brand'}
        loginPage={loginPage}
      />
    );
  };

  const loginHeroAnim = sectionAnimations['login_hero'];
  const loginFormAnim = sectionAnimations['login_form'];

  const heroCopy = (
    <AnimatedSection
      id="section-login_hero"
      className={cn(
        'space-y-3',
        loginHeroAnim && loginHeroAnim !== 'none' && `anim-section-login_hero`,
        activeSectionId === 'login_hero' &&
          'ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all rounded-lg relative z-50 bg-white/10 p-2'
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
        {step === 'verify' ? 'Secure Access' : 'Welcome Back'}
      </p>
      <h1
        className={cn(
          'font-bold',
          heroVariant === 'minimal'
            ? 'text-2xl md:text-3xl'
            : heroVariant === 'readable'
              ? 'text-4xl md:text-5xl'
              : 'text-3xl md:text-4xl',
          heroVariant === 'split' && 'max-w-md'
        )}
        style={{ color: heroTextColor }}
      >
        {heroTitle}
      </h1>
      <p
        className={cn(
          'text-sm md:text-base',
          heroVariant === 'minimal' && 'max-w-lg',
          heroVariant === 'split' && 'max-w-md'
        )}
        style={{ color: heroMutedColor }}
      >
        {heroDescription}
      </p>
    </AnimatedSection>
  );

  if (isBrandImmersive) {
    return (
      <main
        className={cn('wl-brand-radius-scope relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8')}
        style={{
          backgroundColor: surfaceAltColor,
          color: textOnSurfaceAlt,
          fontFamily: bodyFontStack,
          ['--font-body' as string]: bodyFontStack,
          ['--font-title' as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, 'rounded-2xl')
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${primaryColor}22 0, transparent 34%), radial-gradient(circle at 82% 12%, ${secondaryColor}22 0, transparent 28%), radial-gradient(circle at 50% 100%, ${theme.accent}1f 0, transparent 30%), linear-gradient(135deg, ${surfaceAltColor} 0%, ${surfaceColor} 100%)`
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(15,23,42,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col">
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 backdrop-blur-sm">
                <span className="size-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <Image
                  src={
                    resolvedBranding?.logo?.dark ||
                    resolvedBranding?.logo?.light ||
                    '/assets/icons/Ayahay_blue_vertical.svg'
                  }
                  alt={`${brandName} Logo`}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                {brandName}
              </div>

              <AnimatedSection
                id="section-login_hero"
                className={cn(
                  'space-y-5',
                  loginHeroAnim && loginHeroAnim !== 'none' && `anim-section-login_hero`,
                  activeSectionId === 'login_hero' &&
                    'ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all rounded-lg relative z-50 bg-white/10 p-2'
                )}
              >
                <h1
                  className="max-w-2xl text-4xl font-black leading-[0.92] md:text-6xl lg:text-7xl"
                  style={{ ...heroFontStyle, color: textOnSurface }}
                >
                  {heroTitle}
                </h1>
                <p className="max-w-xl text-sm leading-7 md:text-base" style={{ color: textOnSurfaceAlt }}>
                  {heroDescription}
                </p>
              </AnimatedSection>

              {brandTagline ? (
                <p className="max-w-xl text-sm leading-7 md:text-base" style={{ color: textOnSurfaceAlt }}>
                  {brandTagline}
                </p>
              ) : null}

              <div
                className={cn(
                  'overflow-hidden border border-white/15 bg-white/35 shadow-xl backdrop-blur-xl',
                  brandRadiusClass
                )}
              >
                {renderSidebar(true)}
              </div>
            </section>

            <section className="relative">
              <div
                className="absolute inset-6 rounded-[48px] blur-3xl opacity-25"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className={cn(
                  'relative border border-white/20 bg-white/88 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl md:p-8',
                  brandRadiusClass
                )}
                style={{ color: textOnSurface }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <Image
                        src={
                          resolvedBranding?.logo?.dark ||
                          resolvedBranding?.logo?.light ||
                          '/assets/icons/Ayahay_blue_vertical.svg'
                        }
                        alt={`${brandName} Logo`}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
                        {brandName}
                      </p>
                      <p className="text-sm text-slate-500">{step === 'verify' ? 'Secure access' : 'Sign in'}</p>
                    </div>
                  </div>

                  {heroSection?.enabled !== false ? (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold" style={heroFontStyle}>
                        {brandName}
                      </p>
                      <p className="text-sm leading-6" style={{ color: textOnSurfaceAlt }}>
                        {heroDescription}
                      </p>
                    </div>
                  ) : null}

                  <AnimatedSection
                    id="section-login_form"
                    className={cn(
                      'border bg-white/85 transition-all duration-500',
                      formVariant === 'compact' ? 'p-4' : 'p-5 md:p-6',
                      formVariant === 'rounded' && 'p-6',
                      formVariant === 'simple' && 'rounded-2xl p-4 md:p-5 border-slate-200 shadow-none',
                      formVariant === 'spacious' && 'p-7 md:p-8',
                      formVariant === 'elevated' && 'shadow-lg',
                      brandRadiusClass,
                      loginFormAnim && loginFormAnim !== 'none' && `anim-section-login_form`,
                      activeSectionId === 'login_form' &&
                        'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50'
                    )}
                    style={{ borderColor: 'rgba(148, 163, 184, 0.18)' }}
                  >
                    {renderForm()}
                  </AnimatedSection>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (isBoardingPass) {
    const d = new Date();
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    const yr = d.getFullYear();
    return (
      <main
        className={cn('wl-brand-radius-scope relative min-h-screen overflow-hidden px-3 py-6 md:px-6 md:py-10 flex items-center justify-center')}
        style={{
          backgroundColor: '#FAF7F0',
          fontFamily: bodyFontStack,
          ['--font-body' as string]: bodyFontStack,
          ['--font-title' as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, 'rounded-2xl'),
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.4) 1px, transparent 0)', backgroundSize: '14px 14px' }}
        />

        <div className="relative z-10 w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.25em] transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>

          <div
            className="relative rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25),0_8px_20px_-8px_rgba(15,23,42,0.15)]"
            style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 border-b-2 border-dashed"
              style={{ borderColor: 'rgba(15,23,42,0.18)' }}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={resolvedBranding?.logo?.dark || resolvedBranding?.logo?.light || '/assets/icons/Ayahay_blue_vertical.svg'}
                  alt={`${brandName} Logo`}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: textOnSurface }}>
                  {brandName}
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60" style={{ color: textOnSurface }}>
                {month} {day} · {yr}
              </span>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-8">
              <AnimatedSection
                id="section-login_hero"
                className={cn(
                  'text-center mb-6 flex flex-col items-center gap-3',
                  loginHeroAnim && loginHeroAnim !== 'none' && `anim-section-login_hero`,
                  activeSectionId === 'login_hero' && 'ring-4 ring-primary ring-offset-4 ring-opacity-50 rounded-lg relative z-50'
                )}
              >
                <span
                  className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {step === 'verify' ? '✦ Verify' : '✦ Boarding'}
                </span>
                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tight leading-tight"
                  style={{ ...heroFontStyle, color: textOnSurface }}
                >
                  {heroTitle}
                </h1>
                {heroSection?.enabled !== false && (
                  <p className="text-sm leading-relaxed opacity-75" style={{ color: textOnSurface }}>
                    {heroDescription}
                  </p>
                )}
              </AnimatedSection>

              <div className="flex items-center gap-2 my-4">
                <span className="flex-1 h-[2px] border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.2)' }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-50" style={{ color: textOnSurface }}>
                  Credentials
                </span>
                <span className="flex-1 h-[2px] border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.2)' }} />
              </div>

              <AnimatedSection
                id="section-login_form"
                className={cn(
                  'boarding-pass-login-form',
                  loginFormAnim && loginFormAnim !== 'none' && `anim-section-login_form`,
                  activeSectionId === 'login_form' && 'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50 rounded-md'
                )}
              >
                {renderForm()}
              </AnimatedSection>

              {footerSection?.enabled !== false && (
                <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.2em] opacity-60" style={{ color: textOnSurface }}>
                  {footerCopy}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
              <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span key={i} className="block" style={{ backgroundColor: textOnSurface, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
                ))}
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap" style={{ color: textOnSurface }}>
                {step === 'verify' ? 'VRF' : 'LGN'}-{yr.toString().slice(-2)}
              </span>
            </div>
          </div>

          <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.3em] opacity-40" style={{ color: textOnSurface }}>
            Tear along dashed line · Present at gate
          </p>
        </div>

        <style jsx global>{`
          .boarding-pass-login-form input,
          .boarding-pass-login-form select,
          .boarding-pass-login-form textarea {
            border-radius: 10px !important;
            border: 2px dashed rgba(15, 23, 42, 0.22) !important;
            background: rgba(250, 247, 240, 0.5) !important;
            padding: 10px 12px !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
            font-size: 14px !important;
          }
          .boarding-pass-login-form input:focus,
          .boarding-pass-login-form select:focus,
          .boarding-pass-login-form textarea:focus {
            border-style: solid !important;
            border-color: ${primaryColor} !important;
            outline: none !important;
            box-shadow: 0 0 0 3px ${primaryColor}22 !important;
          }
          .boarding-pass-login-form label {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
            text-transform: uppercase !important;
            letter-spacing: 0.22em !important;
            font-size: 10px !important;
            font-weight: 900 !important;
            opacity: 0.7;
          }
          .boarding-pass-login-form button[type="submit"] {
            border-radius: 10px !important;
            border: 2px solid ${primaryColor} !important;
            background: ${primaryColor} !important;
            color: #fff !important;
            text-transform: uppercase !important;
            letter-spacing: 0.25em !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace !important;
            font-weight: 900 !important;
            font-size: 12px !important;
            padding: 12px 18px !important;
            box-shadow: 0 4px 0 rgba(15, 23, 42, 0.18) !important;
            transition: transform 0.12s ease, box-shadow 0.12s ease !important;
          }
          .boarding-pass-login-form button[type="submit"]:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 0 rgba(15, 23, 42, 0.18) !important;
          }
          .boarding-pass-login-form button[type="submit"]:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 rgba(15, 23, 42, 0.18) !important;
          }
        `}</style>
      </main>
    );
  }

  if (isGlassmorphicBlur) {
    return (
      <main
        className={cn('wl-brand-radius-scope relative min-h-screen overflow-hidden px-4 py-8 md:px-6 md:py-12 flex items-center justify-center')}
        style={{
          backgroundColor: surfaceAltColor,
          fontFamily: bodyFontStack,
          ['--font-body' as string]: bodyFontStack,
          ['--font-title' as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, 'rounded-3xl')
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        {/* Soft, vibrant gradients injected over the media */}
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-customPrimary/80 via-transparent to-black/30 mix-blend-multiply" style={{ backgroundColor: primaryColor }}/>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-customPrimary/40 mix-blend-overlay" />
        
        {/* Decorative Orbs */}
        <div 
           className="absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-[0.2]"
           style={{ backgroundColor: primaryColor }}
        />
        <div 
           className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[100px] opacity-[0.1]"
           style={{ backgroundColor: '#ffffff' }}
        />
        
        {/* Glass Card Container */}
        <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-white/20 bg-white/10 p-6 md:p-10 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>
          
          <div className="grid lg:grid-cols-[1fr_0.8fr] gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col text-white">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-sm shadow-inner w-max">
                <span className="size-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                {brandName}
              </div>
              
              <AnimatedSection
                id="section-login_hero"
                className={cn(
                  'space-y-4 lg:pr-8',
                  loginHeroAnim && loginHeroAnim !== 'none' && `anim-section-login_hero`,
                      activeSectionId === 'login_hero' &&
                        'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50 bg-white/10 rounded-lg p-3 -m-3'
                )}
              >
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl drop-shadow-md" style={heroFontStyle}>
                  {heroTitle}
                </h1>
                {heroSection?.enabled !== false && (
                  <p className="max-w-lg text-lg text-white/90 drop-shadow-sm font-medium">
                    {heroDescription}
                  </p>
                )}
                {brandTagline ? (
                  <p className="max-w-xl text-base text-white/80">
                    {brandTagline}
                  </p>
                ) : null}
              </AnimatedSection>
            </div>
            
            {/* Right Form */}
            <div className="flex flex-col">
              <AnimatedSection
                id="section-login_form"
                className={cn(
                  'w-full max-w-md mx-auto xl:mr-0 rounded-[2rem] border border-white/30 bg-white/60 p-6 md:p-8 backdrop-blur-3xl shadow-2xl transition-all duration-500',
                  loginFormAnim && loginFormAnim !== 'none' && `anim-section-login_form`,
                      activeSectionId === 'login_form' &&
                        'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50'
                )}
                style={{ color: textOnSurface }}
              >
                {/* Form header inside card */}
                <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                  <h2 className="text-xl font-bold" style={{ color: textOnSurface }}>{step === 'verify' ? 'Secure Access' : 'Sign In'}</h2>
                  <Image
                      src={
                        resolvedBranding?.logo?.dark ||
                        resolvedBranding?.logo?.light ||
                        '/assets/icons/Ayahay_blue_vertical.svg'
                      }
                      alt={`${brandName} Logo`}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain opacity-80"
                    />
                </div>
                
                {renderForm()}
                
                {footerSection?.enabled !== false && (
                  <p className="mt-6 text-center text-xs font-medium opacity-70" style={{ color: textOnSurfaceAlt }}>
                    {footerCopy}
                  </p>
                )}
              </AnimatedSection>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isIslandPremium) {
    return (
      <main
        className="wl-brand-radius-scope relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8"
        style={{
          background: `radial-gradient(circle at 18% 12%, ${secondaryColor}30 0, transparent 30%), radial-gradient(circle at 82% 16%, #fbbf2440 0, transparent 28%), linear-gradient(180deg, #fff8ec 0%, ${surfaceColor} 100%)`,
          color: textOnSurfaceAlt,
          fontFamily: bodyFontStack,
          ['--font-body' as string]: bodyFontStack,
          ['--font-title' as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, 'rounded-2xl')
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
          <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm font-medium" style={{ color: primaryColor }}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <section className="grid flex-1 overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_28px_90px_-50px_rgba(8,47,73,0.45)] backdrop-blur md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden bg-[#fff8ec] p-6 md:p-8">
              <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 25% 18%, ${primaryColor}24 0, transparent 32%), radial-gradient(circle at 80% 20%, #fbbf2438 0, transparent 28%)` }} />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="flex items-center gap-3">
                  <Image
                    src={resolvedBranding?.logo?.dark || resolvedBranding?.logo?.light || '/assets/icons/Ayahay_blue_vertical.svg'}
                    alt={`${brandName} Logo`}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-2xl bg-white object-contain p-2 shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{brandName}</p>
                    <p className="text-sm text-slate-500">Island Premium access</p>
                  </div>
                </div>
                <AnimatedSection
                  id="section-login_hero"
                  className={cn(
                    'space-y-4',
                    loginHeroAnim && loginHeroAnim !== 'none' && `anim-section-login_hero`,
                    activeSectionId === 'login_hero' && 'ring-4 ring-primary ring-offset-4 ring-opacity-50 rounded-lg relative z-50'
                  )}
                >
                  <p className="w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    {step === 'verify' ? 'Secure access' : 'Welcome back'}
                  </p>
                  <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl" style={heroFontStyle}>{heroTitle}</h1>
                  <p className="max-w-md text-sm leading-7 text-slate-600">{heroDescription}</p>
                </AnimatedSection>
                {hasSidebar ? (
                  <div className="rounded-[1.5rem] bg-white/76 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Island assurance</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">
                      Secure staff access for smoother coastal operations.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Manage bookings, schedules, and passenger support from a calm mobile-first login surface.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-center p-5 md:p-8">
              <AnimatedSection
                id="section-login_form"
                className={cn(
                  'w-full max-w-md rounded-[1.75rem] border border-cyan-100 bg-[#fffaf2] p-5 shadow-[0_22px_70px_-45px_rgba(8,47,73,0.45)] md:p-7',
                  loginFormAnim && loginFormAnim !== 'none' && `anim-section-login_form`,
                  activeSectionId === 'login_form' && 'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50'
                )}
              >
                {renderForm()}
                {footerSection?.enabled !== false && (
                  <p className="mt-6 text-center text-xs text-slate-500">{footerCopy}</p>
                )}
              </AnimatedSection>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (isRoundedCanvas) {
    return (
      <main
        className={cn('wl-brand-radius-scope relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8')}
        style={{
          backgroundColor: surfaceAltColor,
          color: textOnSurfaceAlt,
          fontFamily: bodyFontStack,
          ['--font-body' as string]: bodyFontStack,
          ['--font-title' as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, 'rounded-2xl')
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: isIslandPremium
              ? `radial-gradient(circle at 18% 18%, ${primaryColor}24 0, transparent 30%), radial-gradient(circle at 84% 18%, #fbbf2440 0, transparent 28%), linear-gradient(180deg, #fff8ec 0%, ${surfaceColor} 100%)`
              : `radial-gradient(circle at 18% 18%, ${primaryColor}18 0, transparent 28%), radial-gradient(circle at 82% 16%, ${secondaryColor}18 0, transparent 30%), linear-gradient(180deg, ${surfaceAltColor} 0%, ${surfaceColor} 100%)`
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(15,23,42,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.16)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className={cn('flex flex-1 items-center justify-center', brandRadiusClass)}>
            <section
              className={cn(
                'w-full overflow-hidden border border-white/40 bg-white/80 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl',
                brandRadiusClass
              )}
            >
              <div className="border-b border-slate-200/70 px-5 py-4 md:px-7 md:py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Image
                      src={
                        resolvedBranding?.logo?.dark ||
                        resolvedBranding?.logo?.light ||
                        '/assets/icons/Ayahay_blue_vertical.svg'
                      }
                      alt={`${brandName} Logo`}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
                      {brandName}
                    </p>
                    <p className="truncate text-sm text-slate-500">{heroDescription}</p>
                  </div>
                </div>
              </div>

              {hasSidebar ? (
                <div className="border-b border-slate-200/70 bg-white/70 px-4 py-4 md:px-6">{renderSidebar(true)}</div>
              ) : null}

              <div className="grid gap-8 px-5 py-6 md:px-8 md:py-10">
                <AnimatedSection
                  id="section-login_hero"
                  className={cn(
                    'space-y-3 text-center',
                    loginHeroAnim && loginHeroAnim !== 'none' && `anim-section-login_hero`,
                    activeSectionId === 'login_hero' &&
                      'ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all rounded-lg relative z-50 bg-white/10 p-2'
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
                    {step === 'verify' ? 'Secure access' : 'Welcome back'}
                  </p>
                  <h1
                    className="text-3xl font-black leading-tight md:text-5xl"
                    style={{ ...heroFontStyle, color: textOnSurface }}
                  >
                    {heroTitle}
                  </h1>
                  {brandTagline ? (
                    <p className="mx-auto max-w-2xl text-sm leading-7 md:text-base" style={{ color: textOnSurfaceAlt }}>
                      {brandTagline}
                    </p>
                  ) : null}
                </AnimatedSection>

                <div className="mx-auto w-full max-w-xl">
                  <AnimatedSection
                    id="section-login_form"
                    className={cn(
                      'border border-slate-200 bg-white p-5 shadow-sm md:p-7 transition-all duration-500',
                      formVariant === 'simple' && 'rounded-2xl p-4 md:p-5 shadow-none',
                      formVariant === 'spacious' && 'p-8 md:p-9',
                      formVariant === 'island-premium' && 'border-white/80 bg-[#fffaf2] p-6 shadow-[0_20px_70px_-45px_rgba(8,47,73,0.45)] md:p-8',
                      brandRadiusClass,
                      loginFormAnim && loginFormAnim !== 'none' && `anim-section-login_form`,
                      activeSectionId === 'login_form' &&
                        'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50'
                    )}
                  >
                    {renderForm()}
                  </AnimatedSection>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn('wl-brand-radius-scope min-h-screen px-4 py-6 md:px-6 md:py-8')}
      style={{
        backgroundColor: surfaceAltColor,
        color: textOnSurfaceAlt,
        fontFamily: bodyFontStack,
        ['--font-body' as string]: bodyFontStack,
        ['--font-title' as string]: titleFontStack,
        ...brandRadiusScopeStyle(resolvedBranding, 'rounded-2xl')
      }}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: primaryColor }}
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div
          className={cn(
            'overflow-hidden shadow-2xl',
            !hasSidebar ? 'grid grid-cols-1' : 'grid md:grid-cols-2',
            isLeftLayout
              ? 'rounded-[40px] border border-white/10 shadow-[0_24px_80px_rgba(15,23,42,0.24)]'
              : 'rounded-[28px]'
          )}
        >
          {isLeftLayout ? renderSidebar() : null}

          <section
            className={cn(
              'flex flex-col justify-center gap-8 p-6 md:p-10',
              splitDirectionPanelClass,
              isLeftLayout && 'text-white md:p-12'
            )}
            style={{
              background: splitDirectionGradient,
              color: isLeftLayout ? '#f8fafc' : textOnSurface
            }}
          >
            <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
            {heroSection?.enabled !== false ? heroCopy : null}

            <AnimatedSection
              id="section-login_form"
              className={cn(
                'border transition-all duration-500',
                formVariant === 'compact' ? 'rounded-[20px] p-4 md:p-5' : 'rounded-[28px] p-5 md:p-6',
                formVariant === 'rounded' && 'rounded-[32px]',
                formVariant === 'simple' && 'rounded-[20px] p-4 md:p-5',
                formVariant === 'spacious' && 'rounded-[32px] p-7 md:p-8',
                formVariant === 'elevated' && 'shadow-lg',
                isLeftLayout && 'bg-white/8 backdrop-blur-xl',
                loginFormAnim && loginFormAnim !== 'none' && `anim-section-login_form`,
                activeSectionId === 'login_form' && 'ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50'
              )}
              style={{
                color: isLeftLayout ? 'rgba(255,255,255,0.78)' : textOnSurfaceAlt,
                borderColor: isLeftLayout ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.18)'
              }}
            >
              {renderForm()}
            </AnimatedSection>
          </section>

          {layoutVariant === 'split-right' ? renderSidebar() : null}
        </div>
      </div>
    </main>
  );
}
