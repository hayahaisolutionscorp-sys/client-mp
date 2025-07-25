import { ISeatType } from "../accommodation/seat-type.model";

export interface IShippingLine {
  isChecked: boolean;
  id: number;
  name: string;
  logoFilename: string,
  seatTypes?: ISeatType[];
}
