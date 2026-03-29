import { IPrepareBookingData } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';
import { PassengerData } from '@/types/booking/passenger-data';
import { ContactData } from '@/types/booking/contact-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { CargoData } from '@/types/booking/cargo-data';

export interface LegFormData {
  shippingLineId: string;
  tenantName?: string;
  tripId: string;
  bookingState: any;
  pricingData: PricingResponse['data'] | null;
  prepareBookingData: IPrepareBookingData;
}

export interface CrossTenantBookingCache {
  isCrossTenant: true;
  passengerDetails: { passenger: PassengerData; companions: PassengerData[] };
  contactDetails: ContactData;
  vehicleDepartureDetails: VehicleData[];
  cargoDetails: CargoData[];
  legForms: LegFormData[];
}
