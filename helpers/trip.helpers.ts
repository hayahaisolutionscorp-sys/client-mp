import { ITrip } from "@/models";

export interface StatusInfo {
  label: string;
  bgColor: string;
  textColor: string;
  isBookable: boolean;
}

export const getTripStatusInfo = (trip: ITrip): StatusInfo => {
  const status = trip.status?.toLowerCase();

  const knownPassengerCapacities = (trip.availableCabins || [])
    .map((cabin) => cabin.availablePassengerCapacity)
    .filter((capacity): capacity is number => typeof capacity === 'number');

  // Only mark as fully booked when capacities are known and sum to zero.
  const isFullyBookedByCapacity =
    knownPassengerCapacities.length > 0 &&
    knownPassengerCapacities.reduce((sum, capacity) => sum + capacity, 0) === 0;

  if (status === 'cancelled') {
    return {
      label: 'Cancelled',
      bgColor: 'rgba(239, 68, 68, 0.1)', // red-500
      textColor: 'rgb(220, 38, 38)', // red-600
      isBookable: false,
    };
  }

  if (isFullyBookedByCapacity && (status === 'pending' || status === 'open_for_booking' || status === 'scheduled' || status === 'awaiting')) {
    return {
      label: 'Fully Booked',
      bgColor: 'rgba(107, 114, 128, 0.1)', // gray-500
      textColor: 'rgb(75, 85, 99)', // gray-600
      isBookable: false,
    };
  }

  switch (status) {
    case 'arrived':
    case 'completed':
      return {
        label: 'Arrived',
        bgColor: 'rgba(34, 197, 94, 0.1)', // green-500
        textColor: 'rgb(22, 163, 74)', // green-600
        isBookable: false,
      };
    case 'departed':
      return {
        label: 'Departed',
        bgColor: 'rgba(59, 130, 246, 0.1)', // blue-500
        textColor: 'rgb(37, 99, 235)', // blue-600
        isBookable: false,
      };
    case 'onboarded':
      return {
        label: 'Onboarded',
        bgColor: 'rgba(168, 85, 247, 0.1)', // purple-500
        textColor: 'rgb(147, 51, 234)', // purple-600
        isBookable: false,
      };
    case 'pending':
      return {
        label: 'Pending',
        bgColor: 'rgba(245, 158, 11, 0.1)', // amber-500
        textColor: 'rgb(217, 119, 6)', // amber-600
        isBookable: true,
      };
    case 'open_for_booking':
      return {
        label: 'Open for Booking',
        bgColor: 'rgba(20, 184, 166, 0.1)', // teal-500
        textColor: 'rgb(13, 148, 136)', // teal-600
        isBookable: true,
      };
    case 'scheduled':
      return {
        label: 'Scheduled',
        bgColor: 'rgba(99, 102, 241, 0.1)', // indigo-500
        textColor: 'rgb(79, 70, 229)', // indigo-600
        isBookable: true,
      };
    case 'awaiting':
    default:
      return {
        label: 'Awaiting',
        bgColor: 'rgba(100, 116, 139, 0.1)', // slate-500
        textColor: 'rgb(71, 85, 105)', // slate-600
        isBookable: true,
      };
  }
};
