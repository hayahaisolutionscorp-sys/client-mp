import { Suspense } from 'react';
import Carousel from '@/components/landing/Carousel';
import CarouselSkeleton from './skeletons/CarouselSkeleton';
import { getThumbnailsByShippingLineId } from '@/services';

export default async function Promos() {
  const shippingLineId = parseInt(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3');
  const promoImages = getThumbnailsByShippingLineId('Carousel', shippingLineId);

  return (
    <div id="Promos" className="relative w-full overflow-hidden mt-16">
      <div className="container max-w-7xl mx-auto pt-40 sm:pt-10 md:pt-15 lg:pt-20">
        <div className="text-center">
          <h1 className="font-bold text-customText text-2xl sm:text-3xl lg:text-4xl">Travel Promotions & Updates</h1>
        </div>
        <div className="relative mt-10">
          <Suspense fallback={<CarouselSkeleton />}>
            <Carousel images={promoImages} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
