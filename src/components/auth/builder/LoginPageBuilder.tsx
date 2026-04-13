"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { IBrandingConfig, IThemeSettings } from "@/models";
import { createBuilderTheme } from "@/components/landing/builder/theme";
import { getReadableTextColor } from "@/lib/color-utils";
import { getLoginPageLayout, normalizeLoginBuilderContent } from "@/lib/login-builder";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginVerifyForm } from "@/components/auth/LoginVerifyForm";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import type { ILoginPage } from "@/services/content/login.service";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/whitelabel/AnimatedSection";
import { useThemeSettings as useThemeSettingsHook } from "@/hooks/theme-settings";
import { useBranding as useBrandingHook } from "@/hooks/branding";
import { brandRadiusScopeStyle, resolveBrandCornerRadiusClass } from "@/lib/branding/brand-radius";
import { formatCssFontStack } from "@/lib/theme-document";

interface LoginPageBuilderProps {
  loginPage: ILoginPage | null;
  step: "email" | "verify";
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export function LoginPageBuilder({
  loginPage,
  step,
  themeSettings,
  branding,
}: LoginPageBuilderProps) {
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
      try { sectionAnimations = JSON.parse(sectionAnimationsRaw); } catch (e) {}
    } else if (typeof sectionAnimationsRaw === 'object') {
      sectionAnimations = sectionAnimationsRaw as Record<string, string>;
    }
  }

  const getAnimationCSSForSection = (sectionId: string, animation: string) => {
    if (!animation || animation === "none") return "";
    const scope = `.anim-section-${sectionId}`;
    switch (animation) {
      case "smooth-up":
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
      case "staggered":
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
      case "typewriter":
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
      case "floating":
        return `
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            animation: textFloat-${sectionId} 3s ease-in-out infinite;
          }
          @keyframes textFloat-${sectionId} {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `;
      case "zoom-in":
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
      default: return "";
    }
  };

  const fullAnimationCSS = Object.entries(sectionAnimations)
    .filter(([id]) => id.startsWith('login_'))
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join("\n");
  const builderConfig = normalizeLoginBuilderContent(loginPage?.content);
  const theme = createBuilderTheme((resolvedBranding ?? {}) as IBrandingConfig);
  const primaryColor = resolvedThemeSettings?.primaryColor || resolvedThemeSettings?.primary || theme.primary;
  const secondaryColor = resolvedThemeSettings?.secondaryColor || resolvedThemeSettings?.secondary || theme.secondary;
  const accentColor = resolvedThemeSettings?.accent || theme.accent;
  const surfaceColor = resolvedThemeSettings?.surface || theme.surface;
  const surfaceAltColor = resolvedThemeSettings?.surfaceAlt || theme.surfaceAlt;
  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const formSection = builderConfig.sections.find((section) => section.section_key === "form");
  const sidebarSection = builderConfig.sections.find((section) => section.section_key === "sidebar");
  const heroSection = builderConfig.sections.find((section) => section.section_key === "hero");
  const footerSection = builderConfig.sections.find((section) => section.section_key === "footer");
  const layoutVariant = builderConfig.page_variant || builderConfig.layout_variant || "split-right";
  const layout = getLoginPageLayout(layoutVariant);
  const heroVariant = heroSection?.variant || "default";
  const formVariant = formSection?.variant || "default";
  const sidebarVariant = sidebarSection?.variant || "default";
  const hasSidebar = sidebarSection?.enabled !== false;
  const isLeftLayout = layoutVariant === "split-left";
  const isRoundedCanvas = layout.shell === "canvas";
  const isBrandImmersive = layout.shell === "immersive";
  const heroTextColor = isLeftLayout ? "#f8fafc" : textOnSurface;
  const heroMutedColor = isLeftLayout ? "rgba(248,250,252,0.74)" : textOnSurfaceAlt;
  const brandName = resolvedBranding?.brand_name || "Ayahay";
  const brandTagline = resolvedBranding?.tagline || resolvedBranding?.slogan || "";
  const brandRadiusClass = resolveBrandCornerRadiusClass(resolvedBranding, "rounded-2xl");
  const bodyFontStack = formatCssFontStack(theme.fontFamily);
  const titleFontStack = formatCssFontStack(theme.fontFamilyTitle, theme.fontFamily);
  const heroFontStyle = { fontFamily: titleFontStack };
  const splitDirectionGradient = isLeftLayout
    ? `radial-gradient(circle at 18% 18%, ${primaryColor}55 0, transparent 28%), radial-gradient(circle at 82% 12%, ${secondaryColor}40 0, transparent 24%), linear-gradient(135deg, color-mix(in srgb, ${primaryColor} 82%, #0f172a 18%), color-mix(in srgb, ${accentColor} 84%, #0f172a 16%))`
    : surfaceColor;
  const splitDirectionPanelClass = isLeftLayout
    ? "bg-white/8 text-white backdrop-blur-xl"
    : "bg-white";
  const heroTitle =
    step === "verify"
      ? "Enter your password"
        : loginPage?.title ||
        (heroVariant === "readable"
          ? "Welcome back to your account"
          : heroVariant === "split"
          ? "Welcome back"
          : heroVariant === "minimal"
            ? "Sign in"
            : "Sign in to continue");
  const heroDescription =
    step === "verify"
      ? "Complete your sign in to access your account."
      : heroVariant === "readable"
        ? "Sign in with larger, clearer content to continue your account journey."
        : heroVariant === "minimal"
        ? "Use your email to continue."
        : heroVariant === "split"
          ? "A cleaner sign-in flow built around fast account access."
          : "Continue using your email address or social login.";
  const footerCopy = footerSection?.variant === "inline"
    ? "By continuing, you agree to Terms and Privacy Policy."
    : footerSection?.variant === "minimal" || footerSection?.variant === "compact"
      ? "By signing in, you agree to our Terms and Privacy Policy."
      : "By signing in, you agree to our Terms of Use and Privacy Policy.";

  const sidebarToneVariant = sidebarVariant === "minimal"
    ? "image"
    : sidebarVariant === "clean"
      ? "gradient"
      : sidebarVariant;

  const formMode = layout.formMode;
  const renderForm = () => {
    if (step === "verify") {
      return <LoginVerifyForm mode={formMode} />;
    }
    return <LoginForm mode={formMode} />;
  };

  const renderSidebar = (embedded = false) => {
    if (!hasSidebar) return null;
    if (embedded) return <AuthSidebar variant={sidebarToneVariant as any} embedded tone={layoutVariant === "split-left" ? "editorial" : "brand"} />;
    return <AuthSidebar variant={sidebarToneVariant as any} tone={layoutVariant === "split-left" ? "editorial" : "brand"} />;
  };

  const loginHeroAnim = sectionAnimations["login_hero"];
  const loginFormAnim = sectionAnimations["login_form"];

  const heroCopy = (
    <AnimatedSection 
      id="section-login_hero"
      className={cn(
        "space-y-3",
        loginHeroAnim && loginHeroAnim !== "none" && `anim-section-login_hero`,
        activeSectionId === "login_hero" && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all rounded-lg relative z-50 bg-white/10 p-2"
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
        {step === "verify" ? "Secure Access" : "Welcome Back"}
      </p>
      <h1
        className={cn(
          "font-bold",
          heroVariant === "minimal" ? "text-2xl md:text-3xl" : heroVariant === "readable" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
          heroVariant === "split" && "max-w-md"
        )}
        style={{ color: heroTextColor }}
      >
        {heroTitle}
      </h1>
      <p
        className={cn(
          "text-sm md:text-base",
          heroVariant === "minimal" && "max-w-lg",
          heroVariant === "split" && "max-w-md"
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
        className={cn("wl-brand-radius-scope relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8")}
        style={{
          backgroundColor: surfaceAltColor,
          color: textOnSurfaceAlt,
          fontFamily: bodyFontStack,
          ["--font-body" as string]: bodyFontStack,
          ["--font-title" as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, "rounded-2xl"),
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${primaryColor}22 0, transparent 34%), radial-gradient(circle at 82% 12%, ${secondaryColor}22 0, transparent 28%), radial-gradient(circle at 50% 100%, ${theme.accent}1f 0, transparent 30%), linear-gradient(135deg, ${surfaceAltColor} 0%, ${surfaceColor} 100%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(15,23,42,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>

          <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 backdrop-blur-sm">
                <span className="size-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <Image
                  src={resolvedBranding?.logo?.dark || resolvedBranding?.logo?.light || "/assets/icons/Ayahay_blue_vertical.svg"}
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
                  "space-y-5",
                  loginHeroAnim && loginHeroAnim !== "none" && `anim-section-login_hero`,
                  activeSectionId === "login_hero" && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all rounded-lg relative z-50 bg-white/10 p-2"
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

              <div className={cn("overflow-hidden border border-white/15 bg-white/35 shadow-xl backdrop-blur-xl", brandRadiusClass)}>
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
                  "relative border border-white/20 bg-white/88 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl md:p-8",
                  brandRadiusClass
                )}
                style={{ color: textOnSurface }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <Image
                        src={resolvedBranding?.logo?.dark || resolvedBranding?.logo?.light || "/assets/icons/Ayahay_blue_vertical.svg"}
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
                      <p className="text-sm text-slate-500">{step === "verify" ? "Secure access" : "Sign in"}</p>
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
                      "border bg-white/85 transition-all duration-500",
                      formVariant === "compact" ? "p-4" : "p-5 md:p-6",
                      formVariant === "rounded" && "p-6",
                      formVariant === "simple" && "rounded-2xl p-4 md:p-5 border-slate-200 shadow-none",
                      formVariant === "spacious" && "p-7 md:p-8",
                      formVariant === "elevated" && "shadow-lg",
                      brandRadiusClass,
                      loginFormAnim && loginFormAnim !== "none" && `anim-section-login_form`,
                      activeSectionId === "login_form" && "ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50"
                    )}
                    style={{ borderColor: "rgba(148, 163, 184, 0.18)" }}
                  >
                    {renderForm()}
                  </AnimatedSection>

                  {footerSection?.enabled !== false ? (
                    <p className="text-center text-xs md:text-sm" style={{ color: textOnSurfaceAlt }}>
                      {footerCopy}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (isRoundedCanvas) {
    return (
      <main
        className={cn("wl-brand-radius-scope relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8")}
        style={{
          backgroundColor: surfaceAltColor,
          color: textOnSurfaceAlt,
          fontFamily: bodyFontStack,
          ["--font-body" as string]: bodyFontStack,
          ["--font-title" as string]: titleFontStack,
          ...brandRadiusScopeStyle(resolvedBranding, "rounded-2xl"),
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${primaryColor}18 0, transparent 28%), radial-gradient(circle at 82% 16%, ${secondaryColor}18 0, transparent 30%), linear-gradient(180deg, ${surfaceAltColor} 0%, ${surfaceColor} 100%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(15,23,42,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.16)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>

          <div className={cn("flex flex-1 items-center justify-center", brandRadiusClass)}>
            <section
              className={cn(
                "w-full overflow-hidden border border-white/40 bg-white/80 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl",
                brandRadiusClass
              )}
            >
              <div className="border-b border-slate-200/70 px-5 py-4 md:px-7 md:py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Image
                      src={resolvedBranding?.logo?.dark || resolvedBranding?.logo?.light || "/assets/icons/Ayahay_blue_vertical.svg"}
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
                <div className="border-b border-slate-200/70 bg-white/70 px-4 py-4 md:px-6">
                  {renderSidebar(true)}
                </div>
              ) : null}

              <div className="grid gap-8 px-5 py-6 md:px-8 md:py-10">
                <AnimatedSection 
                  id="section-login_hero"
                  className={cn(
                    "space-y-3 text-center",
                    loginHeroAnim && loginHeroAnim !== "none" && `anim-section-login_hero`,
                    activeSectionId === "login_hero" && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all rounded-lg relative z-50 bg-white/10 p-2"
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
                    {step === "verify" ? "Secure access" : "Welcome back"}
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
                      "border border-slate-200 bg-white p-5 shadow-sm md:p-7 transition-all duration-500",
                      formVariant === "simple" && "rounded-2xl p-4 md:p-5 shadow-none",
                      formVariant === "spacious" && "p-8 md:p-9",
                      brandRadiusClass,
                      loginFormAnim && loginFormAnim !== "none" && `anim-section-login_form`,
                      activeSectionId === "login_form" && "ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50"
                    )}
                  >
                    {renderForm()}
                  </AnimatedSection>
                </div>

                {footerSection?.enabled !== false ? (
                  <p className="text-center text-xs md:text-sm" style={{ color: textOnSurfaceAlt }}>
                    {footerCopy}
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn("wl-brand-radius-scope min-h-screen px-4 py-6 md:px-6 md:py-8")}
      style={{
        backgroundColor: surfaceAltColor,
        color: textOnSurfaceAlt,
        fontFamily: bodyFontStack,
        ["--font-body" as string]: bodyFontStack,
        ["--font-title" as string]: titleFontStack,
        ...brandRadiusScopeStyle(resolvedBranding, "rounded-2xl"),
      }}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: primaryColor }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </Link>

          <div
          className={cn(
            "overflow-hidden shadow-2xl",
            !hasSidebar ? "grid grid-cols-1" : "grid md:grid-cols-2",
            isLeftLayout
              ? "rounded-[40px] border border-white/10 shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
              : "rounded-[28px]"
          )}
        >
          {isLeftLayout ? renderSidebar() : null}

          <section
            className={cn(
              "flex flex-col justify-center gap-8 p-6 md:p-10",
              splitDirectionPanelClass,
              isLeftLayout && "text-white md:p-12"
            )}
            style={{
              background: splitDirectionGradient,
              color: isLeftLayout ? "#f8fafc" : textOnSurface,
            }}
          >
            <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
            {heroSection?.enabled !== false ? heroCopy : null}

            <AnimatedSection
              id="section-login_form"
              className={cn(
                "border transition-all duration-500",
                formVariant === "compact" ? "rounded-[20px] p-4 md:p-5" : "rounded-[28px] p-5 md:p-6",
                formVariant === "rounded" && "rounded-[32px]",
                formVariant === "simple" && "rounded-[20px] p-4 md:p-5",
                formVariant === "spacious" && "rounded-[32px] p-7 md:p-8",
                formVariant === "elevated" && "shadow-lg",
                isLeftLayout && "bg-white/8 backdrop-blur-xl",
                loginFormAnim && loginFormAnim !== "none" && `anim-section-login_form`,
                activeSectionId === "login_form" && "ring-4 ring-primary ring-offset-4 ring-opacity-50 relative z-50"
              )}
              style={{
                color: isLeftLayout ? "rgba(255,255,255,0.78)" : textOnSurfaceAlt,
                borderColor: isLeftLayout ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.18)",
              }}
            >
              {renderForm()}
            </AnimatedSection>

            {footerSection?.enabled !== false ? (
              <p
                className={cn(
                  "text-center",
                  footerSection?.variant === "minimal" || footerSection?.variant === "compact"
                    ? "text-[11px] md:text-xs"
                    : footerSection?.variant === "inline"
                      ? "text-[11px] md:text-[11px]"
                      : "text-xs md:text-sm",
                  isLeftLayout && "text-white/70"
                )}
                style={{ color: isLeftLayout ? "rgba(255,255,255,0.7)" : textOnSurfaceAlt }}
              >
                {footerCopy}
              </p>
            ) : null}
          </section>

          {layoutVariant === "split-right" ? renderSidebar() : null}
        </div>
      </div>
    </main>
  );
}
