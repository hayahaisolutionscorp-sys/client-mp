import { IVehicleType } from "@/models";
import { VEHICLE_TYPES_API } from "constants/api";
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from "axios";

export async function getVehicleTypes(): Promise<IVehicleType[] | undefined> {
  const cached = fetchItem<IVehicleType[]>('vehicle-types');
  if (cached) return cached;

  try {
    const { data } = await axios.get(VEHICLE_TYPES_API);
    const vehicleTypes = data.data as IVehicleType[];
    cacheItem('vehicle-types', vehicleTypes);
    return vehicleTypes;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  try {
    const { data } = await axios.get(`${VEHICLE_TYPES_API}/${vehicleTypeId}`);
    return data.data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}