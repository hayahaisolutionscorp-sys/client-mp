import Features from '@/components/landing/Features';
import GetToKnowUs from '@/components/landing/GetToKnowUs';
import OurPartners from '@/components/landing/OurPartners';
import { Suspense } from 'react';
import OurPartnersSkeleton from './skeletons/OurPartnersSkeleton';

export default async function WhyChooseUs() {
  return (
    <>
      <div id="WhyChooseUs" className="container max-w-7xl mt-16 mx-auto px-6 sm:px-8 lg:px-10 pb-10">
        <Features />
        <div className="mt-12">
          <GetToKnowUs />
        </div>
      </div>

      <div id="Partner" className="bg-white px-6 py-10">
        <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <h1 className="font-bold text-center text-customText text-2xl sm:text-3xl lg:text-4xl">Our Partners</h1>
          <div className="mt-5">
            <Suspense fallback={<OurPartnersSkeleton />}>
              <OurPartners />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
