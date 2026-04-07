"use client";

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
  const builderConfig = normalizeLoginBuilderContent(loginPage?.content);
  const theme = createBuilderTheme((branding ?? {}) as IBrandingConfig);
  const primaryColor = themeSettings?.primaryColor || themeSettings?.primary || theme.primary;
  const secondaryColor = themeSettings?.secondaryColor || themeSettings?.secondary || theme.secondary;
  const accentColor = themeSettings?.accent || theme.accent;
  const surfaceColor = themeSettings?.surface || theme.surface;
  const surfaceAltColor = themeSettings?.surfaceAlt || theme.surfaceAlt;
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
  const brandName = branding?.brand_name || "Ayahay";
  const brandTagline = branding?.tagline || branding?.slogan || "";
  const brandRadiusClass = branding?.colors?.cornerRadiusClass?.trim() || "rounded-[32px]";
  const heroFontStyle = { fontFamily: theme.fontFamilyTitle };
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
        (heroVariant === "split"
          ? "Welcome back"
          : heroVariant === "minimal"
            ? "Sign in"
            : "Sign in to continue");
  const heroDescription =
    step === "verify"
      ? "Complete your sign in to access your account."
      : heroVariant === "minimal"
        ? "Use your email to continue."
        : heroVariant === "split"
          ? "A cleaner sign-in flow built around fast account access."
          : "Continue using your email address or social login.";
  const footerCopy =
    footerSection?.variant === "minimal"
      ? "By signing in, you agree to our Terms and Privacy Policy."
      : "By signing in, you agree to our Terms of Use and Privacy Policy.";

  const formMode = layout.formMode;
  const renderForm = () => {
    if (step === "verify") {
      return <LoginVerifyForm mode={formMode} />;
    }
    return <LoginForm mode={formMode} />;
  };

  const renderSidebar = (embedded = false) => {
    if (!hasSidebar) return null;
    if (embedded) return <AuthSidebar variant={sidebarVariant as any} embedded tone={layoutVariant === "split-left" ? "editorial" : "brand"} />;
    return <AuthSidebar variant={sidebarVariant as any} tone={layoutVariant === "split-left" ? "editorial" : "brand"} />;
  };

  const heroCopy = (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
        {step === "verify" ? "Secure Access" : "Welcome Back"}
      </p>
      <h1
        className={cn(
          "font-bold",
          heroVariant === "minimal" ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl",
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
    </div>
  );

  if (isBrandImmersive) {
    return (
      <main
        className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8"
        style={{
          backgroundColor: surfaceAltColor,
          color: textOnSurfaceAlt,
          fontFamily: theme.fontFamily,
          ["--font-title" as string]: theme.fontFamilyTitle,
        }}
      >
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
                  src={branding?.logo?.dark || branding?.logo?.light || "/assets/icons/Ayahay_blue_vertical.svg"}
                  alt={`${brandName} Logo`}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                {brandName}
              </div>

              <div className="space-y-5">
                <h1
                  className="max-w-2xl text-4xl font-black leading-[0.92] md:text-6xl lg:text-7xl"
                  style={{ ...heroFontStyle, color: textOnSurface }}
                >
                  {heroTitle}
                </h1>
                <p className="max-w-xl text-sm leading-7 md:text-base" style={{ color: textOnSurfaceAlt }}>
                  {heroDescription}
                </p>
              </div>

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
                        src={branding?.logo?.dark || branding?.logo?.light || "/assets/icons/Ayahay_blue_vertical.svg"}
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

                  <div
                    className={cn(
                      "border bg-white/85",
                      formVariant === "compact" ? "p-4" : "p-5 md:p-6",
                      formVariant === "rounded" && "p-6",
                      formVariant === "elevated" && "shadow-lg",
                      brandRadiusClass
                    )}
                    style={{ borderColor: "rgba(148, 163, 184, 0.18)" }}
                  >
                    {renderForm()}
                  </div>

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
        className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8"
        style={{
          backgroundColor: surfaceAltColor,
          color: textOnSurfaceAlt,
          fontFamily: theme.fontFamily,
          ["--font-title" as string]: theme.fontFamilyTitle,
        }}
      >
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
                      src={branding?.logo?.dark || branding?.logo?.light || "/assets/icons/Ayahay_blue_vertical.svg"}
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
                <div className="space-y-3 text-center">
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
                </div>

                <div className="mx-auto w-full max-w-xl">
                  <div
                    className={cn(
                      "border border-slate-200 bg-white p-5 shadow-sm md:p-7",
                      brandRadiusClass
                    )}
                  >
                    {renderForm()}
                  </div>
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
      className="min-h-screen px-4 py-6 md:px-6 md:py-8"
      style={{
        backgroundColor: surfaceAltColor,
        color: textOnSurfaceAlt,
        fontFamily: theme.fontFamily,
        ["--font-title" as string]: theme.fontFamilyTitle,
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
            {heroSection?.enabled !== false ? heroCopy : null}

            <div
              className={cn(
                "border",
                formVariant === "compact" ? "rounded-[20px] p-4 md:p-5" : "rounded-[28px] p-5 md:p-6",
                formVariant === "rounded" && "rounded-[32px]",
                formVariant === "elevated" && "shadow-lg",
                isLeftLayout && "bg-white/8 backdrop-blur-xl"
              )}
              style={{
                color: isLeftLayout ? "rgba(255,255,255,0.78)" : textOnSurfaceAlt,
                borderColor: isLeftLayout ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.18)",
              }}
            >
              {renderForm()}
            </div>

            {footerSection?.enabled !== false ? (
              <p
                className={cn(
                  "text-center",
                  footerSection?.variant === "minimal" ? "text-[11px] md:text-xs" : "text-xs md:text-sm",
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
