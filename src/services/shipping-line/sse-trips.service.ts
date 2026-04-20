import { SearchAvailableTrips } from '@/types/trip/trip-management';
import { ITrip } from '@/models';
import { toPhilippinesTime } from 'helpers/date.helpers';

interface SSEMessageEvent {
    type: 'direct' | 'connecting' | 'done' | 'error';
    trips?: any[];
    message?: string;
    total_routes?: number;
    reason?: string;
}

function cleanCode(value: unknown): string {
    return String(value ?? '').trim();
}

function toFiniteNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function buildAdultRateMap(passengerRates: any[]): Map<string, number> {
    const ratesMap = new Map<string, number>();

    passengerRates.forEach((rate: any) => {
        const passengerTypeCode = cleanCode(rate.passenger_type_code);
        if (passengerTypeCode && passengerTypeCode !== 'ADULT') {
            return;
        }

        const accomCode = cleanCode(rate.accom_code);
        if (!accomCode) {
            return;
        }

        const amount = toFiniteNumber(rate.amount);
        if (amount === null) {
            return;
        }

        const current = ratesMap.get(accomCode);
        if (current === undefined || amount < current) {
            ratesMap.set(accomCode, amount);
        }
    });

    return ratesMap;
}

function getVehicleCapacityTotal(
    breakdown: Record<string, { remaining: number; max: number }> | null,
): number {
    if (!breakdown) return 0;
    const fourWheel = breakdown['4w'];
    if (fourWheel != null) return Math.max(0, fourWheel.remaining);
    const values = Object.values(breakdown);
    if (values.length === 0) return 0;
    return Math.max(0, Math.min(...values.map(v => v.remaining)));
}

/**
 * Connects to the API V2 trips SSE endpoint and collects all trips into a single array.
 */
export async function fetchTripsViaSSE(
    apiUrl: string,
    searchQuery: SearchAvailableTrips,
    page: number
): Promise<{ data: ITrip[]; total: number }> {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();

        // Map the new province/municipality fields
        if (searchQuery.origin_province) params.append('origin_province', searchQuery.origin_province);
        if (searchQuery.origin_municipality) params.append('origin_municipality', searchQuery.origin_municipality);
        if (searchQuery.destination_province) params.append('destination_province', searchQuery.destination_province);
        if (searchQuery.destination_municipality) params.append('destination_municipality', searchQuery.destination_municipality);

        // Fallbacks if only codes were provided (for some reason)
        if (!searchQuery.origin_province && searchQuery.origin_code?.includes('|')) {
            const [prov, muni] = searchQuery.origin_code.split('|');
            params.append('origin_province', prov);
            if (muni) params.append('origin_municipality', muni);
        }
        if (!searchQuery.destination_province && searchQuery.destination_code?.includes('|')) {
            const [prov, muni] = searchQuery.destination_code.split('|');
            params.append('destination_province', prov);
            if (muni) params.append('destination_municipality', muni);
        }

        if (searchQuery.passengerCount !== undefined) params.append('passenger_count', searchQuery.passengerCount.toString());
        if (searchQuery.departureDate) {
            const formattedDate = toPhilippinesTime(searchQuery.departureDate, 'YYYY-MM-DD');
            if (formattedDate) params.append('departure_date', formattedDate);
        }
        if (searchQuery.filterSpecificDate) {
            const formattedFilterDate = toPhilippinesTime(searchQuery.filterSpecificDate, 'YYYY-MM-DD');
            if (formattedFilterDate) params.append('filter_specific_date', formattedFilterDate);
        }
        if (searchQuery.sort) params.append('sort', searchQuery.sort);
        params.append('page', page.toString());

        const url = `${apiUrl}/trips?${params.toString()}`;
        const allTrips: any[] = [];
        const eventSource = new EventSource(url);

        const cleanup = () => {
            eventSource.close();
        };

        eventSource.onmessage = (event) => {
            try {
                const payload: SSEMessageEvent = JSON.parse(event.data);

                if (payload.type === 'error') {
                    console.warn('SSE Error from route:', payload.message);
                    // Don't reject the whole promise on a single route error, just log it
                    return;
                }

                if (payload.type === 'direct' || payload.type === 'connecting') {
                    let tripsToProcess = [];
                    if (payload.trips && Array.isArray(payload.trips)) {
                        tripsToProcess = payload.trips;
                    } else if (payload.trips && (payload.trips as any).data && Array.isArray((payload.trips as any).data)) {
                        tripsToProcess = (payload.trips as any).data;
                    }

                    // Enrich trips with tenant info from payload
                    const enrichedTrips = tripsToProcess.map((trip: any) => {
                        // For connecting trips, fallback to first leg info if payload-level info is missing
                        const firstLeg = trip.legs && trip.legs.length > 0 ? trip.legs[0] : null;
                        const firstLegLogo = firstLeg ? (firstLeg.logo || firstLeg.light_logo) : null;
                        const firstLegTenantId = firstLeg ? (firstLeg.tenant_id || firstLeg.shipping_line_id) : undefined;
                        const firstLegTenantName = firstLeg ? (firstLeg.tenant_name || firstLeg.shipping_line_name) : undefined;

                        return {
                            ...trip,
                            tenant_id: (payload as any).tenant_id || trip.tenant_id || firstLegTenantId,
                            tenant_name: (payload as any).tenant_name || trip.tenant_name || firstLegTenantName,
                            tenant_logo: (payload as any).logo || (payload as any).light_logo || trip.logo || trip.light_logo || firstLegLogo
                        };
                    });

                    allTrips.push(...enrichedTrips);
                }

                if (payload.type === 'done') {
                    cleanup();
                    resolve({
                        data: mapSSEToITrip(allTrips),
                        total: allTrips.length
                    });
                }
            } catch (err) {
                console.error('Failed to parse SSE message:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE connection error:', err);
            cleanup();
            // If we already have some trips, return them rather than failing completely
            if (allTrips.length > 0) {
                resolve({
                    data: mapSSEToITrip(allTrips),
                    total: allTrips.length
                });
            } else {
                reject(new Error('Failed to connect to trips SSE stream'));
            }
        };

        // Client-side fail-safe timeout (since API V2 has a 10s timeout, we add a buffer)
        setTimeout(() => {
            if (eventSource.readyState !== EventSource.CLOSED) {
                console.warn('SSE connection timed out from client side');
                cleanup();
                resolve({
                    data: mapSSEToITrip(allTrips),
                    total: allTrips.length
                });
            }
        }, 15000);
    });
}

