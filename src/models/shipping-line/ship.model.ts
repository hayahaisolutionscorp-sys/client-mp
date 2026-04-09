import { ICabin } from "../accommodation/cabin.model";
import { IDryDock } from "./dry-dock.model";
import { IShippingLine } from "./shipping-line.model";
import { IVoyage } from "./voyage.model";


export interface IShip {
  id: number;
  name: string;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  recommendedVehicleCapacity: number;
  cargoRequired: boolean;
  cabins?: ICabin[];
  voyages?: IVoyage[];
  dryDocks?: IDryDock[];
  has_seatmap?: boolean;
}
