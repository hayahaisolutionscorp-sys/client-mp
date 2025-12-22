import { IVehicleType } from "@/models";
import { VEHICLE_TYPES_API } from "constants/api";

import vehicleTypesData from '@/data/vehicle-types.json';

export async function getVehicleTypes(): Promise<IVehicleType[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return vehicleTypesData as IVehicleType[];
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  const vehicleTypes = await getVehicleTypes();
  return vehicleTypes?.find((vehicleType) => vehicleType.id === vehicleTypeId);
}