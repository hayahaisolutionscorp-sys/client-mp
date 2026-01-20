import { Suspense } from 'react';
import Carousel from '@/components/landing/Carousel';
import CarouselSkeleton from './skeletons/CarouselSkeleton';
import { getPromos } from '@/services/ui/promos.service';


export default async function Promos() {
  const promoImages = getPromos().then(promos =>
    promos.map(promo => ({
      id: 0, // Mock ID as IThumbnail expects number, but API returns UUID
      label: promo.image_alt || '',
      filename: promo.image_url,
      location: '',
      imageOrder: promo.display_order
    }))
  );

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
