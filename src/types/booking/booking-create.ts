import { PassengerData } from "./passenger-data";
import { VehicleData } from "./vehicle-data";
import { ContactData } from "./contact-data";

export interface Passenger {
  tripId: number;
  passengerId: number;
  discountType?: string | null;
  passenger: {
    id: number;
    nationality: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    suffixName?: string;
    sex: string;
    birthdayIso: string;
    address: string;
  };
  preferredCabinId?: number; // Optional field
  drivesVehicleId?: number; // Optional field
}
  
export interface GeneratePassengersProps {
  passengerDetails?: {
    passenger: PassengerData;
    companions?: PassengerData[];
  };
  vehicleDetails?: VehicleData[];
  tripId: number;
  cabinId: number;
}

export interface Vehicle {
  tripId: number;
  vehicleId: number;
  vehicle: {
    id: number;
    plateNo: string;
    modelName: string;
    vehicleTypeId: number;
    certificateOfRegistrationUrl: string;
    officialReceiptUrl: string;
    modelYear: number;
    vehicleType: {
      id: number;
      name: string;
      description: string;
    };
  };
}

export interface GenerateVehiclesProps {
  vehicleDetails?: VehicleData[];
  tripId: number;
}

export interface BookingTrip {
    tripId: number;
    passengerId: number;
    bookingTripPassengers: Passenger[];
    bookingTripVehicles: Vehicle[];
}

export interface GenerateBookingTripProps {
  passengerDetails?: {
    passenger: PassengerData;
    companions?: PassengerData[];
  };
  vehicleDetails?: VehicleData[];
  tripId: number;
  cabinId: number;
}

export interface Booking {
    bookingTrips: BookingTrip[];
    paymentGateway: string;
    bookingType: string;
    contactEmail: string;
    contactMobile: string;
    consigneeName: string;
}

export interface GenerateBookingProps {
    passengerDetails?: {
      passenger: PassengerData;
      companions?: PassengerData[];
    };
    contactDetails?: ContactData
    vehicleDepartureDetails?: VehicleData[];
    vehicleReturnDetails?: VehicleData[];
    departureTripId: number;
    returnTripId: number;
    departureCabinId: number;
    returnCabinId: number;
  }
