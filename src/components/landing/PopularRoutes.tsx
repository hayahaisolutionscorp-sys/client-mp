import PhotoGrid from '@/components/landing/photogrid/PhotoGrid';
import { Suspense } from 'react';
import RoutesPhotoGridSkeleton from './skeletons/RoutesPhotoGridSkeleton';
import { getDestinations } from '@/services/ui/destinations.service';


export default async function PopularRoutes() {
  const shippingLineId = 3; // Default to Ayahay
  const routeImages = getDestinations().then(destinations =>
    destinations.map(dest => ({
      id: 0, // Mock ID
      shippingLineId: shippingLineId,
      label: dest.route,
      filename: dest.image_url,
      location: dest.route,
      imageOrder: dest.display_order
    }))
  );

  return (
    <div id="Routes" className="container max-w-7xl mx-auto px-6 mt-16 sm:px-8 lg:px-10 pb-5">
      <h1 className="font-bold text-customText text-2xl sm:text-3xl lg:text-4xl text-left">
        Most Popular Routes Recommended For You
      </h1>
      <div className="mt-10">
        <Suspense fallback={<RoutesPhotoGridSkeleton />}>
          <PhotoGrid images={routeImages} />
        </Suspense>
      </div>
    </div>
  );
}
