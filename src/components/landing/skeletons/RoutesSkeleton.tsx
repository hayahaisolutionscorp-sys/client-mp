import { Skeleton } from "@/components/ui/Skeleton";

interface RoutesSkeleton {
  className?: string;
}

export default function RoutesSkeleton({ className }: RoutesSkeleton) {
  return (
    <div className={`relative w-full overflow-hidden mt-16 ${className || ''}`}>
      <div className="container max-w-7xl mx-auto pt-40 sm:pt-10 md:pt-15 lg:pt-20">
        <div className="text-center">
          {/* Title skeleton */}
          <Skeleton className="h-8 w-80 mx-auto" />
        </div>
        <div className="relative mt-10">
          {/* Carousel skeleton */}
          <div className="w-full">
            <div className="flex gap-4 overflow-hidden">
              {/* Multiple carousel item skeletons */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                  <Skeleton className="aspect-video rounded-lg" />
                </div>
              ))}
            </div>
            {/* Navigation arrows skeleton */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            {/* Dots indicator skeleton */}
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="w-3 h-3 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
