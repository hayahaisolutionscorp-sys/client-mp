import { ITrip } from "../shipping-line/trip.model";

export interface INotification {
  id: number;
  tripId?: number;
  trip?: ITrip;

  subject: string;
  body: string;
  dateCreatedIso: string;
}
