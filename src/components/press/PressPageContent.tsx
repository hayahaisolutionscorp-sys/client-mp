"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { Calendar, FileText } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { createBuilderTheme } from "@/components/landing/builder/theme";
import { getReadableTextColor } from "@/lib/color-utils";
import { normalizePressBuilderContent } from "@/lib/press-builder";
import { cn } from "@/lib/utils";
import type { IBrandingConfig, IThemeSettings } from "@/models";
import type { IPress } from "@/models";
import type { IPressPage, IPressSection } from "@/services/content/press.service";
import { AnimatedSection } from "@/components/whitelabel/AnimatedSection";
import { useThemeSettings as useThemeSettingsHook } from "@/hooks/theme-settings";
import { useBranding as useBrandingHook } from "@/hooks/branding";
import { brandRadiusScopeStyle } from "@/lib/branding/brand-radius";

type PressRenderableSectionKey = "hero" | "press_list";

const RENDERABLE_SECTION_KEYS = new Set<PressRenderableSectionKey>(["hero", "press_list"]);

export interface PressPageContentProps {
  pressPage: IPressPage | null;
  sections: IPressSection[];
  press: IPress[];
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

function formatPublishDate(value: string | null) {
  if (!value) {
    return "Unscheduled";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unscheduled";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toPressExcerpt(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;

  const collectText = (node: unknown): string[] => {
    if (!node || typeof node !== "object") return [];
    const current = node as { text?: unknown; content?: unknown };
    const texts: string[] = [];

    if (typeof current.text === "string") {
      texts.push(current.text);
    }

    if (Array.isArray(current.content)) {
      current.content.forEach((child) => {
        texts.push(...collectText(child));
      });
    }

    return texts;
  };

  const text = collectText(content).join(" ").replace(/\s+/g, " ").trim();
  return text;
}

export function PressPageContent({
  pressPage,
  sections,
  press,
  themeSettings,
  branding,
}: PressPageContentProps) {
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
    .filter(([id]) => id.startsWith('press_'))
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join("\n");
  const builderConfig = normalizePressBuilderContent(pressPage?.content);
  const theme = createBuilderTheme((resolvedBranding ?? {}) as IBrandingConfig);
  const primaryColor = resolvedThemeSettings?.primary || theme.primary;
  const secondaryColor = resolvedThemeSettings?.secondary || theme.secondary;
  const surfaceColor = resolvedThemeSettings?.surface || theme.surface;
  const surfaceAltColor = resolvedThemeSettings?.surfaceAlt || theme.surfaceAlt;
  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const mutedOnSurface = textOnSurface === "#f8fafc" ? "#cbd5e1" : "#64748b";
  const orderedSections = builderConfig.sections.filter(
    (section): section is (typeof builderConfig.sections)[number] & { section_key: PressRenderableSectionKey } =>
      section.enabled && RENDERABLE_SECTION_KEYS.has(section.section_key as PressRenderableSectionKey)
  );
  const sectionByType = new Map(sections.map((section) => [section.type, section]));
  const orderedPress = [...press].sort((left, right) => {
    const orderDiff = (left.display_order || 0) - (right.display_order || 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return new Date(right.publish_date || 0).getTime() - new Date(left.publish_date || 0).getTime();
  });
  const hero = sectionByType.get("hero");
  const pressListSection = sectionByType.get("press_list");
  const heroEnabled = orderedSections.some((section) => section.section_key === "hero");
  const heroTextColor = hero?.bg_url ? "#f8fafc" : getReadableTextColor(primaryColor);
  const heroMutedTextColor = heroTextColor === "#f8fafc" ? "#e2e8f0" : "#334155";
  const heroVariant = builderConfig.sections.find((section) => section.section_key === "hero")?.variant ?? "default";
  const pressListVariant = builderConfig.sections.find((section) => section.section_key === "press_list")?.variant ?? "default";

  return (
    <div
      className="wl-brand-radius-scope min-h-screen px-4 py-8 sm:px-6 sm:py-12"
      style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt, ...brandRadiusScopeStyle(resolvedBranding) }}
    >
      <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {!heroEnabled ? (
          <div className="rounded-[28px] px-8 py-10 shadow-sm" style={{ backgroundColor: surfaceColor }}>
            <h1 className="text-4xl font-bold" style={{ color: textOnSurface }}>{pressPage?.title || "News & Updates"}</h1>
          </div>
        ) : null}

        {orderedSections.map((section) => {
          let sectionContent = null;
          switch (section.section_key) {
            case "hero":
              if (heroVariant === "minimal") {
                sectionContent = (
                  <section
                    className="rounded-[28px] border border-slate-200 px-8 py-10 shadow-sm"
                    style={{ backgroundColor: surfaceColor, color: textOnSurface }}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>News & Updates</p>
                    <div className="mt-4 flex flex-col gap-4">
                      <h1 className="text-4xl font-bold md:text-5xl">{hero?.title || pressPage?.title || "Press Releases"}</h1>
                      <p className="max-w-3xl text-lg" style={{ color: mutedOnSurface }}>
                        {hero?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                      </p>
                    </div>
                  </section>
                );
              } else if (heroVariant === "island-premium") {
                sectionContent = (
                  <section className="grid overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:p-10 lg:grid-cols-[1fr_0.85fr]" style={{ backgroundColor: surfaceAltColor }}>
                    <div className="flex flex-col justify-center">
                      <h1 className="text-4xl font-semibold leading-tight md:text-5xl" style={{ color: textOnSurface }}>
                        {hero?.title || pressPage?.title || "Press Releases"}
                      </h1>
                      <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: mutedOnSurface }}>
                        {hero?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                      </p>
                    </div>
                    {hero?.bg_url ? (
                      <div className="relative mt-6 min-h-72 overflow-hidden rounded-[1.5rem] lg:mt-0">
                        <Image src={hero.bg_url} alt={hero.bg_alt || hero?.title || ""} fill className="object-cover" />
                      </div>
                    ) : null}
                  </section>
                );
              } else if (heroVariant === "centered") {
                sectionContent = (
                  <section
                    className="relative overflow-hidden rounded-[32px] px-8 py-16 text-center shadow-xl md:px-12 md:py-20"
                    style={{
                      backgroundImage: hero?.bg_url
                        ? `linear-gradient(135deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.34)), url('${hero.bg_url}')`
                        : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: heroTextColor,
                    }}
                  >
                    <div className="mx-auto max-w-3xl">
                      <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: heroMutedTextColor }}>Editorial Updates</p>
                      <h1 className="mt-4 text-4xl font-bold md:text-6xl">{hero?.title || pressPage?.title || "Press Releases"}</h1>
                      <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: heroMutedTextColor }}>
                        {hero?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                      </p>
                    </div>
                  </section>
                );
              } else if (heroVariant === "boarding-pass") {
                const d = new Date();
                const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const day = String(d.getDate()).padStart(2, '0');
                const yr = d.getFullYear();
                sectionContent = (
                  <section className="relative w-full">
                    <div className="relative rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]" style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}>
                      <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: textOnSurface }}>
                          ◉ Newsroom · {month} {day}
                        </span>
                        <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-[0.25em] font-black px-2 py-1 border-2 rotate-[-3deg]" style={{ borderColor: primaryColor, color: primaryColor }}>
                          ★ Issue · {yr}
                        </span>
                      </div>
                      <div className="px-6 py-10 sm:px-10 sm:py-14 flex flex-col gap-4">
                        <span className="self-start inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                          Press &amp; Updates
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight" style={{ color: textOnSurface, fontFamily: 'var(--font-title)' }}>
                          {hero?.title || pressPage?.title || "Press Releases"}
                        </h1>
                        <p className="max-w-2xl text-base sm:text-lg leading-relaxed" style={{ color: mutedOnSurface }}>
                          {hero?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                        <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <span key={i} className="block" style={{ backgroundColor: textOnSurface, width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap" style={{ color: textOnSurface }}>
                          PRS-{yr.toString().slice(-2)}
                        </span>
                      </div>
                    </div>
                  </section>
                );
              } else if (heroVariant === "glassmorphic") {
                sectionContent = (
                  <section className="relative overflow-hidden rounded-[3rem] p-8 md:p-16 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]">
                    {/* Background Media */}
                    <div className="absolute inset-0 -z-10">
                        {hero?.bg_url ? (
                            <Image 
                                src={hero.bg_url}
                                alt={hero.bg_alt || ''}
                                fill
                                className="object-cover scale-105"
                            />
                        ) : null}
                        
                        {/* Soft, vibrant gradients injected over the media */}
                        <div 
                        className="absolute inset-0 bg-gradient-to-tr mix-blend-multiply opacity-80"
                        style={{ backgroundImage: `linear-gradient(to top right, ${primaryColor}, transparent, rgba(0,0,0,0.6))` }} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--surface)] mix-blend-overlay opacity-60" />

                        {/* Decorative Orbs */}
                        <div 
                            className="absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-[0.2]"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <div 
                            className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[100px] opacity-[0.1]"
                            style={{ backgroundColor: '#ffffff' }}
                        />
                    </div>
                    
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl" />
                    
                    <div className="relative z-10 mx-auto max-w-4xl">
                        <div className="mx-auto rounded-[2.5rem] border border-white/20 bg-white/10 px-8 py-10 backdrop-blur-xl shadow-xl sm:px-12 md:py-14 text-center">
                            <p 
                                className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white backdrop-blur-md border border-white/20 shadow-sm"
                                style={{ backgroundColor: `${primaryColor}40` }}
                            >
                                Latest News
                            </p>
                            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-7xl">
                                {hero?.title || pressPage?.title || "Press Releases"}
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/90 drop-shadow-sm md:text-xl">
                                {hero?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                            </p>
                        </div>
                    </div>
                  </section>
                );
              } else {
                sectionContent = (
                  <section
                    className="relative overflow-hidden rounded-[32px] px-8 py-14 shadow-xl md:px-12 md:py-16"
                    style={{
                      backgroundImage: hero?.bg_url
                        ? `linear-gradient(135deg, rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.36)), url('${hero.bg_url}')`
                        : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: heroTextColor,
                    }}
                  >
                    <div className="max-w-3xl">
                      <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: heroMutedTextColor }}>News & Updates</p>
                      <h1 className="mt-4 text-4xl font-bold md:text-5xl">{hero?.title || pressPage?.title || "Press Releases"}</h1>
                      <p className="mt-4 text-lg" style={{ color: heroMutedTextColor }}>
                        {hero?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                      </p>
                    </div>
                  </section>
                );
              }
              break;

            case "press_list":
              if (pressListVariant === "minimal") {
                sectionContent = (
                  <section className="rounded-[28px] border border-slate-200 px-6 py-8 shadow-sm md:px-8 md:py-10" style={{ backgroundColor: surfaceColor }}>
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                        Latest Stories
                      </p>
                      <h2 className="mt-3 text-3xl font-bold" style={{ color: textOnSurface }}>
                        {pressListSection?.title || "News & Updates"}
                      </h2>
                    </div>

                    {orderedPress.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                        No published news items yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orderedPress.map((item) => (
                          <Link
                            key={item.id}
                            href={`/press/${item.slug || item.id}`}
                            className="flex flex-col gap-2 rounded-[20px] border border-slate-200 px-5 py-4 transition-shadow hover:shadow-sm"
                            style={{ backgroundColor: surfaceAltColor }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-lg font-semibold" style={{ color: textOnSurfaceAlt }}>{item.title}</h3>
                              <span className="text-xs uppercase tracking-[0.18em]" style={{ color: mutedOnSurface }}>{formatPublishDate(item.publish_date)}</span>
                            </div>
                            <p className="text-sm" style={{ color: mutedOnSurface }}>
                              {toPressExcerpt(item.content) || "Read the full update."}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                );
              } else if (pressListVariant === "island-premium") {
                sectionContent = (
                  <section className="rounded-[2rem] p-5 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:p-8" style={{ backgroundColor: surfaceColor }}>
                    <h2 className="text-3xl font-semibold" style={{ color: textOnSurface }}>
                      {pressListSection?.title || "News & Updates"}
                    </h2>
                    {pressListSection?.description ? <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: mutedOnSurface }}>{pressListSection.description}</p> : null}
                    {orderedPress.length === 0 ? (
                      <div className="mt-8 rounded-[1.5rem] border border-dashed px-6 py-10 text-center text-sm" style={{ borderColor: `${primaryColor}40`, backgroundColor: surfaceAltColor, color: mutedOnSurface }}>
                        No published news items yet.
                      </div>
                    ) : (
                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {orderedPress.map((item) => (
                          <Link
                            key={item.id}
                            href={`/press/${item.slug || item.id}`}
                            className="rounded-[1.5rem] border p-5 transition-transform hover:-translate-y-1"
                            style={{ borderColor: `${primaryColor}26`, backgroundColor: surfaceAltColor }}
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>{formatPublishDate(item.publish_date)}</p>
                            <h3 className="mt-3 text-xl font-semibold" style={{ color: textOnSurface }}>{item.title}</h3>
                            <p className="mt-3 line-clamp-3 text-sm leading-6" style={{ color: mutedOnSurface }}>
                              {toPressExcerpt(item.content) || "Read the full update."}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                );
              } else if (pressListVariant === "cards") {
                sectionContent = (
                  <section className="rounded-[32px] px-6 py-8 shadow-sm md:px-8 md:py-10" style={{ backgroundColor: surfaceColor }}>
                    <div className="mb-8">
                      <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                        Latest Stories
                      </p>
                      <h2 className="mt-3 text-3xl font-bold" style={{ color: textOnSurface }}>
                        {pressListSection?.title || "News & Updates"}
                      </h2>
                      <p className="mt-3 max-w-3xl" style={{ color: mutedOnSurface }}>
                        {pressListSection?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                      </p>
                    </div>

                    {orderedPress.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                        No published news items yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {orderedPress.map((item) => (
                          <Link
                            key={item.id}
                            href={`/press/${item.slug || item.id}`}
                            className="rounded-[28px] border border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md"
                            style={{ backgroundColor: surfaceAltColor }}
                          >
                            <div className="mb-4 flex items-center gap-2">
                              <FileText className="h-5 w-5" style={{ color: primaryColor }} />
                            </div>
                            <h3 className="text-xl font-semibold" style={{ color: textOnSurfaceAlt }}>{item.title}</h3>
                            <div className="mt-3 flex items-center text-sm" style={{ color: mutedOnSurface }}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {formatPublishDate(item.publish_date)}
                            </div>
                            <div className="mt-6">
                              <Button variant="default" className="w-full py-2">
                                Read More
                              </Button>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                );
              } else if (pressListVariant === "boarding-pass") {
                sectionContent = (
                  <section className="w-full">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                        ★ Dispatch Log
                      </span>
                      <span className="flex-1 h-[2px] border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.2)' }} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textOnSurface }}>
                        {String(orderedPress.length).padStart(2, '0')} · Entries
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6" style={{ color: textOnSurface, fontFamily: 'var(--font-title)' }}>
                      {pressListSection?.title || "News & Updates"}
                    </h2>
                    {orderedPress.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: 'rgba(15,23,42,0.2)' }}>
                        <p className="font-mono text-sm uppercase tracking-[0.2em] opacity-60" style={{ color: mutedOnSurface }}>
                          ··· No entries published yet ···
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orderedPress.map((item, index) => (
                          <Link
                            key={item.id}
                            href={`/press/${item.slug || item.id}`}
                            className="group relative rounded-xl border-2 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_16px_30px_-15px_rgba(15,23,42,0.25)]"
                            style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
                          >
                            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                              <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-black opacity-70" style={{ color: textOnSurface }}>
                                N·{String(index + 1).padStart(3, '0')}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50" style={{ color: textOnSurface }}>
                                {formatPublishDate(item.publish_date)}
                              </span>
                            </div>
                            <div className="p-5 flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" style={{ color: primaryColor }} />
                                <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-black" style={{ color: primaryColor }}>Dispatch</span>
                              </div>
                              <h3 className="text-lg font-black tracking-tight leading-snug line-clamp-2" style={{ color: textOnSurface }}>
                                {item.title}
                              </h3>
                              {toPressExcerpt(item.content) && (
                                <p className="text-sm leading-relaxed line-clamp-2 opacity-70" style={{ color: textOnSurface }}>
                                  {toPressExcerpt(item.content)}
                                </p>
                              )}
                              <div className="mt-1 pt-3 border-t-2 border-dashed flex items-center justify-between" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                                <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-black opacity-60" style={{ color: textOnSurface }}>
                                  Read More
                                </span>
                                <span className="font-mono text-xs font-black" style={{ color: primaryColor }}>→</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                );
              } else if (pressListVariant === "glassmorphic") {
                sectionContent = (
                  <section className="relative px-2 py-8 w-full overflow-hidden">
                    <div 
                        className="absolute right-1/4 top-1/2 -z-10 h-[400px] w-[500px] -translate-y-1/2 rounded-[100%] blur-[130px] opacity-[0.1]"
                        style={{ backgroundColor: primaryColor }}
                    />
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-10 text-center">
                            <p
                                className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-sm"
                                style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}25`, color: primaryColor }}
                            >
                                Articles
                            </p>
                            <h2 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: textOnSurface }}>
                                {pressListSection?.title || "News & Updates"}
                            </h2>
                        </div>
                        {orderedPress.length === 0 ? (
                            <div className="rounded-[2.5rem] border border-white/40 bg-white/40 p-12 text-center backdrop-blur-xl shadow-sm">
                                <p className="text-lg font-medium" style={{ color: mutedOnSurface }}>No published news items yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {orderedPress.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/press/${item.slug || item.id}`}
                                        className="relative overflow-hidden flex flex-col justify-between rounded-[2rem] border border-white/40 p-8 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)' }}
                                    >
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300" 
                                            style={{ background: `linear-gradient(135deg, transparent, ${primaryColor})` }} 
                                        />
                                        <div className="relative z-10">
                                            <div 
                                                className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border border-white/50 backdrop-blur-md"
                                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                            >
                                                <FileText className="h-6 w-6 drop-shadow-sm" />
                                            </div>
                                            <h3 className="mb-3 text-2xl font-bold tracking-tight line-clamp-2" style={{ color: textOnSurfaceAlt }}>{item.title}</h3>
                                            <div className="mb-4 flex items-center text-sm font-medium" style={{ color: mutedOnSurface }}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {formatPublishDate(item.publish_date)}
                                            </div>
                                        </div>
                                        <div className="relative z-10 mt-auto pt-6">
                                            <Button variant="default" className="w-full rounded-2xl py-6 font-bold tracking-wide" style={{ backgroundColor: primaryColor, color: getReadableTextColor(primaryColor) }}>
                                                Read More
                                            </Button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                  </section>
                );
              } else {
                sectionContent = (
                  <section className="rounded-[28px] px-6 py-8 shadow-sm md:px-8 md:py-10" style={{ backgroundColor: surfaceColor }}>
                    <div className="mb-8">
                      <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                        Latest Stories
                      </p>
                      <h2 className="mt-3 text-3xl font-bold" style={{ color: textOnSurface }}>
                        {pressListSection?.title || "News & Updates"}
                      </h2>
                      <p className="mt-3 max-w-3xl" style={{ color: mutedOnSurface }}>
                        {pressListSection?.description || `Stay updated with the latest news and announcements from ${branding?.brand_name || "our team"}.`}
                      </p>
                    </div>

                    {orderedPress.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                        No published news items yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {orderedPress.map((item) => (
                          <Link
                            key={item.id}
                            href={`/press/${item.slug || item.id}`}
                            className="rounded-[24px] border border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md"
                            style={{ backgroundColor: surfaceAltColor }}
                          >
                            <div className="mb-4 flex items-center gap-2">
                              <FileText className="h-5 w-5" style={{ color: primaryColor }} />
                            </div>
                            <h3 className="text-xl font-semibold" style={{ color: textOnSurfaceAlt }}>{item.title}</h3>
                            <div className="mt-3 flex items-center text-sm" style={{ color: textOnSurfaceAlt === "#f8fafc" ? "#cbd5e1" : "#64748b" }}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {formatPublishDate(item.publish_date)}
                            </div>
                            <div className="mt-6">
                              <Button variant="default" className="w-full py-2">
                                Read More
                              </Button>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                );
              }
              break;

            default:
              sectionContent = null;
              break;
          }

          if (!sectionContent) return null;

          const pressSectionId = section.section_key === 'hero' ? 'press_hero' : 'press_list';
          const animationStyle = sectionAnimations[pressSectionId];
          const animationClass = animationStyle && animationStyle !== "none" ? `anim-section-${pressSectionId}` : "";
          const isFocused = activeSectionId === pressSectionId;

          return (
            <AnimatedSection 
              key={section.id} 
              id={`section-${pressSectionId}`}
              className={cn(
                animationClass,
                isFocused && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all duration-500 rounded-lg relative z-50"
              )}
            >
              {sectionContent}
            </AnimatedSection>
          );
        })}
      </div>
    </div>
  );
}
