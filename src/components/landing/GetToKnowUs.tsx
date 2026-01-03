'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Media from './Media';
import {
  getGetToKnow,
  getGetToKnowMission,
  getGetToKnowVision,
  IGetToKnowData
} from '@/services/ui/get-to-know.service';

export default function GetToKnowUs() {
  const [tab, setTab] = useState<'Mission' | 'Vision'>('Mission');
  const [mainData, setMainData] = useState<IGetToKnowData | null>(null);
  const [missionData, setMissionData] = useState<IGetToKnowData | null>(null);
  const [visionData, setVisionData] = useState<IGetToKnowData | null>(null);
  const [loading, setLoading] = useState(true);

  const TABS = {
    Mission: 'Mission',
    Vision: 'Vision'
  } as const;

  type TabName = keyof typeof TABS; // 'Mission' | 'Vision'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mainRes, missionRes, visionRes] = await Promise.all([
          getGetToKnow(),
          getGetToKnowMission(),
          getGetToKnowVision(),
        ]);
        setMainData(mainRes.data);
        setMissionData(missionRes.data);
        setVisionData(visionRes.data);
      } catch (error) {
        console.error('Error fetching GetToKnowUs data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    // Or return a skeleton/spinner
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16 p-4 sm:p-8 md:p-12 lg:p-16">
      {/* Media Section */}
      <div className="w-full lg:w-[400px] h-[400px] lg:h-[495px] bg-white shadow-xl rounded-2xl overflow-hidden relative">
        {mainData && (mainData.bg_type === 'video' || mainData.bg_type === 'image') && mainData.bg_url && (
          <Media
            src={mainData.bg_url}
            type={mainData.bg_type}
            alt={mainData.bg_alt || 'Get to know us media'}
            priority
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          />
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 space-y-6">
        <h2 className="font-bold text-customText text-2xl sm:text-3xl md:text-4xl">{mainData?.title || 'Get To Know Us'}</h2>

        <div className="text-customText/80 text-sm sm:text-base border-l-4 border-customBlue pl-4 space-y-4 whitespace-pre-wrap">
          {mainData?.description}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mt-8">
          {Object.values(TABS).map((tabName) => (
            <Button
              key={tabName}
              onClick={() => setTab(tabName as TabName)}
              aria-label={`Show ${tabName}`}
              aria-pressed={tab === tabName}
              className={`relative px-4 py-2 rounded-md font-semibold transition-colors ${tab === tabName ? 'bg-customBlue text-white' : 'bg-white-500 border shadow-lg text-customText'
                }`}
            >
              {tabName}
              {tab === tabName && (
                <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-customBlue"></span>
              )}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 text-customText/80 text-sm sm:text-base">
          {tab === TABS.Mission && (
            <p className="text-customText">
              {missionData?.description}
            </p>
          )}
          {tab === TABS.Vision && (
            <p className="text-customText">
              {visionData?.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

