import { Skeleton } from "@/components/ui/Skeleton";

export default function PageSkeleton() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="w-full h-[400px] bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-12 w-3/4 max-w-2xl bg-gray-200" />
        <Skeleton className="h-6 w-1/2 max-w-md bg-gray-200" />
      </div>

      {/* Content Sections */}
      <div className="container max-w-7xl mx-auto py-16 px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-3/4 bg-gray-200" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-2xl bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl bg-gray-200" />
              <Skeleton className="h-6 w-2/3 bg-gray-200" />
              <Skeleton className="h-4 w-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
          <Skeleton className="h-8 w-48 bg-gray-200" />
          <Skeleton className="h-4 w-64 bg-gray-200" />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-gray-200" />
            <Skeleton className="h-12 w-full rounded-lg bg-gray-200" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg bg-gray-200" />
        </div>

        <div className="flex justify-center">
          <Skeleton className="h-4 w-40 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
