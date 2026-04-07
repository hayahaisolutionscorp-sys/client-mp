import Link from "next/link";

import { Calendar, FileText } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { createBuilderTheme } from "@/components/landing/builder/theme";
import { getReadableTextColor } from "@/lib/color-utils";
import { normalizePressBuilderContent } from "@/lib/press-builder";
import type { IBrandingConfig, IThemeSettings } from "@/models";
import type { IPress } from "@/models";
import type { IPressPage, IPressSection } from "@/services/content/press.service";

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

export function PressPageContent({
  pressPage,
  sections,
  press,
  themeSettings,
  branding,
}: PressPageContentProps) {
  const builderConfig = normalizePressBuilderContent(pressPage?.content);
  const theme = createBuilderTheme((branding ?? {}) as IBrandingConfig);
  const primaryColor = themeSettings?.primary || theme.primary;
  const secondaryColor = themeSettings?.secondary || theme.secondary;
  const surfaceColor = themeSettings?.surface || theme.surface;
  const surfaceAltColor = themeSettings?.surfaceAlt || theme.surfaceAlt;
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
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12" style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {!heroEnabled ? (
          <div className="rounded-[28px] px-8 py-10 shadow-sm" style={{ backgroundColor: surfaceColor }}>
            <h1 className="text-4xl font-bold" style={{ color: textOnSurface }}>{pressPage?.title || "News & Updates"}</h1>
          </div>
        ) : null}

        {orderedSections.map((section) => {
          switch (section.section_key) {
            case "hero":
              if (heroVariant === "minimal") {
                return (
                  <section
                    key={section.id}
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
              }

              if (heroVariant === "centered") {
                return (
                  <section
                    key={section.id}
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
              }

              return (
                <section
                  key={section.id}
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
            case "press_list":
              if (pressListVariant === "minimal") {
                return (
                  <section key={section.id} className="rounded-[28px] border border-slate-200 px-6 py-8 shadow-sm md:px-8 md:py-10" style={{ backgroundColor: surfaceColor }}>
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
                              {item.content || "Read the full update."}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                );
              }

              if (pressListVariant === "cards") {
                return (
                  <section key={section.id} className="rounded-[32px] px-6 py-8 shadow-sm md:px-8 md:py-10" style={{ backgroundColor: surfaceColor }}>
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
              }

              return (
                <section key={section.id} className="rounded-[28px] px-6 py-8 shadow-sm md:px-8 md:py-10" style={{ backgroundColor: surfaceColor }}>
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
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
