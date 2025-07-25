import { IRateTable } from "../pricing/rate-table.model";
import { IPort } from "./port.model";
import { IShip } from "./ship.model";
import { IShippingLine } from "./shipping-line.model";


export interface IShippingLineSchedule {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  shipId: number;
  ship?: IShip;
  rateTableId: number;
  rateTable?: IRateTable;

  name: string;
  departureHour: number;
  departureMinute: number;
  daysBeforeBookingStart: number;
  daysBeforeBookingCutOff: number;
}
