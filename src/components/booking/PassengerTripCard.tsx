'use client';

import { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import { FaCar, FaShip } from 'react-icons/fa';
import { IoMdPin } from 'react-icons/io';
import { FiLoader } from 'react-icons/fi';
import { BiTimer } from 'react-icons/bi';
import { MdDateRange, MdAirlineSeatReclineNormal } from 'react-icons/md';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { toPhilippinesTime } from 'helpers/date.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { DATE_SECONDARY_DEFAULT_FORMAT, TIME_DEFAULT_FORMAT } from 'constants/index';
import { IShippingLine, ITrip } from '@/models';
import { getShippingLine } from '@/services/shipping-line/shipping-line.service';

interface PassengerTripCardProps {
  departureTrips?: ITrip[];
  returnTrips?: ITrip[];
  // For backward compatibility while refactoring
  trips?: ITrip[];
}

export default function PassengerTripCard({ departureTrips, returnTrips, trips }: PassengerTripCardProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [shippingLines, setShippingLines] = useState<Record<number, IShippingLine>>({});
  const departureCabinName = searchParams.get('departureCabinName');
  const departureCabinId = searchParams.get('departureCabinId');
  const returnCabinName = searchParams.get('returnCabinName');
  const returnCabinId = searchParams.get('returnCabinId');
  const themeSettings = useThemeSettings();
  const primaryColor = themeSettings?.accent || '#23abff';

  const effectiveDepTrips = departureTrips || (trips?.length ? [trips[0]] : []);
  const effectiveRetTrips = returnTrips || (trips?.length && trips.length > 1 ? [trips[1]] : []);
  const allTrips = [...effectiveDepTrips, ...effectiveRetTrips];

  const getPassengersLeft = (trip: ITrip, cabinName?: string | null, cabinId?: string | null) => {
    if (cabinId) {
      const exactCabin = trip.availableCabins.find((c) => c.cabinId?.toString() === cabinId);
      if (exactCabin) return exactCabin.availablePassengerCapacity || 0;
    }

    if (cabinName) {
      const fallbackCabin = trip.availableCabins.find(
        (c) => c.cabin?.cabin_type_name === cabinName || c.cabin?.name === cabinName
      );
      if (fallbackCabin) return fallbackCabin.availablePassengerCapacity || 0;
    }

    return 0;
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchShippingLines = async () => {
      if (!allTrips.length) return;

      const uniqueShippingLineIds = Array.from(new Set(allTrips.map((trip) => trip.shippingLineId)));
      const lines: Record<number, IShippingLine> = {};

      await Promise.all(
        uniqueShippingLineIds.map(async (id) => {
          const line = await getShippingLine(id);
          if (line) {
            lines[id] = line;
          }
        })
      );

      setShippingLines(lines);
    };

    fetchShippingLines();
  }, [effectiveDepTrips.length, effectiveRetTrips.length]); // depends on lengths to avoid deep compare loops

  const renderSingleTrip = (trip: ITrip, cabinName?: string | null, cabinId?: string | null) => (
    <div className="bg-white rounded-lg p-2 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-3 w-full">
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3 w-full md:w-auto">
          <MdDateRange className="text-xl mr-2" style={{ color: primaryColor }} />
          <span className="text-sm font-medium">
            {toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
          </span>
        </div>

        {pathname.includes('/booking/passenger-details') && (
          <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
            <div
              className="flex items-center px-4 py-2 rounded-lg"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`
              }}
            >
              <FaCar className="mr-2 text-lg" />
              <span className="text-sm font-medium">{trip.availableVehicleCapacity} Vehicle Slots</span>
            </div>
            <div
              className="flex items-center px-4 py-2 rounded-lg"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`
              }}
            >
              <MdAirlineSeatReclineNormal
                className="h-5 w-5 mr-2"
                style={{ color: primaryColor }}
              />
              <span className="text-sm font-medium">
                {getPassengersLeft(trip, cabinName, cabinId)} Seats Left
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center sm:hidden mb-4">
        {(trip.lightLogoUrl || shippingLines[trip.shippingLineId]?.logoFilename) && (
          <Image
            src={trip.lightLogoUrl || shippingLines[trip.shippingLineId].logoFilename!}
            alt="Shipping Company Logo"
            width={140}
            height={140}
            className="w-auto h-[60px] object-contain"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 w-full">
        <div className="flex flex-col items-center flex-shrink-0 w-[30%] sm:w-auto">
          <div className="hidden sm:flex items-center justify-center mb-2">
            {(trip.lightLogoUrl || shippingLines[trip.shippingLineId]?.logoFilename) && (
              <Image
                src={trip.lightLogoUrl || shippingLines[trip.shippingLineId].logoFilename!}
                alt="Shipping Company Logo"
                width={160}
                height={160}
                className="w-auto h-[50px] object-contain"
              />
            )}
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 sm:p-3 w-full">
            <div className="flex items-center mb-1">
              <BiTimer className="text-sm mr-1" style={{ color: primaryColor }} />
              <p className="text-sm sm:text-base font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                {toPhilippinesTime(trip.departureDateIso, TIME_DEFAULT_FORMAT)}
              </p>
            </div>
            <p className="text-xs text-gray-700 text-center font-medium w-full truncate">
              {getPortLabel(trip.srcPort as any)}
            </p>
            {trip.srcPort?.name && <p className="text-xs text-gray-400 text-center w-full truncate">{trip.srcPort.name}</p>}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-1 sm:px-4 py-2">
          <FaShip className="text-lg sm:text-xl flex-shrink-0" style={{ color: primaryColor }} />
          <div
            className="flex-1 border-t-2 border-dashed mx-1 sm:mx-2"
            style={{ borderColor: `${primaryColor}80` }}
          ></div>
          <IoMdPin className="text-lg sm:text-xl flex-shrink-0" style={{ color: primaryColor }} />
        </div>

        <div className="flex flex-col items-center flex-shrink-0 w-[30%] sm:w-auto">
          <div className="hidden sm:flex items-center justify-center mb-2">
            {(trip.lightLogoUrl || shippingLines[trip.shippingLineId]?.logoFilename) && (
              <Image
                src={trip.lightLogoUrl || shippingLines[trip.shippingLineId].logoFilename!}
                alt="Shipping Company Logo"
                width={160}
                height={160}
                className="w-auto h-[50px] object-contain"
              />
            )}
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 sm:p-3 w-full">
            <div className="flex items-center mb-1">
              <BiTimer className="text-sm mr-1" style={{ color: primaryColor }} />
              <p className="text-sm sm:text-base font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                {toPhilippinesTime(trip.arrivalTimeDateIso, TIME_DEFAULT_FORMAT)}
              </p>
            </div>
            <p className="text-xs text-gray-700 text-center font-medium w-full truncate">
              {getPortLabel(trip.destPort as any)}
            </p>
            {trip.destPort?.name && <p className="text-xs text-gray-400 text-center w-full truncate">{trip.destPort.name}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const getPortLabel = (port?: { name: string; municipality?: string; province?: string }) => {
    if (!port) return '';
    if (port.province && port.municipality) return `${port.province}, ${port.municipality}`;
    if (port.province) return port.province;
    if (port.municipality) return port.municipality;
    return port.name;
  };

  const renderTripBlock = (trip: ITrip, title: string, cabinName?: string | null, cabinId?: string | null) => (
    <div className="flex flex-col bg-gray-50 p-3 sm:p-4 rounded-lg flex-1 shadow-sm w-full">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="flex items-center justify-center p-2 rounded-lg shadow-sm mr-3" style={{ backgroundColor: primaryColor }}></div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-4 w-full gap-3 sm:gap-5">
        <div className="flex justify-center sm:justify-start w-full sm:w-auto mb-3 sm:mb-0">
          {(trip.lightLogoUrl || shippingLines[trip.shippingLineId]?.logoFilename) && (
            <Image
              src={trip.lightLogoUrl || shippingLines[trip.shippingLineId].logoFilename!}
              alt={`${title} Logo`}
              width={160}
              height={160}
              className="w-auto h-[50px] sm:h-[60px] sm:mr-4 object-contain"
            />
          )}
        </div>
        <div className="flex flex-col items-center sm:items-start w-full">
          <div className="flex items-center p-2 bg-white rounded-lg shadow-sm mb-2">
            <div className="flex flex-col max-w-[150px] sm:max-w-[250px]">
              <span className="truncate font-medium text-gray-700">{getPortLabel(trip.srcPort as any)}</span>
              {trip.srcPort?.name && <span className="truncate text-xs text-gray-400">{trip.srcPort.name}</span>}
            </div>
            <FaArrowRight
              className="w-3 h-3 mx-1 sm:mx-2 flex-shrink-0"
              style={{ color: primaryColor }}
            />
            <div className="flex flex-col max-w-[150px] sm:max-w-[250px]">
              <span className="truncate font-medium text-gray-700">{getPortLabel(trip.destPort as any)}</span>
              {trip.destPort?.name && <span className="truncate text-xs text-gray-400">{trip.destPort.name}</span>}
            </div>
          </div>

          <div className="flex items-center mb-2">
            <MdDateRange className="text-gray-600 mr-1" />
            <span className="text-sm text-gray-600 mr-2">
              {toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
            </span>
            <BiTimer className="text-gray-600 mr-1" />
            <span className="text-sm font-medium" style={{ color: primaryColor }}>
              {toPhilippinesTime(trip.departureDateIso, TIME_DEFAULT_FORMAT)}
            </span>
          </div>

          {pathname.includes('/booking/passenger-details') && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center px-3 py-1 bg-blue-50 rounded-lg"
                style={{
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                <MdAirlineSeatReclineNormal
                  className="h-4 w-4 mr-1.5"
                  style={{ color: primaryColor }}
                />
                <span className="text-xs font-medium" style={{ color: primaryColor }}>
                  {getPassengersLeft(trip, cabinName, cabinId)} Passengers
                </span>
              </div>

              <div className="flex items-center px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                <FaCar className="mr-1.5 text-xs" style={{ color: primaryColor }} />
                <span className="text-xs font-medium" style={{ color: primaryColor }}>
                  {trip.availableVehicleCapacity} Vehicles
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTwoColumnRow = (leftBlock: React.ReactNode, rightBlock: React.ReactNode) => (
    <div className="flex flex-col gap-4 sm:gap-6 w-full mb-6 last:mb-0">
      <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-6 w-full">
        {leftBlock}

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

        {rightBlock}
      </div>
    </div>
  );

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
          <div className="flex flex-col gap-4">
            {/* Single Trip (Direct One-Way) */}
            {effectiveDepTrips.length === 1 && effectiveRetTrips.length === 0 && (
              renderSingleTrip(effectiveDepTrips[0], departureCabinName, departureCabinId)
            )}

            {/* Connecting One-Way */}
            {effectiveDepTrips.length === 2 && effectiveRetTrips.length === 0 && (() => {
              const cabinNames = (departureCabinName || '').split('|');
              const cabinIds = (departureCabinId || '').split('|');
              return renderTwoColumnRow(
                renderTripBlock(effectiveDepTrips[0], 'Connecting Trip 1 (Departure)', cabinNames[0] || cabinNames[0], cabinIds[0] || cabinIds[0]),
                renderTripBlock(effectiveDepTrips[1], 'Connecting Trip 2 (Departure)', cabinNames[1] || cabinNames[0], cabinIds[1] || cabinIds[0])
              );
            })()}

            {/* Direct Round Trip */}
            {effectiveDepTrips.length === 1 && effectiveRetTrips.length === 1 && (
              renderTwoColumnRow(
                renderTripBlock(effectiveDepTrips[0], 'Departure Trip', departureCabinName, departureCabinId),
                renderTripBlock(effectiveRetTrips[0], 'Return Trip', returnCabinName, returnCabinId)
              )
            )}

            {/* Connecting Round Trip */}
            {effectiveDepTrips.length >= 2 && effectiveRetTrips.length >= 2 && (() => {
              const depCabinNames = (departureCabinName || '').split('|');
              const depCabinIds = (departureCabinId || '').split('|');
              const retCabinNames = (returnCabinName || '').split('|');
              const retCabinIds = (returnCabinId || '').split('|');

              return (
                <>
                  <h2 className="text-xl font-bold mb-2 ml-2" style={{ color: primaryColor }}>Departure Connection</h2>
                  {renderTwoColumnRow(
                    renderTripBlock(effectiveDepTrips[0], 'Departure Segment 1', depCabinNames[0] || depCabinNames[0], depCabinIds[0] || depCabinIds[0]),
                    renderTripBlock(effectiveDepTrips[1], 'Departure Segment 2', depCabinNames[1] || depCabinNames[0], depCabinIds[1] || depCabinIds[0])
                  )}

                  <hr className="my-2 border-dashed" style={{ borderColor: `${primaryColor}50` }} />

                  <h2 className="text-xl font-bold mb-2 ml-2 mt-2" style={{ color: primaryColor }}>Return Connection</h2>
                  {renderTwoColumnRow(
                    renderTripBlock(effectiveRetTrips[0], 'Return Segment 1', retCabinNames[0] || retCabinNames[0], retCabinIds[0] || retCabinIds[0]),
                    renderTripBlock(effectiveRetTrips[1], 'Return Segment 2', retCabinNames[1] || retCabinNames[0], retCabinIds[1] || retCabinIds[0])
                  )}
                </>
              );
            })()}

            {/* Connecting Departure + Direct Return */}
            {effectiveDepTrips.length === 2 && effectiveRetTrips.length === 1 && (() => {
              const cabinNames = (departureCabinName || '').split('|');
              const cabinIds = (departureCabinId || '').split('|');

              return (
                <>
                  <h2 className="text-xl font-bold mb-2 ml-2" style={{ color: primaryColor }}>Departure Connection</h2>
                  {renderTwoColumnRow(
                    renderTripBlock(effectiveDepTrips[0], 'Departure Segment 1', cabinNames[0] || cabinNames[0], cabinIds[0] || cabinIds[0]),
                    renderTripBlock(effectiveDepTrips[1], 'Departure Segment 2', cabinNames[1] || cabinNames[0], cabinIds[1] || cabinIds[0])
                  )}

                  <hr className="my-2 border-dashed" style={{ borderColor: `${primaryColor}50` }} />
                  {renderSingleTrip(effectiveRetTrips[0], returnCabinName, returnCabinId)}
                </>
              );
            })()}

            {/* Direct Departure + Connecting Return */}
            {effectiveDepTrips.length === 1 && effectiveRetTrips.length === 2 && (() => {
              const cabinNames = (returnCabinName || '').split('|');
              const cabinIds = (returnCabinId || '').split('|');

              return (
                <>
                  {renderSingleTrip(effectiveDepTrips[0], departureCabinName, departureCabinId)}

                  <hr className="my-4 border-dashed" style={{ borderColor: `${primaryColor}50` }} />

                  <h2 className="text-xl font-bold mb-2 ml-2" style={{ color: primaryColor }}>Return Connection</h2>
                  {renderTwoColumnRow(
                    renderTripBlock(effectiveRetTrips[0], 'Return Segment 1', cabinNames[0] || cabinNames[0], cabinIds[0] || cabinIds[0]),
                    renderTripBlock(effectiveRetTrips[1], 'Return Segment 2', cabinNames[1] || cabinNames[0], cabinIds[1] || cabinIds[0])
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
