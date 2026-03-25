import { getWhyChooseReasons } from '@/services/content/features.service';
import Features from '@/components/landing/Features';
import GetToKnowUs from '@/components/landing/GetToKnowUs';
import OurPartners from '@/components/landing/OurPartners';
import { Suspense } from 'react';
import OurPartnersSkeleton from './skeletons/OurPartnersSkeleton';
import type { IWhyChooseReason, IWhyChooseSection } from '@/services/content/features.service';
import type { IGetToKnowData } from '@/services/ui/get-to-know.service';
import type { IThemeSettings, IBrandingConfig } from '@/models';
import type { PreviewPartner } from '@/lib/preview/landing-preview';

interface WhyChooseUsProps {
  reasonsOverride?: IWhyChooseReason[] | null;
  sectionOverride?: IWhyChooseSection | null;
  getToKnowMainOverride?: IGetToKnowData | null;
  getToKnowMissionOverride?: IGetToKnowData | null;
  getToKnowVisionOverride?: IGetToKnowData | null;
  partnersOverride?: PreviewPartner[] | null;
  themeSettingsOverride?: IThemeSettings | null;
  brandingConfigOverride?: IBrandingConfig | null;
}

export default async function WhyChooseUs({
  reasonsOverride,
  sectionOverride,
  getToKnowMainOverride,
  getToKnowMissionOverride,
  getToKnowVisionOverride,
  partnersOverride,
  themeSettingsOverride,
  brandingConfigOverride,
}: WhyChooseUsProps = {}) {
  const reasons = reasonsOverride ?? await getWhyChooseReasons();
  const sortedReasons = reasons ? [...reasons].sort((a, b) => a.display_order - b.display_order) : [];

  return (
    <>
      <div id="WhyChooseUs" className="container max-w-7xl mt-16 mx-auto px-6 sm:px-8 lg:px-10 pb-10">
        <Features
          reasons={sortedReasons}
          sectionOverride={sectionOverride}
          themeSettingsOverride={themeSettingsOverride}
          brandingConfigOverride={brandingConfigOverride}
        />
        <div className="mt-12">
          <GetToKnowUs
            mainDataOverride={getToKnowMainOverride}
            missionDataOverride={getToKnowMissionOverride}
            visionDataOverride={getToKnowVisionOverride}
            themeSettingsOverride={themeSettingsOverride}
          />
        </div>
      </div>

      <div id="Partner" className="bg-white px-6 py-10">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <h1 className="font-bold text-center text-customText text-2xl sm:text-3xl lg:text-4xl">Our Partners</h1>
          <div className="mt-5">
            <Suspense fallback={<OurPartnersSkeleton />}>
              <OurPartners partnersOverride={partnersOverride} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
