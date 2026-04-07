import { IVehicleType } from "@/models";
import { VEHICLE_TYPES_API } from "constants/api";

export async function getVehicleTypes(shippingLineId?: string): Promise<IVehicleType[] | undefined> {
  try {
    const url = shippingLineId
      ? `${VEHICLE_TYPES_API}?shipping_line_id=${shippingLineId}`
      : VEHICLE_TYPES_API;
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Failed to fetch vehicle types: ${response.statusText}`);
    const json = await response.json();
    // Client API shape: { status, message, data: { data: [...] } }
    // Fallback shapes: { data: [...] } or { data: { results: [...] } }
    const outer = json.data;
    const raw = Array.isArray(outer) ? outer : (outer?.data ?? outer?.results ?? []);
    return raw as IVehicleType[];
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  try {
    const response = await fetch(`${VEHICLE_TYPES_API}/${vehicleTypeId}`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Failed to fetch vehicle type: ${response.statusText}`);
    const data = await response.json();
    return data.data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}