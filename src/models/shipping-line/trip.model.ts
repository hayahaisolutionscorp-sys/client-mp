import { TRIP_STATUS } from "constants/enum";
import { IPort } from "./port.model";
import { IShip } from "./ship.model";
import { IShippingLine } from "./shipping-line.model";
import { IVoyage } from "./voyage.model";
import { IRateTable } from "../pricing/rate-table.model";
import { ISeatType } from "../accommodation/seat-type.model";
import { ITripCabin } from "../accommodation/trip-cabin.model";


export interface ITrip {
  id: number | string;
  referenceNo: string;
  shipId: number;
  ship?: IShip;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  lightLogoUrl?: string; // New field for light logo
  srcPortId: number;
  srcPort?: IPort;
  srcPortName?: string;
  destPortId: number;
  destPort?: IPort;
  destPortName?: string;
  shipName?: string;
  voyage?: IVoyage;
  rateTableId: number;
  rateTable?: IRateTable;
  allowOnlineBooking: boolean;

  status: keyof typeof TRIP_STATUS;
  arrivalTimeDateIso: string,
  departureDateIso: string;
  seatSelection: boolean;
  availableVehicleCapacity: number;
  remainingVehicleCapacity?: Record<string, number>;
  vehicleCapacity: number;
  bookingStartDateIso: string;
  bookingCutOffDateIso: string;
  cancellationReason?: string;

  availableCabins: ITripCabin[];
  availableSeatTypes: ISeatType[];
  meals: string[];

  // New fields for connecting trips
  type: 'direct' | 'connecting';
  segments: ITripSegment[];
  totalDurationMinutes: number;
  totalLayoverMinutes: number;
  intermediatePorts: string[];
}

export interface ITripSegment {
  id: number | string;
  tripId: number | string; // Parent trip ID reference if needed, or just segment ID
  shipId: number;
  shipName?: string;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  srcPortId: number;
  srcPortName?: string;
  destPortId: number;
  destPortName?: string;
  departureDateIso: string;
  arrivalTimeDateIso: string;
  referenceNo: string;
  availableCabins: ITripCabin[];
  availableVehicleCapacity: number;
  remainingVehicleCapacity?: Record<string, number>;
  vehicleCapacity: number;
  bookingStartDateIso: string;
  bookingCutOffDateIso: string;
  seatSelection: boolean;
}
