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
  vehicleCapacity: number;
  bookingStartDateIso: string;
  bookingCutOffDateIso: string;
  cancellationReason?: string;

  availableCabins: ITripCabin[];
  availableSeatTypes: ISeatType[];
  meals: string[];
}
