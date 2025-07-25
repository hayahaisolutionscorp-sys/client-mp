import { IVehicleType } from "@/models";
import { VEHICLE_TYPES_API } from "constants/api";

export async function getVehicleTypes(): Promise<IVehicleType[] | undefined> {
  try {
    const response = await fetch(VEHICLE_TYPES_API);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: IVehicleType[] = await response.json();
    return data;
    
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  const vehicleTypes = await getVehicleTypes();
  return vehicleTypes?.find((vehicleType) => vehicleType.id === vehicleTypeId);
}