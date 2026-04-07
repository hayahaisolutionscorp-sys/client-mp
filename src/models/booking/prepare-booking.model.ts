
export interface IPrepareBookingResponse {
    message: string;
    data: IPrepareBookingData;
}

export interface IPrepareBookingData {
    routePreference: IRoutePreference;
    departure: ITripSummary[];
    return: ITripSummary[];
}

export interface IRoutePreference {
    port_preference_id: number;
    port_id: number;
    preferences: {
        sex: IPreferenceItem;
        email: IPreferenceItem;
        address: IPreferenceItem;
        birthday: IPreferenceItem;
        last_name: IPreferenceItem;
        first_name: IPreferenceItem;
        occupation: IPreferenceItem;
        nationality: IPreferenceItem;
        civil_status: IPreferenceItem;
        mobile_number: IPreferenceItem;
        booking_closing_datetime: IPreferenceItem;
        day_before_booking_close: IPreferenceItem;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface IPreferenceItem {
    enabled: boolean;
    required: boolean;
    default_value: string;
}

export interface ITripSummary {
    id: string;
    scheduled_departure: string;
    scheduled_arrival: string;
    status: string;
    origin: string;
    destination: string;
    origin_municipality?: string;
    origin_province?: string;
    destination_municipality?: string;
    destination_province?: string;
    route_code: string;
    ship: {
        id: number;
        name: string;
        vehicle_capacities: IVehicleCapacity;
        cabins: ICabinSummary[];
    };
}

export interface IVehicleCapacity {
    remaining: Record<string, number>;
    max: Record<string, number>;
}

export interface ICabinSummary {
    id: number;
    name: string;
    capacity: number;
    remaining_capacity: number;
    cabin_type_id: number;
}
