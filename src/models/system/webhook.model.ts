import { WEBHOOK_TYPE } from 'constants/enum';
import { IShippingLine } from '../shipping-line/shipping-line.model';
import { ITravelAgency } from '../user-management/travel-agency.model';

export interface IWebhook {
  id: number;
  shippingLineId?: number;
  shippingLine?: IShippingLine;
  travelAgencyId?: number;
  travelAgency?: ITravelAgency;

  type: keyof typeof WEBHOOK_TYPE;
  url: string;
}
