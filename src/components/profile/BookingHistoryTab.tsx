"use client"

import React from 'react'
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export const BookingHistoryTab: React.FC = () => {
    const router = useRouter();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>View and manage your past and upcoming trips.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <p>No booking history found.</p>
                    <Button variant="link" className="mt-2" onClick={() => router.push('/search')}>
                        Book a trip now
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