function mapSSEToITrip(rawTrips: any[]): ITrip[] {
    return rawTrips.map((t: any) => {
        // Determine the segments
        const isConnecting = t.type === 'connecting';
        // Find the right list to map over
        let segmentsToMap = [];
        if (isConnecting && t.legs) {
            segmentsToMap = t.legs;
        } else if (t.segments && Array.isArray(t.segments)) {
            segmentsToMap = t.segments;
        } else {
            segmentsToMap = [t];
        }

        const mappedSegments = segmentsToMap.map((seg: any) => {
            // Direct trips and legs now often wrap their details in a nested 'segments' array
            const actualSegment = seg.segments && Array.isArray(seg.segments) && seg.segments.length > 0
                ? seg.segments[0]
                : seg;

            const segCabins = actualSegment.cabins || seg.cabins || [];
            const passengerRates = actualSegment.passenger_rates || seg.passenger_rates || [];
            const rateSnapshotId = actualSegment.rate_table_id || seg.rate_table_id || 0;

            const segRatesMap = Array.isArray(passengerRates)
                ? buildAdultRateMap(passengerRates)
                : new Map<string, number>();

            const availableCabins: any[] = segCabins
                .map((c: any) => {
                    const cabinCode = cleanCode(c.code);
                    if (!cabinCode) return null;

                    // Prefer fare from rate snapshot; fall back to what the API already embedded
                    const adultFare = segRatesMap.get(cabinCode) ?? c.adult_fare ?? c.adultFare;
                    if (adultFare == null) return null;

                    return {
                        tripId: isConnecting ? `connecting-${t.id}` : seg.id,
                        cabinId: c.id,
                        cabin: {
                            id: c.id,
                            shipId: c.ship_id || actualSegment.ship_id || seg.ship_id,
                            cabinTypeId: c.cabin_type_id,
                            name: c.name || cabinCode,
                            recommendedPassengerCapacity: c.max_passenger_capacity,
                            cabin_type_name: c.cabin_type_name,
                            cabin_type_description: c.cabin_type_description,
                            cabin_type_code: c.code,
                        },
                        cabinCode,
                        availablePassengerCapacity: c.remaining_capacity ?? c.max_passenger_capacity ?? 0,
                        passengerCapacity: c.max_passenger_capacity ?? 0,
                        adultFare,
                    };
                })
                .filter((c: any) => c !== null);

            const breakdown = seg.vehicle_capacity_breakdown ?? actualSegment.vehicle_capacity_breakdown ?? null;
            const totalVehicleCapacity = getVehicleCapacityTotal(breakdown);

            return {
                id: seg.id || actualSegment.id,
                tripId: t.id,
                shipId: actualSegment.ship_id || seg.ship_id,
                shipName: actualSegment.ship_name || seg.ship_name || seg.ship?.name,
                shippingLineId: actualSegment.shipping_line_id || seg.shipping_line_id || (seg.tenant_id ? parseInt(seg.tenant_id, 10) : 0),
                shippingLine: actualSegment.shipping_line || seg.shipping_line || (seg.tenant_id || seg.logo ? {
                    id: seg.tenant_id ? parseInt(seg.tenant_id, 10) : 0,
                    name: seg.tenant_name || seg.shipping_line_name || 'Shipping Line',
                    logoFilename: seg.logo || seg.light_logo || seg.whitelabel_logo?.light || seg.whitelabel_logo?.dark || '',
                    isChecked: false
                } : undefined),
                srcPortId: 0,
                srcPortName: actualSegment.source_port_name || seg.source_port_name || seg.origin_name,
                destPortId: 0,
                destPortName: actualSegment.destination_port_name || seg.destination_port_name || seg.destination_name,
                departureDateIso: actualSegment.scheduled_departure || seg.scheduled_departure || seg.total_departure_time,
                arrivalTimeDateIso: actualSegment.scheduled_arrival || seg.scheduled_arrival || seg.total_arrival_time,
                referenceNo: actualSegment.reference_number || seg.reference_number || seg.referenceNo,
                availableCabins: availableCabins,
                availableVehicleCapacity: totalVehicleCapacity,
                remainingVehicleCapacity: breakdown,
                vehicleCapacity: totalVehicleCapacity,
                bookingStartDateIso: actualSegment.booking_start_date || seg.booking_start_date,
                bookingCutOffDateIso: actualSegment.booking_cut_off_date || seg.booking_cut_off_date,
                seatSelection: actualSegment.is_seat_can_be_selected || seg.is_seat_can_be_selected || false,
                rateTableId: rateSnapshotId,
                status: actualSegment.status || seg.status || 'pending'
            };
        });

        const firstSegment = mappedSegments[0] || {};
        const totalTripVehicleCapacity = mappedSegments.length > 0
            ? Math.min(...mappedSegments.map((s: any) => s.availableVehicleCapacity))
            : 0;

        return {
            id: t.id,
            referenceNo: firstSegment.referenceNo || t.referenceNo || '',
            shipId: firstSegment.shipId || 0,
            shipName: firstSegment.shipName,
            shippingLineId: firstSegment.shippingLineId || (t.tenant_id ? parseInt(t.tenant_id, 10) : 0),
            shippingLine: firstSegment.shippingLine || (t.tenant_id ? {
                id: parseInt(t.tenant_id, 10),
                name: t.tenant_name || 'Unknown Shipping Line',
                logoFilename: t.tenant_logo || '',
                isChecked: false
            } : undefined),
            srcPortId: 0,
            srcPortName: t.origin_name || firstSegment.srcPortName,
            destPortId: 0,
            destPortName: t.destination_name || firstSegment.destPortName,
            lightLogoUrl: t.logo || t.light_logo || t.tenant_logo,
            departureDateIso: t.total_departure_time || firstSegment.departureDateIso,
            arrivalTimeDateIso: t.total_arrival_time || firstSegment.arrivalTimeDateIso,
            status: t.status || firstSegment.status || 'pending',
            rateTableId: firstSegment.rateTableId || 0,
            allowOnlineBooking: true,
            seatSelection: firstSegment.seatSelection || false,
            availableVehicleCapacity: totalTripVehicleCapacity,
            remainingVehicleCapacity: firstSegment.remainingVehicleCapacity || {},
            vehicleCapacity: totalTripVehicleCapacity,
            bookingStartDateIso: firstSegment.bookingStartDateIso || '',
            bookingCutOffDateIso: firstSegment.bookingCutOffDateIso || '',
            availableCabins: firstSegment.availableCabins || [],
            availableSeatTypes: [],
            meals: [],

            type: t.type || (isConnecting ? 'connecting' : 'direct'),
            segments: mappedSegments,
            totalDurationMinutes: t.total_duration_minutes,
            totalLayoverMinutes: t.total_layover_minutes,
            intermediatePorts: t.intermediate_ports
        } as ITrip;
    });
}
