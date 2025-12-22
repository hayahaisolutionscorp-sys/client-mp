import { IVehicleType } from "@/models";
import { VEHICLE_TYPES_API } from "constants/api";
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import vehicleTypesData from '@/data/vehicle-types.json';

export async function getVehicleTypes(): Promise<IVehicleType[] | undefined> {
  // const cached = fetchItem<IVehicleType[]>('vehicle-types');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(VEHICLE_TYPES_API);
  //   cacheItem('vehicle-types', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return vehicleTypesData as IVehicleType[];
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  // try {
  //   const { data } = await axios.get(`${VEHICLE_TYPES_API}/${vehicleTypeId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  const vehicleTypes = await getVehicleTypes();
  return vehicleTypes?.find((vehicleType) => vehicleType.id === vehicleTypeId);
}