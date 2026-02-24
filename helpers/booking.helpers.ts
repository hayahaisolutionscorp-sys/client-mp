import {
  Passenger, GeneratePassengersProps,
  Vehicle, GenerateVehiclesProps,
  BookingTrip, GenerateBookingTripProps,
  Booking, GenerateBookingProps
} from "@/types/booking/booking-create"
import { DEFAULT_CREATE_BOOKING_PAYMENT_GATEWAY, DEFAULT_CREATE_BOOKING_TYPE } from "constants/default";

export const generateBookingTripPassengers = ({
  passengerDetails,
  vehicleDetails,
  tripId,
  cabinName
}: GeneratePassengersProps): Passenger[] => {
  return [
    passengerDetails?.passenger, // Add primary passenger
    ...(passengerDetails?.companions || []) // Add companions safely
  ].map((data) => {
    const driverVehicleId =
      vehicleDetails?.find(
        (vehicle) =>
          vehicle.driverName === `${data?.firstname} ${data?.lastname}` &&
          vehicle.driverId === data?.id
      )?.id || ""; // Get the driverId, checking both name and ID

    const passengerData: Passenger = {
      tripId: tripId,
      passengerId: data?.id || 0,
      preferredCabinName: cabinName,
      discountType: data?.discountType || undefined,
      passenger: {
        id: data?.id || 0,
        nationality: data?.nationality || "",
        firstName: data?.firstname || "",
        lastName: data?.lastname || "",
        sex: data?.sex || "",
        birthdayIso: data?.dob ? new Date(data?.dob).toISOString() : "",
        address: data?.address || ""
      }
    };

    if (driverVehicleId) {
      passengerData.drivesVehicleId = driverVehicleId; // Only include if driverId exists
    }

    return passengerData;
  });
};

export const generateBookingTripVehicles = ({
  vehicleDetails = [],
  tripId
}: GenerateVehiclesProps): Vehicle[] => {
  return vehicleDetails.map((data) => {
    const vehicleData: Vehicle = {
      tripId: tripId,
      vehicleId: data.id,
      vehicle: {
        id: data.id,
        plateNo: data.plateNumber,
        modelName: data.modelName,
        vehicleTypeId: data.vehicleTypeId,
        certificateOfRegistrationUrl: "",
        officialReceiptUrl: "",
        modelYear: 0,
        vehicleType: {
          id: data.vehicleTypeId,
          name: data.modelBody,
          description: data.vehicleTypeDescription
        }
      }
    };

    return vehicleData;
  });
};

export const generateBookingTrips = ({
  passengerDetails,
  vehicleDetails,
  tripId,
  cabinName
}: GenerateBookingTripProps): BookingTrip[] => {
  const bookingTripPassengers = generateBookingTripPassengers({
    passengerDetails,
    vehicleDetails,
    tripId,
    cabinName
  });

  const bookingTripVehicles = generateBookingTripVehicles({
    vehicleDetails,
    tripId
  });

  const passengerId = passengerDetails?.passenger ? passengerDetails.passenger.id : 0;

  const bookingTripData: BookingTrip = {
    tripId: tripId,
    passengerId: passengerId,
    bookingTripPassengers: bookingTripPassengers,
    bookingTripVehicles: bookingTripVehicles
  };

  return [bookingTripData];
};

export const generateBooking = ({
  passengerDetails,
  contactDetails,
  vehicleDepartureDetails,
  vehicleReturnDetails,
  departureTripId,
  returnTripId,
  departureCabinName,
  returnCabinName,
}: GenerateBookingProps): Booking => {
  const bookingTrips: BookingTrip[] = [
    ...generateBookingTrips({
      passengerDetails: passengerDetails,
      vehicleDetails: vehicleDepartureDetails,
      tripId: departureTripId,
      cabinName: departureCabinName,
    }).filter(trip => trip.tripId), // Filter out trips with invalid tripId
    ...generateBookingTrips({
      passengerDetails: passengerDetails,
      vehicleDetails: vehicleReturnDetails,
      tripId: returnTripId,
      cabinName: returnCabinName,
    }).filter(trip => trip.tripId), // Filter out trips with invalid tripId
  ];

  const bookingData: Booking = {
    bookingTrips: bookingTrips,
    paymentGateway: DEFAULT_CREATE_BOOKING_PAYMENT_GATEWAY,
    bookingType: DEFAULT_CREATE_BOOKING_TYPE,
    contactEmail: contactDetails?.email || "",
    contactMobile: `${contactDetails?.countryCode || ""}${contactDetails?.mobileNumber || ""}`.trim(),
    consigneeName: `${contactDetails?.firstname || ""} ${contactDetails?.lastname || ""}`.trim()
  };

  return bookingData;
};

