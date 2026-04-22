export interface CalculatePricingRequest {
    routeCode: string;
    snapshotId?: string;
    tripIds: string[];
    passengers: {
        index: number;
        passengerType: string;
        tripAssignments: { tripId: string; cabinId?: number | null; discountType?: string }[];
    }[];
    cargos?: {
        index: number;
        cargoType: 'rolling' | 'loose';
        cargoClassCode?: string;
        quantity?: number;
        tripAssignments: { tripId: string }[];
    }[];
}

export interface PricingRequest {
    route: {
        [key: string]: string; // e.g., "POB-DMG": "Deluxe"
    };
    passenger: string[]; // e.g., ["ADULT", "PWD"]
    cargo?: {
        [key: string]: {
            commodityId: number;
            quantity: number;
            cbmRate: string;
            cargo_class: string;
        };
    };
    vehicle?: {
        [key: string]: {
            vehicleTypeId: number | string;
            plateNumber: string;
            driverId: number | string;
            cargo_class: string;
        };
    };
}

export interface PricingResponse {
    message: string;
    data: {
        trips: PricingTrip[];
        grandTotal: number;
    };
}

export interface PricingTrip {
    tripId: string;
    routeCode: string;
    passengerPrices: PassengerPrice[];
    cargoPrices: CargoPrice[];
    baseFare: {
        passengers: number;
        cargo: number;
        vehicle?: number;
        total: number;
    };
    charges: Charge[];
    chargesTotal: number;
    taxesTotal: number;
    subtotal: number;
    grandTotal: number;
}

export interface PassengerPrice {
    index: number;
    tripId: string;
    routeCode: string;
    passengerType: string;
    accommodationCode: string;
    baseFare: number;
    currency: string;
}

export interface CargoPrice {
    index: number;
    tripId: string;
    routeCode: string;
    cargoType: string;
    cargoClassCode: string;
    baseFare: number;
    currency: string;
    rateUnit: string;
}

export interface Charge {
    ruleId: string;
    chargeCode: string;
    chargeName: string;
    category: string;
    amount: number;
    isInclusive: boolean;
    calcType: string;
    basis: string;
    showOnReceipt: boolean;
}
