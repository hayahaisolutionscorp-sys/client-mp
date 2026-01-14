"use client"

import { Skeleton } from "../../ui/Skeleton"

export default function DependentSkeleton() {
    return (
        <div className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between">
                {/* Left: Avatar and Info */}
                <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
        </div>
    )
}
