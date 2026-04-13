'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getWhyChooseSection } from '@/services/content/features.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getBrandingConfig } from '@/services/ui/branding.service';
import type { IWhyChooseReason, IWhyChooseSection } from '@/services/content/features.service';
import type { IThemeSettings, IBrandingConfig } from '@/models';

interface FeaturesProps {
  reasons: IWhyChooseReason[];
  sectionOverride?: IWhyChooseSection | null;
  themeSettingsOverride?: IThemeSettings | null;
  brandingConfigOverride?: IBrandingConfig | null;
}

export default function Features({
  reasons,
  sectionOverride,
  themeSettingsOverride,
  brandingConfigOverride,
}: FeaturesProps) {
  const [section, setSection] = useState<IWhyChooseSection | null>(sectionOverride ?? null);
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(themeSettingsOverride ?? null);
  const [brandingConfig, setBrandingConfig] = useState<IBrandingConfig | null>(brandingConfigOverride ?? null);
  const [loading, setLoading] = useState(
    () =>
      !(
        sectionOverride != null &&
        themeSettingsOverride != null &&
        brandingConfigOverride != null
      )
  );

  useEffect(() => {
    if (
      sectionOverride != null &&
      themeSettingsOverride != null &&
      brandingConfigOverride != null
    ) {
      setSection(sectionOverride);
      setThemeSettings(themeSettingsOverride);
      setBrandingConfig(brandingConfigOverride);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [sectionRes, themeRes, brandingRes] = await Promise.all([
          sectionOverride != null ? Promise.resolve(sectionOverride) : getWhyChooseSection(),
          themeSettingsOverride != null ? Promise.resolve(themeSettingsOverride) : getThemeSettings(),
          brandingConfigOverride != null ? Promise.resolve(brandingConfigOverride) : getBrandingConfig()
        ]);

        setSection((sectionRes as any)?.data ?? sectionRes);
        setThemeSettings((themeRes as any)?.data ?? themeRes);
        setBrandingConfig((brandingRes as any)?.data ?? brandingRes);
      } catch (error) {
        console.error("Failed to load features data", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [sectionOverride, themeSettingsOverride, brandingConfigOverride]);

  if (loading || !section || !reasons) return null;

  const title = section.title.includes('Ayahay!') ? (
    <>
      {section.title.replace('Ayahay!', '')}
      <span style={{ color: themeSettings?.accent }}>{brandingConfig?.brand_name}!</span>
    </>
  ) : (
    section.title
  );

  return (
    <section className="w-full">
      <div className="min-h-[400px] flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="w-full text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-bold text-customText text-2xl sm:text-3xl md:text-4xl mb-4">
            {title}
          </h2>
          <p className="text-customText/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            {section.description}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl mx-auto">
          {reasons.map((reason) => (
            <FeatureCard
              key={reason.id}
              icon={
                <Image
                  src={reason.icon_url}
                  alt={reason.icon_alt}
                  width={65}
                  height={65}
                />
              }
              title={reason.title}
              description={reason.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group flex flex-col p-6 sm:p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out h-full">
      <div className="py-2 mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="font-semibold text-customText text-lg sm:text-xl mb-3">{title}</h3>
      <p className="text-customText/70 text-sm sm:text-base">{description}</p>
    </div>
  );
}
