import PhotoGrid from '@/components/landing/photogrid/PhotoGrid';
import { Suspense } from 'react';
import RoutesPhotoGridSkeleton from './skeletons/RoutesPhotoGridSkeleton';
import { getThumbnailsByShippingLineId } from '@/services';

export default async function PopularRoutes() {
  const shippingLineId = parseInt(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3');
  const routeImages = getThumbnailsByShippingLineId('Photogrid', shippingLineId);

  return (
    <div id="Routes" className="container max-w-7xl mx-auto px-6 mt-16 sm:px-8 lg:px-10 pb-5">
      <h1 className="font-bold text-customText text-2xl sm:text-3xl lg:text-4xl text-center">
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
