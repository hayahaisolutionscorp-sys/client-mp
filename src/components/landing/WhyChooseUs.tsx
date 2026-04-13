'use client';

import { useEffect, useState } from 'react';
import { getWhyChooseReasons } from '@/services/content/features.service';
import Features from '@/components/landing/Features';
import type { IWhyChooseReason, IWhyChooseSection } from '@/services/content/features.service';
import type { IThemeSettings, IBrandingConfig } from '@/models';

interface WhyChooseUsProps {
  reasonsOverride?: IWhyChooseReason[] | null;
  sectionOverride?: IWhyChooseSection | null;
  themeSettingsOverride?: IThemeSettings | null;
  brandingConfigOverride?: IBrandingConfig | null;
}

export default function WhyChooseUs({
  reasonsOverride,
  sectionOverride,
  themeSettingsOverride,
  brandingConfigOverride,
}: WhyChooseUsProps = {}) {
  const [reasons, setReasons] = useState<IWhyChooseReason[]>(() => reasonsOverride ?? []);
  const [loading, setLoading] = useState(() => reasonsOverride == null);

  useEffect(() => {
    if (reasonsOverride != null) {
      setReasons(reasonsOverride);
      setLoading(false);
      return;
    }

    getWhyChooseReasons().then(data => {
      setReasons(data || []);
      setLoading(false);
    });
  }, [reasonsOverride]);

  const sortedReasons = reasons ? [...reasons].sort((a, b) => a.display_order - b.display_order) : [];

  if (loading) return null;

  return (
    <div id="WhyChooseUs" className="container max-w-7xl mt-16 mx-auto px-6 sm:px-8 lg:px-10 pb-10">
      <Features
        reasons={sortedReasons}
        sectionOverride={sectionOverride}
        themeSettingsOverride={themeSettingsOverride}
        brandingConfigOverride={brandingConfigOverride}
      />
    </div>
  );
}
