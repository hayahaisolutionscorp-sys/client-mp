'use client';

import { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import { FaCar, FaShip } from 'react-icons/fa';
import { IoMdPin } from 'react-icons/io';
import { FiLoader } from 'react-icons/fi';
import { BiTimer } from 'react-icons/bi';
import { MdDateRange } from 'react-icons/md';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { toPhilippinesTime } from 'helpers/date.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { DATE_SECONDARY_DEFAULT_FORMAT, TIME_DEFAULT_FORMAT, SHIPPING_LINE_LOGO } from 'constants/index';
import { ITrip } from '@/models';

interface PassengerTripCardProps {
  trips: ITrip[] | undefined;
}

export default function PassengerTripCard({ trips }: PassengerTripCardProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const departureCabinId = searchParams.get('departureCabinId') ?? 0;
  const returnCabinId = searchParams.get('returnCabinId') ?? 0;
  const themeSettings = useThemeSettings();
  const primaryColor = themeSettings?.iconColor || '#23abff';

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="w-full h-auto">
      <div
        className="border-2 bg-white rounded-lg shadow-lg p-3 sm:p-5 mb-6 transition-all hover:shadow-xl w-full h-full"
        style={{ borderColor: primaryColor }}
      >
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-32 sm:h-40">
            <FiLoader className="animate-spin text-4xl mb-3" style={{ color: primaryColor }} />
            <p className="text-sm text-gray-600">Loading trip details...</p>
          </div>
        ) : (
          <>
            {' '}
            {/* Single Trip Booking */}
            {trips?.length === 1 && (
              <div className="bg-white rounded-lg p-2 w-full">
                {/* Trip Date and Available Slots */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-3 w-full">
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3 w-full md:w-auto">
                    <MdDateRange className="text-xl mr-2" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium">
                      {toPhilippinesTime(trips[0].departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
                    </span>
                  </div>

                  {pathname.includes('/booking/passenger-details') && (
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
                      <div className="flex items-center px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg">
                        <FaCar className="mr-2 text-lg" />
                        <span className="text-sm font-medium">{trips[0].availableVehicleCapacity} Vehicle Slots</span>
                      </div>
                      <div
                        className="flex items-center px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                          border: `1px solid ${primaryColor}30`
                        }}
                      >
                        <Image
                          src="/assets/images/seats_icon.svg"
                          alt="Seats Icon"
                          width={50}
                          height={50}
                          className="h-5 w-5 mr-2"
                        />
                        <span className="text-sm font-medium">
                          {trips[0].availableCabins
                            .filter((cabin) => cabin.cabinId === Number(departureCabinId))
                            .map((cabin) => cabin.availablePassengerCapacity)}{' '}
                          Seats Left
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Line Logo - Mobile */}
                <div className="flex justify-center sm:hidden mb-4">
                  <Image
                    src={`${SHIPPING_LINE_LOGO}${trips[0].shippingLine?.logoFilename}`}
                    alt="Shipping Company Logo"
                    width={140}
                    height={140}
                    className="w-auto h-[60px] object-contain"
                  />
                </div>
                {/* Trip Journey Visualization */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 w-full">
                  {/* Origin */}
                  <div className="flex flex-col items-center flex-shrink-0 w-[30%] sm:w-auto">
                    <div className="hidden sm:flex items-center justify-center mb-2">
                      <Image
                        src={`${SHIPPING_LINE_LOGO}${trips[0].shippingLine?.logoFilename}`}
                        alt="Shipping Company Logo"
                        width={160}
                        height={160}
                        className="w-auto h-[50px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 sm:p-3 w-full">
                      <div className="flex items-center mb-1">
                        <BiTimer className="text-sm mr-1" style={{ color: primaryColor }} />
                        <p className="text-sm sm:text-base font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                          {toPhilippinesTime(trips[0].departureDateIso, TIME_DEFAULT_FORMAT)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-700 text-center font-medium w-full truncate">
                        {trips[0].srcPort?.name}
                      </p>
                    </div>
                  </div>

                  {/* Journey Path */}
                  <div className="flex-1 flex items-center justify-center px-1 sm:px-4 py-2">
                    <FaShip className="text-lg sm:text-xl flex-shrink-0" style={{ color: primaryColor }} />
                    <div
                      className="flex-1 border-t-2 border-dashed mx-1 sm:mx-2"
                      style={{ borderColor: `${primaryColor}80` }}
                    ></div>
                    <IoMdPin className="text-lg sm:text-xl text-green-500 flex-shrink-0" />
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col items-center flex-shrink-0 w-[30%] sm:w-auto">
                    <div className="hidden sm:flex items-center justify-center mb-2">
                      <Image
                        src={`${SHIPPING_LINE_LOGO}${trips[0].shippingLine?.logoFilename}`}
                        alt="Shipping Company Logo"
                        width={160}
                        height={160}
                        className="w-auto h-[50px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 sm:p-3 w-full">
                      <div className="flex items-center mb-1">
                        <BiTimer className="text-sm mr-1" style={{ color: primaryColor }} />
                        <p className="text-sm sm:text-base font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                          {toPhilippinesTime(trips[0].arrivalTimeDateIso, TIME_DEFAULT_FORMAT)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-700 text-center font-medium w-full truncate">
                        {trips[0].destPort?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}{' '}
            {/* Round Trip Booking */}
            {trips?.length === 2 && (
              <div className="flex flex-col gap-4 sm:gap-6 w-full">
                <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-6 w-full">
                  {/* Left Section - Departure */}
                  <div className="flex flex-col bg-gray-50 p-3 sm:p-4 rounded-lg flex-1 shadow-sm w-full">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="flex items-center justify-center bg-[#23ABFF] p-2 rounded-lg shadow-sm mr-3"></div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Departure Trip</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-4 w-full gap-3 sm:gap-5">
                      <div className="flex justify-center sm:justify-start w-full sm:w-auto mb-3 sm:mb-0">
                        <Image
                          src={`${SHIPPING_LINE_LOGO}${trips[0].shippingLine?.logoFilename}`}
                          alt="Shipping Company Logo Departure"
                          width={160}
                          height={160}
                          className="w-auto h-[50px] sm:h-[60px] sm:mr-4 object-contain"
                        />
                      </div>
                      <div className="flex flex-col items-center sm:items-start w-full">
                        <div className="flex items-center p-2 bg-white rounded-lg shadow-sm mb-2">
                          <span className="max-w-[150px] sm:max-w-[250px] truncate font-medium text-gray-700">
                            {trips[0].srcPort?.name}
                          </span>
                          <FaArrowRight
                            className="w-3 h-3 mx-1 sm:mx-2 flex-shrink-0"
                            style={{ color: primaryColor }}
                          />
                          <span className="max-w-[150px] sm:max-w-[250px] truncate font-medium text-gray-700">
                            {trips[0].destPort?.name}
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <MdDateRange className="text-gray-600 mr-1" />
                          <span className="text-sm text-gray-600 mr-2">
                            {toPhilippinesTime(trips[0].departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
                          </span>
                          <BiTimer className="text-gray-600 mr-1" />
                          <span className="text-sm font-medium" style={{ color: primaryColor }}>
                            {toPhilippinesTime(trips[0].departureDateIso, TIME_DEFAULT_FORMAT)}
                          </span>
                        </div>

                        {pathname.includes('/booking/passenger-details') && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <div className="flex items-center px-3 py-1 bg-blue-50 rounded-lg">
                              <Image
                                src="/assets/images/seats_icon.svg"
                                alt="Seats Icon"
                                width={40}
                                height={40}
                                className="h-4 w-4 mr-1.5"
                              />
                              <span className="text-xs font-medium text-blue-600">
                                {trips[0].availableCabins
                                  .filter((cabin) => cabin.cabinId === Number(departureCabinId))
                                  .map((cabin) => cabin.availablePassengerCapacity)}{' '}
                                Passengers
                              </span>
                            </div>

                            <div className="flex items-center px-3 py-1 bg-green-50 rounded-lg">
                              <FaCar className="mr-1.5 text-xs text-green-600" />
                              <span className="text-xs font-medium text-green-600">
                                {trips[0].availableVehicleCapacity} Vehicles
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center Separator - Mobile */}
                  <div className="flex items-center justify-center lg:hidden">
                    <div className="flex items-center w-full">
                      <div className="h-0.5 flex-grow bg-gray-200"></div>
                      <div className="mx-4 text-gray-400">AND</div>
                      <div className="h-0.5 flex-grow bg-gray-200"></div>
                    </div>
                  </div>

                  {/* Desktop Separator */}
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="h-full w-0.5 bg-gray-200"></div>
                  </div>

                  {/* Right Section - Return */}
                  <div className="flex flex-col bg-gray-50 p-4 rounded-lg flex-1 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center bg-[#23ABFF] p-2 rounded-lg shadow-sm mr-3"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Return Trip</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-4 w-full gap-3 sm:gap-5">
                      <div className="flex justify-center sm:justify-start w-full sm:w-auto mb-3 sm:mb-0">
                        <Image
                          src={`${SHIPPING_LINE_LOGO}${trips[0].shippingLine?.logoFilename}`}
                          alt="Shipping Company Logo Departure"
                          width={160}
                          height={160}
                          className="w-auto h-[50px] sm:h-[60px] sm:mr-4 object-contain"
                        />
                      </div>
                      <div className="flex flex-col items-center sm:items-start w-full">
                        <div className="flex items-center p-2 bg-white rounded-lg shadow-sm mb-2">
                          <span className="max-w-[150px] sm:max-w-[250px] truncate font-medium text-gray-700">
                            {trips[1]?.srcPort?.name}
                          </span>
                          <FaArrowRight className="w-3 h-3 mx-2" style={{ color: primaryColor }} />
                          <span className="max-w-[150px] sm:max-w-[250px] truncate font-medium text-gray-700">
                            {trips[1]?.destPort?.name}
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <MdDateRange className="text-gray-600 mr-1" />
                          <span className="text-sm text-gray-600 mr-2">
                            {toPhilippinesTime(trips[1]?.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
                          </span>
                          <BiTimer className="text-gray-600 mr-1" />
                          <span className="text-sm font-medium" style={{ color: primaryColor }}>
                            {toPhilippinesTime(trips[1]?.departureDateIso, TIME_DEFAULT_FORMAT)}
                          </span>
                        </div>

                        {pathname.includes('/booking/passenger-details') && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <div className="flex items-center px-3 py-1 bg-blue-50 rounded-lg">
                              <Image
                                src="/assets/images/seats_icon.svg"
                                alt="Seats Icon"
                                width={40}
                                height={40}
                                className="h-4 w-4 mr-1.5"
                              />
                              <span className="text-xs font-medium text-blue-600">
                                {trips[1]?.availableCabins
                                  .filter((cabin) => cabin.cabinId === Number(returnCabinId))
                                  .map((cabin) => cabin.availablePassengerCapacity)}{' '}
                                Passengers
                              </span>
                            </div>

                            <div className="flex items-center px-3 py-1 bg-green-50 rounded-lg">
                              <FaCar className="mr-1.5 text-xs text-green-600" />
                              <span className="text-xs font-medium text-green-600">
                                {trips[1]?.availableVehicleCapacity} Vehicles
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
