export interface VehicleData {
    id: number;
    vehicleTypeId: number;
    vehicleTypeDescription: string;
    modelName: string;
    plateNumber: string;
    modelBody: string;
    driverName: string;
    driverId: number;
    cargo_class?: string;
    // Leg 2 overrides for cross-tenant connecting trips
    leg2ModelBody?: string;
    leg2VehicleTypeId?: number;
    leg2VehicleTypeDescription?: string;
    leg2CargoClass?: string;
}
