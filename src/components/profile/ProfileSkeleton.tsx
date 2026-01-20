"use client"

import { Skeleton } from "../ui/Skeleton"
import { Card, CardContent } from "../ui/Card"

export default function ProfileSkeleton() {
    return (
        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            {/* Header Card Skeleton */}
            <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-md">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white shadow-lg shrink-0" />
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
                            <Skeleton className="h-5 w-48 mx-auto md:mx-0" />
                            <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <div className="w-full mt-6">
                <div className="flex border-b mb-6 overflow-x-auto gap-8">
                    <Skeleton className="h-12 w-32 rounded-none" />
                    <Skeleton className="h-12 w-32 rounded-none" />
                    <Skeleton className="h-12 w-32 rounded-none" />
                    <Skeleton className="h-12 w-32 rounded-none" />
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Main Content Area Skeleton */}
                    <Card className="flex-1 w-full p-6 space-y-8">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Sidebar Skeleton */}
                    <Card className="w-full lg:w-[400px] p-6 space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
