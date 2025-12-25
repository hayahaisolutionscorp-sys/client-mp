'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function GetToKnowUs() {
  const [tab, setTab] = useState<'Mission' | 'Vision'>('Mission');

  const TABS = {
    Mission: 'Mission',
    Vision: 'Vision'
  } as const;

  type TabName = keyof typeof TABS; // 'Mission' | 'Vision'

  const videoSrc =
    '/assets/get_to_know_us/Purple Modern Professional Shipping Container Sales And Leasing Promotion.mp4';

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16 p-4 sm:p-8 md:p-12 lg:p-16">
      {/* Video Section */}
      <div className="w-full lg:w-[400px] h-[400px] lg:h-[495px] bg-white shadow-xl rounded-2xl overflow-hidden">
        <video className="w-full h-full object-cover" src={videoSrc} autoPlay={true} preload="none" playsInline muted aria-hidden="true" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 space-y-6">
        <h2 className="font-bold text-customText text-2xl sm:text-3xl md:text-4xl">Get To Know Us</h2>

        <p className="text-customText/80 text-sm sm:text-base border-l-4 border-customBlue pl-4 space-y-4">
          Welcome to Ayahay!
          <br />
          <br />
          At Ayahay, innovation meets expertise to redefine logistics and technology in the Philippines. With deep roots
          in IT and logistics, our mission is to revolutionize how transportation is managed and experienced.
          <br />
          <br />
          Our team combines years of experience to address the unique challenges of shipping and logistics, designing
          user-focused solutions that make every journey—whether for people or goods—seamless, efficient, and
          convenient.
        </p>

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
              Our mission is to empower businesses in the shipping line industry to adapt to advanced technology and
              digitization. We aim to make it easier for businesses to manage their fleets and enhance the sea travel
              experience for passengers, saving them time and ensuring a hassle-free journey.
            </p>
          )}
          {tab === TABS.Vision && (
            <p className="text-customText">
              Our vision is to be the leading provider of efficient and reliable shipping services, connecting
              communities and fostering economic growth in the region.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

