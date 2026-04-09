'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchItem, cacheItem } from 'helpers/cache.helpers';
import { SeatPicker } from './SeatPicker';
import type { SeatLabelsMap } from './SeatPicker';
import type { AssignmentsMap } from './seat-picker.types';

interface SeatSelectionContentProps {
  departureTripId?: string;
  returnTripId?: string;
  commodityId?: string;
  departureCabinId?: string;
  returnCabinId?: string;
}

export default function SeatSelectionContent({
  departureTripId,
  returnTripId,
  commodityId,
  departureCabinId,
  returnCabinId,
}: SeatSelectionContentProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read booking data from cache — only after mount (client-only, localStorage)
  const bookingJson = useMemo(
    () => (mounted ? fetchItem<any>('booking-json') : null),
    [mounted],
  );

  useEffect(() => {
    if (!mounted) return;
    if (!bookingJson || !departureTripId) {
      router.replace('/booking/destination');
    }
  }, [mounted, bookingJson, departureTripId, router]);

  // Extract passenger list from booking cache
  const passengers = useMemo(() => {
    if (!bookingJson) return [];
    const passengerDetails = bookingJson.passengerDetails;
    if (!passengerDetails) return [];
    const all = [passengerDetails.passenger, ...(passengerDetails.companions || [])].filter(Boolean);
    return all.map((p: any, i: number) => ({
      key: `p-${i}`,
      firstName: p.firstname || '',
      lastName: p.lastname || '',
      discountType: p.discountType || 'Adult',
    }));
  }, [bookingJson]);

  // Build trip list from prepareBookingData in cache
  const trips = useMemo(() => {
    if (!bookingJson) return [];
    const list: Array<{ tripId: string; label: string; cabinId: number }> = [];
    const prepareData = bookingJson.prepareBookingData;

    const departure = prepareData?.departure;
    if (departure?.length && departureTripId) {
      const cabinId = departureCabinId ? Number(departureCabinId) : departure[0]?.ship?.cabins?.[0]?.id;
      if (cabinId) list.push({ tripId: departureTripId, label: 'Departure', cabinId });
    }

    if (returnTripId) {
      const ret = prepareData?.return;
      if (ret?.length) {
        const cabinId = returnCabinId ? Number(returnCabinId) : ret[0]?.ship?.cabins?.[0]?.id;
        if (cabinId) list.push({ tripId: returnTripId, label: 'Return', cabinId });
      }
    }

    return list;
  }, [bookingJson, departureTripId, returnTripId]);

  // Read cached seat assignments (from a previous visit to this page)
  const initialAssignments = useMemo<AssignmentsMap>(
    () => (mounted ? fetchItem<AssignmentsMap>('seat-assignments') || {} : {}),
    [mounted],
  );

  useEffect(() => {
    if (!mounted) return;
    if (trips.length === 0 || passengers.length === 0) {
      router.replace('/booking/destination');
    }
  }, [mounted, trips.length, passengers.length, router]);

  // Render nothing until mounted (avoids SSR/client mismatch)
  if (!mounted || !bookingJson || trips.length === 0 || passengers.length === 0) {
    return null;
  }

  const buildParams = () => {
    const params = new URLSearchParams();
    if (departureTripId) params.append('departureTripId', departureTripId);
    if (returnTripId) params.append('returnTripId', returnTripId);
    if (commodityId) params.append('commodityId', commodityId);
    return params.toString();
  };

  const handleConfirm = (assignments: AssignmentsMap, labels: SeatLabelsMap) => {
    cacheItem('seat-assignments', assignments, 900); // 15 min TTL (matches hold TTL)
    cacheItem('seat-assignment-labels', labels, 900);
    router.push(`/booking/payment-confirmation?${buildParams()}`);
  };

  const handleSkip = () => {
    // SeatPicker releases all held seats before calling this
    cacheItem('seat-assignments', {}, 900);
    router.push(`/booking/payment-confirmation?${buildParams()}`);
  };

  return (
    <SeatPicker
      trips={trips}
      passengers={passengers}
      initialAssignments={initialAssignments}
      onConfirm={handleConfirm}
      onSkip={handleSkip}
      onBack={() => router.back()}
    />
  );
}
