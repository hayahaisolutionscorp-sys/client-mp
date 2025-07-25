import { IClient } from "../user-management/client.model";
import { ITravelAgency } from "../user-management/travel-agency.model";
import { IRateTable } from "./rate-table.model";

export interface IRateTableMarkup {
  id: number;
  rateTableId: number;
  rateTable?: IRateTable;
  // if not null, this markup is for the specified travel agency
  travelAgencyId?: number;
  travelAgency?: ITravelAgency;
  // if not null, this markup is for the specified client
  clientId?: number;
  client?: IClient;

  markupFlat: number;
  markupPercent: number;
  markupMaxFlat: number;
}
