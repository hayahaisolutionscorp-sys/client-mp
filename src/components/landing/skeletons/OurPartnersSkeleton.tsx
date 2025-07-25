interface OurPartnersSkeleton {
  className?: string;
}

export default function OurPartnersSkeleton({ className }: OurPartnersSkeleton) {
  return (
    <div className={`relative mt-10 ${className || ''}`}>
      {/* Carousel skeleton */}
      <div className="w-full">
        <div className="flex gap-4 overflow-hidden">
          {/* Multiple carousel item skeletons */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
              <div className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
        {/* Navigation arrows skeleton */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        {/* Dots indicator skeleton */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
