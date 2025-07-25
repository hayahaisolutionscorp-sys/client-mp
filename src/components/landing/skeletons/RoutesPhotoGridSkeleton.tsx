import { Skeleton } from '@/components/ui/Skeleton';

interface PhotoGridSkeletonProps {
  className?: string;
  itemCount?: number;
}

export default function PhotoGridSkeleton({ className, itemCount = 8 }: PhotoGridSkeletonProps) {
  return (
    <div className={`w-full ${className || ''}`}>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="relative shadow-md rounded-lg overflow-hidden aspect-[4/3]">
            <Skeleton className="w-full h-full rounded-lg bg-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
