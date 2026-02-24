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
}
