'use client';

import PhotoGrid from '@/components/landing/photogrid/PhotoGrid';
import { Suspense, useEffect, useState, useMemo } from 'react';
import RoutesPhotoGridSkeleton from './skeletons/RoutesPhotoGridSkeleton';
import { getDestinations } from '@/services/ui/destinations.service';
import { IThumbnail } from '@/models';
import type { PreviewRouteRecommendation } from '@/lib/preview/landing-preview';

interface PopularRoutesProps {
  routesOverride?: PreviewRouteRecommendation[] | null;
}

export default function PopularRoutes({ routesOverride }: PopularRoutesProps = {}) {
  const shippingLineId = 3; // Default to Ayahay
  const [routeImages, setRouteImages] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState(!routesOverride);

  useEffect(() => {
    if (routesOverride) {
      setRouteImages(routesOverride.map((dest) => ({
        id: 0,
        shippingLineId,
        label: dest.route,
        filename: dest.image_url,
        location: dest.route,
        imageOrder: dest.display_order ?? 0,
      })));
      setLoading(false);
      return;
    }

    getDestinations().then(destinations => {
      setRouteImages(destinations.map(dest => ({
        id: 0, // Mock ID
        shippingLineId: shippingLineId,
        label: dest.route,
        filename: dest.image_url,
        location: dest.route,
        imageOrder: dest.display_order
      })));
      setLoading(false);
    });
  }, [routesOverride]);

  const imagesPromise = useMemo(() => Promise.resolve(routeImages), [routeImages]);

  if (loading) return <RoutesPhotoGridSkeleton />;

  return (
    <div id="Routes" className="container max-w-7xl mx-auto px-6 mt-16 sm:px-8 lg:px-10 pb-5">
      <h1 className="font-bold text-customText text-2xl sm:text-3xl lg:text-4xl text-left">
        Most Popular Routes Recommended For You
      </h1>
      <div className="mt-10">
        <Suspense fallback={<RoutesPhotoGridSkeleton />}>
          <PhotoGrid images={imagesPromise} />
        </Suspense>
      </div>
    </div>
  );
}
