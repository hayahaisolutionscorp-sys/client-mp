'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ITrip } from '@/models';

interface TripsContextType {
    departureTrips: ITrip[];
    setDepartureTrips: (trips: ITrip[]) => void;
    returnTrips: ITrip[];
    setReturnTrips: (trips: ITrip[]) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
    const [departureTrips, setDepartureTrips] = useState<ITrip[]>([]);
    const [returnTrips, setReturnTrips] = useState<ITrip[]>([]);

    return (
        <TripsContext.Provider value={{ departureTrips, setDepartureTrips, returnTrips, setReturnTrips }}>
            {children}
        </TripsContext.Provider>
    );
}

export function useTrips() {
    const context = useContext(TripsContext);
    if (context === undefined) {
        throw new Error('useTrips must be used within a TripsProvider');
    }
    return context;
}
