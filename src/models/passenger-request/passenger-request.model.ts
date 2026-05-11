export type RequestType = 'REFUND' | 'REBOOK' | 'UPGRADE_DOWNGRADE';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface IPassengerRequestPassenger {
  btpId: string;
  firstName?: string | null;
  lastName?: string | null;
  discountType?: string | null;
  totalPrice?: number | null;
  cabinId?: number | null;
  cabinName?: string | null;
  seatId?: string | null;
}

export interface IPassengerRequestItem {
  id: string;
  passengerRequestId: string;
  bookingTripPassengerId: string;
  fareDifference: number | null;
  newSeatId?: string | null;
  passenger?: IPassengerRequestPassenger | null;
}

export interface IPassengerRequestTrip {
  tripId: string;
  departureDate?: string | null;
  arrivalDate?: string | null;
  shipName?: string | null;
  routeName?: string | null;
  srcPortCode?: string | null;
  srcPortName?: string | null;
  destPortCode?: string | null;
  destPortName?: string | null;
}

export interface IPassengerRequestCabin {
  cabinId: number;
  cabinName?: string | null;
  cabinTypeName?: string | null;
}

export interface IPassengerRequest {
  id: string;
  bookingId: string;
  bookingReferenceNo?: string | null;
  requestType: RequestType;
  status: RequestStatus;
  faultType?: 'passenger_fault' | 'no_fault';
  newTripId?: string;
  newCabinId?: number;
  newSeatId?: string | null;
  rebookingFee?: number;
  refundMethod?: string;
  refundAccountName?: string;
  refundAccountNumber?: string;
  refundBankName?: string;
  preferredPaymentMethod?: string;
  passengerRemarks?: string;
  staffRemarks?: string;
  requestedById: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: IPassengerRequestItem[];
  currentTrip?: IPassengerRequestTrip | null;
  newTrip?: IPassengerRequestTrip | null;
  newCabin?: IPassengerRequestCabin | null;
}

export interface ICreatePassengerRequestPayload {
  booking_id: string;
  request_type: RequestType;
  passenger_items: { booking_trip_passenger_id: string; new_seat_id?: string | null }[];
  fault_type?: string;
  refund_method?: string;
  refund_account_name?: string;
  refund_account_number?: string;
  refund_bank_name?: string;
  new_trip_id?: string;
  new_cabin_id?: number;
  new_seat_id?: string | null;
  rebooking_fee?: number;
  preferred_payment_method?: string;
  fare_differences?: Record<string, number>;
  passenger_remarks?: string;
}
