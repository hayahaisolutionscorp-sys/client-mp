'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import Carousel from '@/components/landing/Carousel';
import CarouselSkeleton from './skeletons/CarouselSkeleton';
import { getPromos } from '@/services/ui/promos.service';
import { IThumbnail } from '@/models';
import type { PreviewTravelPromotion } from '@/lib/preview/landing-preview';

interface PromosProps {
  promosOverride?: PreviewTravelPromotion[] | null;
}

export default function Promos({ promosOverride }: PromosProps = {}) {
  const [promos, setPromos] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState(!promosOverride);

  useEffect(() => {
    if (promosOverride) {
      setPromos(promosOverride.map((promo) => ({
        id: 0,
        label: promo.image_alt || '',
        filename: promo.image_url,
        location: '',
        imageOrder: promo.display_order ?? 0,
      })));
      setLoading(false);
      return;
    }

    getPromos().then(rawPromos => {
      setPromos(rawPromos.map(promo => ({
        id: 0, 
        label: promo.image_alt || '',
        filename: promo.image_url,
        location: '',
        imageOrder: promo.display_order
      })));
      setLoading(false);
    });
  }, [promosOverride]);

  const promoImagesPromise = useMemo(() => Promise.resolve(promos), [promos]);

  if (loading) return <CarouselSkeleton />;

  return (
    <div id="Promos" className="relative w-full overflow-hidden mt-40">
      <div className="container max-w-7xl mx-auto pt-40 sm:pt-10 md:pt-15 lg:pt-20">
        <div className="text-center">
          <h1 className="font-bold text-customText text-2xl sm:text-3xl lg:text-4xl">Travel Promotions & Updates</h1>
        </div>
        <div className="relative mt-10">
          <Suspense fallback={<CarouselSkeleton />}>
            <Carousel images={promoImagesPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
