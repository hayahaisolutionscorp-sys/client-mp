import { IShippingLine } from "../shipping-line/shipping-line.model";
import { IRateTableMarkup } from "./rate-table-markup.model";
import { IRateTableRow } from "./rate-table-row.model";

export interface IRateTable {
  id: number;
  shippingLineId: number;
  shippingLine?: IShippingLine;

  name: string;

  rows: IRateTableRow[];
  markups: IRateTableMarkup[];
}
