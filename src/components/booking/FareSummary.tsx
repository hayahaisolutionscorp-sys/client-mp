'use client';

import { useState, useEffect, type FC, useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { PaymentCalculationHelper } from 'helpers/payment-calculation.helpers';
import { generateBooking } from 'helpers/booking.helpers';
import { cacheItem } from 'helpers/cache.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { formatCurrency } from 'helpers/general.helpers';
import { Dialog, DialogContent, DialogActions, DialogTitle } from '@/components/ui/Dialog';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { ContactData } from '@/types/booking/contact-data';
import { PaymentInitiationRequest, PaymentInitiationResponse } from '@/types/payment/payment';
import { ITrip, IBooking, IRateTableRow } from '@/models';
import { startPaymentForBooking, getRateTableRowsByRateTableId } from '@/services';

interface PassengerDetails {
  passenger: PassengerData;
  companions: PassengerData[];
}

interface FareSummaryProps {
  trips?: ITrip[];
  passengerDetails?: PassengerDetails | undefined;
  vehicleDepartureDetails?: VehicleData[] | undefined;
  vehicleReturnDetails?: VehicleData[] | undefined;
  contactDetails?: ContactData | undefined;
  departureRateTableId?: number;
  returnRateTableId?: number;
  booking?: IBooking | undefined;
  discountVoucher?: string;
}

const FareSummary: FC<FareSummaryProps> = ({
  trips = undefined,
  passengerDetails = undefined,
  contactDetails = undefined,
  vehicleDepartureDetails = undefined,
  vehicleReturnDetails = undefined,
  departureRateTableId = 0,
  returnRateTableId = 0,
  booking = undefined,
  discountVoucher = undefined
}) => {
  const paymentHelper = useMemo(() => new PaymentCalculationHelper(), []);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const departureCabinId = Number(searchParams.get('departureCabinId')) || booking?.bookingTrips?.[0]?.tripId || 0;
  const returnCabinId = Number(searchParams.get('returnCabinId')) || booking?.bookingTrips?.[1]?.tripId || 0;
  const driverFare = 0;

  const allPassengers = useMemo(() => {
    return [passengerDetails?.passenger, ...(passengerDetails?.companions ?? [])];
  }, [passengerDetails]);

  const driverIds = useMemo(() => {
    // Get unique driver IDs, filtering out any duplicates
    return Array.from(new Set(vehicleDepartureDetails?.map((vehicle) => vehicle.driverId) || [])).filter(Boolean); // Remove any undefined/null values
  }, [vehicleDepartureDetails]);

  const [passengerDepartureData, setPassengerDepartureData] = useState<
    { name: string; discountType: string | null; fare: number }[]
  >([]);

  const [passengerReturnData, setPassengerReturnData] = useState<
    { name: string; discountType: string | null; fare: number }[]
  >([]);

  const [passengerDepartureTotalFare, setPassengerDepartureTotalFare] = useState<number | 0>(0);
  const [passengerDepartureServiceCharge, setPassengerDepartureServiceCharge] = useState<number | 0>(0);

  const [passengerReturnTotalFare, setPassengerReturnTotalFare] = useState<number | 0>(0);
  const [passengerReturnServiceCharge, setPassengerReturnServiceCharge] = useState<number | 0>(0);

  const [departureSubTotal, setDepatureSubTotal] = useState<number | 0>(0);
  const [returnSubTotal, setReturnSubTotal] = useState<number | 0>(0);
  const [totalAmount, setTotalAmount] = useState<number | 0>(0);
  const [driverServiceCharge, setDriverServiceCharge] = useState<number | 0>(0);

  const [vehicleDepartureRateTableRows, setVehicleDepartureRateTableRows] = useState<IRateTableRow[] | undefined>(
    undefined
  );
  const [vehicleReturnRateTableRows, setVehicleReturnRateTableRows] = useState<IRateTableRow[] | undefined>(undefined);

  const [vehicleDepartureTotalFare, setVehicleDepartureTotalFare] = useState<number | 0>(0);
  const [vehicleDepartureServiceCharge, setVehicleDepartureServiceCharge] = useState<number | 0>(0);

  const [vehicleReturnTotalFare, setVehicleReturnTotalFare] = useState<number | 0>(0);
  const [vehicleReturnServiceCharge, setVehicleReturnServiceCharge] = useState<number | 0>(0);

  // Expand/Collapse States
  const [isAdultDepartureFareExpanded, setIsAdultDepartureFareExpanded] = useState(false);
  const [isVehicleDepartureFareExpanded, setIsVehicleDepartureFareExpanded] = useState(false);

  const [isAdultReturnFareExpanded, setIsAdultReturnFareExpanded] = useState(false);
  const [isVehicleReturnFareExpanded, setIsVehicleReturnFareExpanded] = useState(false);

  const [vehicleDeparturePrices, setVehicleDeparturePrices] = useState<
    { name: string; priceWithoutMarkup: number; totalPrice: number }[]
  >([]);
  const [vehicleReturnPrices, setVehicleReturnPrices] = useState<
    { name: string; priceWithoutMarkup: number; totalPrice: number }[]
  >([]);

  const [marketingConsent, setMarketingConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [payBooking, setPayBooking] = useState<PaymentInitiationResponse | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMessge, setShowMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    const isValid = !!(
      passengerDetails?.passenger?.firstname &&
      passengerDetails?.passenger?.lastname &&
      passengerDetails?.passenger?.sex &&
      passengerDetails?.passenger?.dob &&
      passengerDetails?.passenger?.nationality &&
      passengerDetails?.passenger?.address &&
      contactDetails?.firstname &&
      contactDetails?.lastname &&
      contactDetails?.email &&
      contactDetails?.mobileNumber
    );

    setIsFormValid(isValid);
  }, [passengerDetails, contactDetails]);

  interface DataObject {
    [key: string]: string | number | null | undefined;
  }

  const hasEmptyField = (data: DataObject | DataObject[] | undefined, notRequiredFields: string[] = []): boolean => {
    if (!data) return true; // Consider undefined or null as "empty."

    // If the data is an array, process each object in the array
    if (Array.isArray(data)) {
      return data.some((obj) =>
        Object.entries(obj).some(
          ([key, value]) => !notRequiredFields.includes(key) && (value === '' || value === null || value === undefined)
        )
      );
    }

    // If the data is a single object, check its values
    return Object.entries(data).some(
      ([key, value]) => !notRequiredFields.includes(key) && (value === '' || value === null || value === undefined)
    );
  };

  const handleProceedToPayment = () => {
    const departureTripId = trips ? trips[0]?.id || 0 : 0;
    const returnTripId = trips ? trips[1]?.id || 0 : 0;

    // Clear error if validation passes
    setError(null);

    // Generate booking if validation passes
    const booking = generateBooking({
      passengerDetails,
      contactDetails,
      vehicleDepartureDetails,
      vehicleReturnDetails,
      departureTripId,
      returnTripId,
      departureCabinId,
      returnCabinId
    });

    const notRequiredFields = ['accommodation', 'discountType'];

    const allPassengers: PassengerData[] = passengerDetails
      ? [passengerDetails.passenger, ...passengerDetails.companions]
      : [];

    const allVehicles: VehicleData[] = [...(vehicleDepartureDetails ?? []), ...(vehicleReturnDetails ?? [])];

    const allContactDetails: ContactData | undefined = contactDetails;

    if (
      hasEmptyField(allPassengers as unknown as DataObject[], notRequiredFields) ||
      hasEmptyField(allVehicles as unknown as DataObject[]) ||
      hasEmptyField(allContactDetails as unknown as DataObject[])
    ) {
      setError('All fields are required.');
      return;
    } else {
      setError(null);
    }

    // Validate email format
    const email = contactDetails?.email || '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Simple email regex
    if (!emailRegex.test(email)) {
      setError('The email address is invalid.');
      return;
    }
    cacheItem('booking-json', booking, 60);

    // Construct query parameters dynamically
    const queryParams = new URLSearchParams();
    if (departureTripId) queryParams.append('departureTripId', departureTripId.toString());
    if (returnTripId) queryParams.append('returnTripId', returnTripId.toString());

    const queryString = queryParams.toString();
    const destination = queryString ? `/booking/payment-confirmation?${queryString}` : `/booking/payment-confirmation`;

    // Navigate to the constructed URL
    router.push(destination);
  };

  const handlePayment = async (): Promise<void> => {
    setIsProcessing(true); // Show loading spinner and disable button

    const tentativeBookingId = Number(booking?.id || 0);
    const body: PaymentInitiationRequest = {
      paymentGateway: 'PayMongo'
    };

    try {
      const payBooking = await startPaymentForBooking(tentativeBookingId, body);

      if (payBooking) {
        setPayBooking(payBooking);

        if (payBooking.redirectUrl) {
          window.open(payBooking.redirectUrl);
          setShowMessage(true);
        } else {
          setShowMessage(false);
        }
      } else {
        setShowMessage(false);
        console.error('Payment initiation failed.');
      }
    } catch (error) {
      setShowMessage(false);
      console.error('Payment initiation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClick = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    handlePayment();
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  // Calculate departure passenger's fare + ayahay service charge
  useEffect(() => {
    if (!passengerDetails || !departureRateTableId) return;

    const processDepartureData = async () => {
      const data = await getRateTableRowsByRateTableId(departureRateTableId);
      const rows = Array.isArray(data) ? data : [data];
      const passengerRows = rows.filter((row) => !row.vehicleTypeId);

      const driverIdSet = new Set(driverIds);

      const calculatedPassengerData = allPassengers
        .filter((passenger) => {
          return passenger?.id !== undefined && !driverIdSet.has(passenger.id);
        })
        .map((passenger) => {
          const matchingRow = passengerRows.find(
            (row) =>
              row.cabinId === departureCabinId &&
              (row.discountType === passenger?.discountType || (!row.discountType && !passenger?.discountType))
          );

          return {
            name: `${passenger?.firstname} ${passenger?.lastname}`,
            discountType: passenger?.discountType || 'Regular Fare',
            fare: matchingRow?.fare || 0
          };
        });

      setPassengerDepartureData(calculatedPassengerData);

      const totalFare = calculatedPassengerData.reduce((sum, passenger) => sum + passenger.fare, 0);
      setPassengerDepartureTotalFare(totalFare);

      const totalServiceCharge = calculatedPassengerData.reduce(
        (sum, passenger) => sum + paymentHelper.calculateAyahayMarkupForPassenger(passenger.fare),
        0
      );
      setPassengerDepartureServiceCharge(totalServiceCharge);
    };

    processDepartureData();
  }, [passengerDetails, departureRateTableId, departureCabinId, allPassengers, driverIds, paymentHelper]);

  // Calculate return passenger's fare + ayahay service charge
  useEffect(() => {
    if (!passengerDetails || !returnRateTableId) return;

    const processReturnData = async () => {
      const data = await getRateTableRowsByRateTableId(returnRateTableId);
      const rows = Array.isArray(data) ? data : [data];
      const passengerRows = rows.filter((row) => !row.vehicleTypeId);

      // Create a Set of driver IDs for O(1) lookup
      const driverIdSet = new Set(driverIds);

      const calculatedPassengerReturnData = allPassengers
        .filter((passenger) => {
          // Only include passengers that are not drivers (using Set for efficient lookup)
          return passenger?.id !== undefined && !driverIdSet.has(passenger.id);
        })
        .map((passenger) => {
          const matchingRow = passengerRows.find(
            (row) =>
              row.cabinId === returnCabinId &&
              (row.discountType === passenger?.discountType || (!row.discountType && !passenger?.discountType))
          );

          return {
            name: `${passenger?.firstname} ${passenger?.lastname}`,
            discountType: passenger?.discountType || 'Regular Fare',
            fare: matchingRow?.fare || 0
          };
        });

      setPassengerReturnData(calculatedPassengerReturnData);

      const totalFare = calculatedPassengerReturnData.reduce((sum, passenger) => sum + passenger.fare, 0);
      setPassengerReturnTotalFare(totalFare);

      const totalServiceCharge = calculatedPassengerReturnData.reduce(
        (sum, passenger) => sum + paymentHelper.calculateAyahayMarkupForPassenger(passenger.fare),
        0
      );
      setPassengerReturnServiceCharge(totalServiceCharge);
    };

    processReturnData();
  }, [passengerDetails, returnRateTableId, returnCabinId, allPassengers, driverIds, paymentHelper]);

  // Get the departure vehicle fares
  useEffect(() => {
    if (vehicleDepartureDetails) {
      getRateTableRowsByRateTableId(departureRateTableId).then((data) => {
        const rows = Array.isArray(data) ? data : [data];
        const vehicleTypeIds = vehicleDepartureDetails.map((vehicle) => vehicle.vehicleTypeId);

        const updatedRows = vehicleTypeIds
          .map((vehicleTypeId) => rows.find((row) => row?.vehicleTypeId === vehicleTypeId))
          .filter(Boolean); // Remove undefined values

        setVehicleDepartureRateTableRows(updatedRows);
      });
    }
  }, [vehicleDepartureDetails, departureRateTableId]);

  // Get the return vehicle fares
  useEffect(() => {
    if (vehicleDepartureDetails) {
      getRateTableRowsByRateTableId(returnRateTableId).then((data) => {
        const rows = Array.isArray(data) ? data : [data];
        const vehicleTypeIds = vehicleDepartureDetails.map((vehicle) => vehicle.vehicleTypeId);

        const updatedRows = vehicleTypeIds
          .map((vehicleTypeId) => rows.find((row) => row?.vehicleTypeId === vehicleTypeId))
          .filter(Boolean); // Remove undefined values

        setVehicleReturnRateTableRows(updatedRows);
      });
    }
  }, [vehicleDepartureDetails, returnRateTableId]);

  // Calculate departure vehicle's fare + ayahay service charge
  useEffect(() => {
    if (Number(vehicleDepartureDetails?.length || 0) === 0) {
      setVehicleDepartureTotalFare(0);
      setVehicleDepartureServiceCharge(0);
      return;
    }

    if (Number(vehicleDepartureRateTableRows?.length || 0) > 0) {
      const totalVehiclesFare = vehicleDepartureRateTableRows?.reduce((acc, row) => {
        return acc + (row.fare || 0);
      }, 0);
      setVehicleDepartureTotalFare(totalVehiclesFare || 0);

      let totalServiceCharge = 0;
      vehicleDepartureRateTableRows?.forEach((row) => {
        // Calculate service charge
        const serviceCharge = paymentHelper.calculateAyahayMarkupForVehicle(row.fare || 0);

        // Add to total service charge
        totalServiceCharge += serviceCharge;
      });
      setVehicleDepartureServiceCharge(totalServiceCharge);

      const totalDriverServiceCharge = driverIds.reduce(
        (sum) => sum + paymentHelper.calculateAyahayMarkupForPassenger(driverFare),
        0
      );
      setDriverServiceCharge(totalDriverServiceCharge);
    }
  }, [vehicleDepartureDetails, vehicleDepartureRateTableRows, driverIds, paymentHelper]);

  // Calculate return vehicle's fare + ayahay service charge
  useEffect(() => {
    if (Number(vehicleDepartureDetails?.length || 0) === 0) {
      setVehicleReturnTotalFare(0);
      setVehicleReturnServiceCharge(0);
      return;
    }

    if (Number(vehicleReturnRateTableRows?.length || 0) > 0) {
      const totalVehiclesFare = vehicleReturnRateTableRows?.reduce((acc, row) => {
        return acc + (row.fare || 0);
      }, 0);
      setVehicleReturnTotalFare(totalVehiclesFare || 0);

      let totalServiceCharge = 0;
      vehicleReturnRateTableRows?.forEach((row) => {
        // Calculate service charge
        const serviceCharge = paymentHelper.calculateAyahayMarkupForVehicle(row.fare || 0);

        // Add to total service charge
        totalServiceCharge += serviceCharge;
      });
      setVehicleReturnServiceCharge(totalServiceCharge);

      const totalDriverServiceCharge = driverIds.reduce(
        (sum) => sum + paymentHelper.calculateAyahayMarkupForPassenger(driverFare),
        0
      );
      setDriverServiceCharge(totalDriverServiceCharge);
    }
  }, [vehicleDepartureDetails, vehicleReturnRateTableRows, driverIds, paymentHelper]);

  // ========================================= PROCESS AFTER CREATING A BOOKING =========================================

  // Process Departure Passenger Data After Booking
  const processDepaturePassengerData = useCallback(() => {
    if (!booking?.bookingTrips?.[0]?.bookingTripPassengers) {
      setPassengerDepartureData([]);
      setPassengerDepartureTotalFare(0);
      setPassengerDepartureServiceCharge(0);
      return;
    }

    // Get all passengers except drivers
    const passengers = booking.bookingTrips[0].bookingTripPassengers.filter(
      (passenger) => passenger.discountType?.toLowerCase() !== 'driver'
    );

    // Process each passenger's data
    const passengerData = passengers.map((passenger) => {
      // Get fare payment items
      const fareItems = passenger.bookingPaymentItems?.filter((item) => item.type?.toLowerCase() === 'fare') || [];

      // Calculate total fare for this passenger
      const passengerFare = fareItems[0]?.price ?? 0;

      return {
        name: `${passenger.passenger?.firstName ?? ''} ${passenger.passenger?.lastName ?? ''}`.trim(),
        discountType: passenger.discountType || 'Regular Fare',
        fare: passengerFare
      };
    });

    // Update state with processed data
    setPassengerDepartureData(passengerData);

    // Calculate totals
    const totalFare = passengerData.reduce((sum, passenger) => sum + passenger.fare, 0);
    setPassengerDepartureTotalFare(totalFare);

    // Calculate service charges
    const totalServiceCharge = passengerData.reduce(
      (sum, passenger) => sum + paymentHelper.calculateAyahayMarkupForPassenger(passenger.fare),
      0
    );

    setPassengerDepartureServiceCharge(totalServiceCharge);

    // Get all drivers
    const drivers = booking.bookingTrips[0].bookingTripPassengers.filter(
      (passenger) => passenger.discountType?.toLowerCase() === 'driver'
    );

    // Process each driver's data
    const driverAyahayMarkUps = drivers.map((driver) => {
      // Get ayahay markup payment items
      const ayahayMarkupItems =
        driver.bookingPaymentItems?.filter((item) => item.type?.toLowerCase() === 'ayahaymarkup') || [];

      // Calculate ayahay markup for this driver
      const driverAyahayMarkup = ayahayMarkupItems[0]?.price ?? 0;

      return {
        fare: driverAyahayMarkup
      };
    });

    // Calculate total ayahay markups
    const totalDriverAyahayMarkups = driverAyahayMarkUps.reduce((sum, driver) => sum + driver.fare, 0);
    setDriverServiceCharge(totalDriverAyahayMarkups);
  }, [booking, paymentHelper]);

  // Process Return Passenger Data After Booking
  const processReturnPassengerData = useCallback(() => {
    if (!booking?.bookingTrips?.[1]?.bookingTripPassengers) {
      setPassengerReturnData([]);
      setPassengerReturnTotalFare(0);
      setPassengerReturnServiceCharge(0);
      return;
    }

    // Get all passengers except drivers
    const passengers = booking.bookingTrips[1].bookingTripPassengers.filter(
      (passenger) => passenger.discountType?.toLowerCase() !== 'driver'
    );

    // Process each passenger's data
    const passengerData = passengers.map((passenger) => {
      // Get fare payment items
      const fareItems = passenger.bookingPaymentItems?.filter((item) => item.type?.toLowerCase() === 'fare') || [];

      // Calculate total fare for this passenger
      const passengerFare = fareItems[0]?.price ?? 0;

      return {
        name: `${passenger.passenger?.firstName ?? ''} ${passenger.passenger?.lastName ?? ''}`.trim(),
        discountType: passenger.discountType || 'Regular Fare',
        fare: passengerFare
      };
    });

    // Update state with processed data
    setPassengerReturnData(passengerData);

    // Calculate totals
    const totalFare = passengerData.reduce((sum, passenger) => sum + passenger.fare, 0);
    setPassengerReturnTotalFare(totalFare);

    // Calculate service charges
    const totalServiceCharge = passengerData.reduce(
      (sum, passenger) => sum + paymentHelper.calculateAyahayMarkupForPassenger(passenger.fare),
      0
    );

    setPassengerReturnServiceCharge(totalServiceCharge);

    // Get all drivers
    const drivers = booking.bookingTrips[1].bookingTripPassengers.filter(
      (passenger) => passenger.discountType?.toLowerCase() === 'driver'
    );

    // Process each driver's data
    const driverAyahayMarkUps = drivers.map((driver) => {
      // Get ayahay markup payment items
      const ayahayMarkupItems =
        driver.bookingPaymentItems?.filter((item) => item.type?.toLowerCase() === 'ayahaymarkup') || [];

      // Calculate ayahay markup for this driver
      const driverAyahayMarkup = ayahayMarkupItems[0]?.price ?? 0;

      return {
        fare: driverAyahayMarkup
      };
    });

    // Calculate total ayahay markups
    const totalDriverAyahayMarkups = driverAyahayMarkUps.reduce((sum, driver) => sum + driver.fare, 0);
    setDriverServiceCharge(totalDriverAyahayMarkups);
  }, [booking, paymentHelper]);

  // Process Departure Vehicle Data After Booking
  const processDepatureVehicleData = useCallback(() => {
    // Calculate passenger details
    const vehiclePrices =
      booking?.bookingTrips?.[0]?.bookingTripVehicles?.map((vehicle) => {
        // Filter bookingPaymentItems to only include items with type "Fare"
        const fareItems =
          vehicle?.bookingPaymentItems?.filter((item) => item?.type?.toLowerCase() === 'Fare'.toLowerCase()) || [];

        // Get the corresponding "Fare" item price (if it exists)
        const priceWithoutMarkup = fareItems[0]?.price ?? 0;

        return {
          name: vehicle?.vehicle?.vehicleType?.name ?? '',
          priceWithoutMarkup: priceWithoutMarkup,
          totalPrice: vehicle.totalPrice ?? 0
        };
      }) || [];

    if (vehiclePrices) {
      setVehicleDeparturePrices(vehiclePrices);

      // Extract data
      const priceWithoutMarkupValues = vehiclePrices.map((vehicle) => vehicle.priceWithoutMarkup);
      const totalVehicleFare = priceWithoutMarkupValues.reduce((total, price) => total + price, 0);

      // Update state
      setVehicleDepartureTotalFare(totalVehicleFare);

      let totalServiceCharge = 0;
      priceWithoutMarkupValues.forEach((price) => {
        // Calculate service charge
        const serviceCharge = paymentHelper.calculateAyahayMarkupForVehicle(price || 0);

        // Add to total service charge
        totalServiceCharge += serviceCharge;
      });

      setVehicleDepartureServiceCharge(totalServiceCharge);
    }
  }, [booking, paymentHelper]);

  // Process Return Vehicle Data After Booking
  const processReturnVehicleData = useCallback(() => {
    // Calculate passenger details
    const vehiclePrices =
      booking?.bookingTrips?.[1]?.bookingTripVehicles?.map((vehicle) => {
        // Filter bookingPaymentItems to only include items with type "Fare"
        const fareItems =
          vehicle?.bookingPaymentItems?.filter((item) => item?.type?.toLowerCase() === 'Fare'.toLowerCase()) || [];

        // Get the corresponding "Fare" item price (if it exists)
        const priceWithoutMarkup = fareItems[0]?.price ?? 0;

        return {
          name: vehicle?.vehicle?.vehicleType?.name ?? '',
          priceWithoutMarkup: priceWithoutMarkup,
          totalPrice: vehicle.totalPrice ?? 0
        };
      }) || [];

    if (vehiclePrices) {
      setVehicleReturnPrices(vehiclePrices);

      // Extract data
      const priceWithoutMarkupValues = vehiclePrices.map((vehicle) => vehicle.priceWithoutMarkup);
      const totalVehicleFare = priceWithoutMarkupValues.reduce((total, price) => total + price, 0);

      // Update state
      setVehicleReturnTotalFare(totalVehicleFare);

      let totalServiceCharge = 0;
      priceWithoutMarkupValues.forEach((price) => {
        // Calculate service charge
        const serviceCharge = paymentHelper.calculateAyahayMarkupForVehicle(price || 0);

        // Add to total service charge
        totalServiceCharge += serviceCharge;
      });

      setVehicleReturnServiceCharge(totalServiceCharge);
    }
  }, [booking, paymentHelper]);

  useEffect(() => {
    processDepaturePassengerData();
    processReturnPassengerData();
    processDepatureVehicleData();
    processReturnVehicleData();
  }, [
    booking,
    processDepaturePassengerData,
    processReturnPassengerData,
    processDepatureVehicleData,
    processReturnVehicleData
  ]);

  // Calculate the Sub-Total and Total Fare
  useEffect(() => {
    const depatureTotalSum =
      (passengerDepartureTotalFare || 0) +
      (passengerDepartureServiceCharge || 0) +
      (vehicleDepartureTotalFare || 0) +
      (vehicleDepartureServiceCharge || 0) +
      (driverFare || 0) +
      (driverServiceCharge || 0);

    if (returnCabinId) {
      setDepatureSubTotal(depatureTotalSum);

      const returnTotalSum =
        (passengerReturnTotalFare || 0) +
        (passengerReturnServiceCharge || 0) +
        (vehicleReturnTotalFare || 0) +
        (vehicleReturnServiceCharge || 0) +
        (driverFare || 0) +
        (driverServiceCharge || 0);

      setReturnSubTotal(returnTotalSum);
      setTotalAmount(depatureTotalSum + returnTotalSum);
    } else {
      setTotalAmount(depatureTotalSum);
    }
  }, [
    passengerDepartureTotalFare,
    passengerDepartureServiceCharge,
    vehicleDepartureTotalFare,
    vehicleDepartureServiceCharge,
    passengerReturnTotalFare,
    passengerReturnServiceCharge,
    vehicleReturnTotalFare,
    vehicleReturnServiceCharge,
    returnCabinId,
    driverFare,
    driverServiceCharge
  ]);

  return (
    <div
      className={`bg-white border shadow rounded-lg w-full min-w-[300px] sm:min-w-[400px] sm:max-w-[500px] h-auto p-4 sm:p-6 mb-10 ${
        pathname === '/booking/confirmed' ? 'border-2 border-green-500' : ''
      }`}
    >
      <h1 className="text-lg font-bold text-customText">Fare Summary</h1>

      <div className="mt-4 space-y-4">
        {returnCabinId > 0 && (
          <div className="flex items-center justify-center border-t-2 border-gray-300 py-1">
            <label className="text-mb font-semibold text-customText mt-2">Departure Trip</label>
          </div>
        )}

        {passengerDepartureData.length > 0 && (
          <>
            {/* Departure - Adult Fare Section */}
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsAdultDepartureFareExpanded((prev) => !prev)}
              >
                <span className="flex items-center gap-2 text-customText">
                  Adult Fare ({passengerDepartureData.length || 0})
                  {isAdultDepartureFareExpanded ? <FiChevronUp /> : <FiChevronDown />}
                </span>
                <span className="flex items-center text-customText">{formatCurrency(passengerDepartureTotalFare)}</span>
              </div>
              {isAdultDepartureFareExpanded && (
                <div>
                  {passengerDepartureData.map((passenger) => (
                    <div key={uuidv4()} className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <p className="break-words overflow-wrap w-[200px]">
                        {passenger.name} ({passenger.discountType})
                      </p>
                      <p>{formatCurrency(passenger.fare)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departure - Adult Service Charge Section */}
            <div>
              <div className="flex justify-between items-center cursor-pointer">
                <span className="flex items-center gap-2 text-customText">Adult Service Charge</span>
                <span className="flex items-center text-customText">
                  {formatCurrency(passengerDepartureServiceCharge)}
                </span>
              </div>
            </div>
          </>
        )}

        {(Number(vehicleDepartureRateTableRows?.length ?? 0) > 0 ||
          Number(vehicleDeparturePrices?.length ?? 0) > 0) && (
          <>
            {passengerDepartureData.length > 0 && <hr className="border-t-2 border-dashed border-gray-300" />}

            {/* Departure - Driver Fare */}
            <div className="flex justify-between items-center">
              <span className="text-customText">Driver Fare</span>
              <span className="text-customText">{formatCurrency(driverFare)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-customText">Driver Service Charge</span>
              <span className="text-customText">{formatCurrency(driverServiceCharge)}</span>
            </div>

            <hr className="border-t-2 border-dashed border-gray-300" />

            {/* Departure - Vehicle Fare Section */}
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsVehicleDepartureFareExpanded((prev) => !prev)}
              >
                <span className="flex items-center gap-2 text-customText">
                  Vehicle Fare ({vehicleDepartureRateTableRows?.length || vehicleDeparturePrices?.length || 0})
                  {isVehicleDepartureFareExpanded ? <FiChevronUp /> : <FiChevronDown />}
                </span>
                <span className="flex items-center text-customText">{formatCurrency(vehicleDepartureTotalFare)}</span>
              </div>
              {isVehicleDepartureFareExpanded && (
                <div>
                  {vehicleDepartureRateTableRows?.map((row) => (
                    <div key={uuidv4()} className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <p className="break-words overflow-wrap w-[200px]">
                        {row.vehicleType?.name || 'Unknown Vehicle Type'}
                      </p>
                      <p>{formatCurrency(row.fare || 0)}</p>
                    </div>
                  ))}

                  {vehicleDeparturePrices?.map((row) => (
                    <div key={uuidv4()} className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <p className="break-words overflow-wrap w-[200px]">{row.name || 'Unknown Vehicle Type'}</p>
                      <p>{formatCurrency(row.priceWithoutMarkup || 0)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departure - Vehicle Service Charge */}
            <div className="flex justify-between items-center">
              <span className="text-customText">Vehicle Service Charge</span>
              <span className="text-customText">{formatCurrency(vehicleDepartureServiceCharge || 0)}</span>
            </div>
          </>
        )}

        {returnCabinId > 0 && (
          <>
            <hr className="border-t-2 border-dashed border-gray-300" />

            {/* Departure - Total Amount / Amount Paid */}
            <div className="flex justify-between items-center font-bold text-md">
              <span>Sub-Total</span>
              <span className="text-customBlue">{formatCurrency(departureSubTotal)}</span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-center border-t-2 border-gray-300 py-1">
                <label className="text-mb font-semibold text-customText mt-2">Return Trip</label>
              </div>

              {passengerReturnData.length > 0 && (
                <>
                  {/* Return - Adult Fare Section */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsAdultReturnFareExpanded((prev) => !prev)}
                    >
                      <span className="flex items-center gap-2 text-customText">
                        Adult Fare ({passengerReturnData.length || 0})
                        {isAdultReturnFareExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                      <span className="flex items-center text-customText">
                        {formatCurrency(passengerReturnTotalFare)}
                      </span>
                    </div>

                    {isAdultReturnFareExpanded && (
                      <div>
                        {passengerReturnData.map((passenger) => (
                          <div key={uuidv4()} className="flex justify-between items-center mt-2 text-sm text-gray-500">
                            <p className="break-words overflow-wrap w-[200px]">
                              {passenger.name} ({passenger.discountType})
                            </p>
                            <p>{formatCurrency(passenger.fare)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Return - Adult Service Charge Section */}
                  <div>
                    <div className="flex justify-between items-center cursor-pointer">
                      <span className="flex items-center gap-2 text-customText">Adult Service Charge</span>
                      <span className="flex items-center text-customText">
                        {formatCurrency(passengerReturnServiceCharge)}{' '}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {(Number(vehicleReturnRateTableRows?.length ?? 0) > 0 ||
                Number(vehicleReturnPrices?.length ?? 0) > 0) && (
                <>
                  {passengerReturnData.length > 0 && <hr className="border-t-2 border-dashed border-gray-300" />}

                  {/* Return - Driver Fare */}
                  <div className="flex justify-between items-center">
                    <span className="text-customText">Driver Fare</span>
                    <span className="text-customText">{formatCurrency(driverFare)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-customText">Driver Service Charge</span>
                    <span className="text-customText">{formatCurrency(driverServiceCharge)}</span>
                  </div>

                  <hr className="border-t-2 border-dashed border-gray-300" />

                  {/* Return - Vehicle Fare Section */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsVehicleReturnFareExpanded((prev) => !prev)}
                    >
                      <span className="flex items-center gap-2 text-customText">
                        Vehicle Fare ({vehicleReturnRateTableRows?.length || vehicleReturnPrices?.length || 0})
                        {isVehicleReturnFareExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                      <span className="flex items-center text-customText">
                        {formatCurrency(vehicleReturnTotalFare)}
                      </span>
                    </div>
                    {isVehicleReturnFareExpanded && (
                      <div>
                        {vehicleReturnRateTableRows?.map((row) => (
                          <div key={uuidv4()} className="flex justify-between items-center mt-2 text-sm text-gray-500">
                            <p className="break-words overflow-wrap w-[200px]">
                              {row.vehicleType?.name || 'Unknown Vehicle Type'}
                            </p>
                            <p>{formatCurrency(row.fare || 0)}</p>
                          </div>
                        ))}

                        {vehicleReturnPrices?.map((row) => (
                          <div key={uuidv4()} className="flex justify-between items-center mt-2 text-sm text-gray-500">
                            <p className="break-words overflow-wrap w-[200px]">{row.name || 'Unknown Vehicle Type'}</p>
                            <p>{formatCurrency(row.priceWithoutMarkup || 0)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Return - Vehicle Service Charge */}
                  <div className="flex justify-between items-center">
                    <span className="text-customText">Vehicle Service Charge</span>
                    <span className="text-customText">{formatCurrency(vehicleReturnServiceCharge || 0)}</span>
                  </div>
                </>
              )}
            </div>

            <hr className="border-t-2 border-dashed border-gray-300" />

            {/* Total Amount / Amount Paid */}
            <div className="flex justify-between items-center font-bold text-md">
              <span>Sub-Total</span>
              <span className="text-customBlue">{formatCurrency(returnSubTotal)}</span>
            </div>
          </>
        )}

        {/* Discount Voucher */}
        {discountVoucher && (
          <div className="flex justify-between items-center text-red-500">
            <span className="text-customText">Discount Voucher</span>
            <span>- {formatCurrency(0)}</span>
          </div>
        )}

        <hr className="border-t-2 border-dashed border-gray-300" />

        {/* Total Amount / Amount Paid */}

        <div className="flex justify-between items-center font-bold text-lg">
          {pathname === '/booking/confirmed' ? (
            <>
              <span className="flex items-center gap-2">
                Amount Paid
                <FaCheckCircle className="w-6 h-6 text-green-500" />
              </span>
              <span className="text-green-500">{formatCurrency(totalAmount)}</span>
            </>
          ) : (
            <>
              <span>Total Amount</span>
              <span className="text-customBlue">{formatCurrency(totalAmount)}</span>
            </>
          )}
        </div>
      </div>

      {/* Conditional Buttons */}
      {pathname.includes('/booking/passenger-details') && (
        <>
          <Button
            variant="default"
            className="mt-6 w-full bg-customBlue text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-500"
            aria-label="Proceed to Payment"
            onClick={handleProceedToPayment}
            disabled={!isFormValid}
          >
            Proceed to Payment
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </>
      )}
      {pathname.includes('/booking/payment-confirmation') && (
        <>
          {showMessge ? (
            <div className="mt-6">
              <p className="text-sm text-customBlue font-semibold mb-4">
                You will be redirected to the secure PayMongo Payment Gateway to pay for your booking.
              </p>
              <p className="text-sm text-customText">
                You can safely close this tab or book again by clicking the button below.
                <br />
                For any concerns, please{' '}
                <a
                  href="mailto:it@ayahay.com?subject=Booking Processing"
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-[rgba(var(--bg-color),1)] bg-transparent border border-[rgba(var(--border-color),1)] rounded hover:bg-[rgba(var(--bg-color),1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-customBlue focus:ring-offset-2"
                  style={
                    {
                      '--border-color': hexToRgb(themeSettings?.borderColor || '#23abff'),
                      '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
                    } as React.CSSProperties
                  }
                >
                  Contact us for assistance
                </a>{' '}
                with the subject header:
                <br />
                <br />
                Booking Reference: <strong>{payBooking?.paymentReference}</strong>
              </p>
              <div className="flex justify-start mt-6">
                <p className="text-sm text-customText">
                  If you are not redirected to the secure PayMongo Payment Gateway, please&nbsp;
                  <a
                    href={payBooking?.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 text-sm font-medium text-[rgba(var(--bg-color),1)] bg-transparent border border-[rgba(var(--border-color),1)] rounded hover:bg-[rgba(var(--bg-color),1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--icon-color),1)] focus:ring-offset-2"
                    style={
                      {
                        '--border-color': hexToRgb(themeSettings?.borderColor || '#23abff'),
                        '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
                      } as React.CSSProperties
                    }
                  >
                    Click here
                  </a>
                  &nbsp;to proceed with your payment.
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <a
                  href="/booking/destination"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:bg-blue-500"
                  style={{ backgroundColor: themeSettings?.buttonDefaultColor || '#23abff' }}
                >
                  Book Again
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start mt-4">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="marketing" className="text-xs text-gray-600">
                  Yes, I would like to receive emails about promotions, updates, and special offers from Ayahay and
                  partners.
                </label>
              </div>
              <div className="flex items-start mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-customBlue hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-customBlue hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <Button
                variant="default"
                className="mt-6 w-full"
                onClick={handlePaymentClick}
                disabled={isProcessing || !agreedToTerms}
              >
                Pay {formatCurrency(totalAmount)} via Paymongo
                {isProcessing && <FiLoader className="ml-1 text-white animate-spin" />}
              </Button>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-lg">
                  <DialogTitle className="sr-only">Payment Confirmation Dialog</DialogTitle>
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">Payment Confirmation</h3>
                    <div className="w-full h-[1px] bg-gray-200 mb-6"></div>
                    <p className="text-sm text-gray-600 mb-8 max-w-[320px] leading-relaxed">
                      I understand and accept that the convenience fee charged is non-refundable under any
                      circumstances.
                    </p>
                    <DialogActions>
                      <div className="flex justify-center gap-4 w-full">
                        <Button
                          variant="outline"
                          onClick={handleModalCancel}
                          className="min-w-[100px] bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleModalConfirm}
                          className="min-w-[100px]"
                          style={{
                            backgroundColor: themeSettings?.buttonDefaultColor || '#23abff',
                            color: 'white'
                          }}
                        >
                          I Agree
                        </Button>
                      </div>
                    </DialogActions>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FareSummary;
