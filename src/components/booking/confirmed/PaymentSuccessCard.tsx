'use client';

import { GiCheckMark } from 'react-icons/gi';
import { useMediaQuery } from 'react-responsive';
import { QRCodeSVG } from 'qrcode.react';
import { toPhilippinesTime } from 'helpers/date.helpers';
import { DATE_SECONDARY_DEFAULT_FORMAT } from 'constants/default';
import { IBooking } from '@/models';

interface PaymentSuccessCardProps {
  booking?: IBooking;
}

export default function PaymentSuccessCard({ booking }: PaymentSuccessCardProps) {
  const isXs = useMediaQuery({ maxWidth: 640 }); // Detects 'xs' screens
  const isSm = useMediaQuery({ minWidth: 641, maxWidth: 768 }); // Detects 'sm' screens

  const size = isXs ? 192 : isSm ? 224 : 256;

  const showQrCode = (booking: IBooking | undefined): boolean => {
    return booking?.bookingStatus === 'Confirmed' && booking?.paymentStatus === 'Success';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full bg-white border-2 border-green-400 shadow-lg rounded-lg p-4 sm:p-6">
        <div className="text-center my-2">
          <div className="flex justify-center text-green-600">
            <GiCheckMark className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
            <h1 className="text-lg sm:text-xl font-semibold text-green-600">Payment Successful</h1>
          </div>
        </div>
        <div className="flex items-center justify-center w-auto h-auto my-4 sm:my-6">
          <div className="flex flex-col items-center justify-center bg-white border shadow-md rounded-lg w-full max-w-[350px] h-auto p-3 sm:p-4">
            {showQrCode(booking || undefined) && (
              <article style={{ flexGrow: '1' }}>
                <QRCodeSVG value={window.location.href} size={size} bgColor="#ffffff" fgColor="#000000" level="H" />
              </article>
            )}
            <p className="text-center text-customText text-xs sm:text-sm wrap mt-2">
              Show this QR code to the person in charge to verify your booking
            </p>
          </div>
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-base sm:text-lg font-semibold text-customText">
            Status: <span className="text-green-600">{booking?.bookingStatus}</span>
          </p>
        </div>
        <div className="space-y-2 sm:space-y-3 text-gray-700">
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-500 w-[120px] sm:w-[150px] mr-4 sm:mr-16">Payment Status:</span>
            <span className="font-semibold text-green-600">{booking?.paymentStatus}</span>
          </div>
          <hr className="border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-500 w-[120px] sm:w-[150px] mr-4 sm:mr-16">Booking Ref. No:</span>
            <span className="font-bold text-xs sm:text-base">{booking?.referenceNo}</span>
          </div>
          <hr className="border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-500 w-[120px] sm:w-[150px] mr-4 sm:mr-16">Booking ID:</span>
            <span className="text-xs sm:text-base">{booking?.id}</span>
          </div>
          <hr className="border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-500 w-[120px] sm:w-[150px] mr-4 sm:mr-16">Booking Date:</span>
            <span className="text-xs sm:text-base">
              {toPhilippinesTime(booking?.createdAtIso || '', DATE_SECONDARY_DEFAULT_FORMAT)}
            </span>
          </div>
          <hr className="border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-500 w-[120px] sm:w-[150px] mr-4 sm:mr-16">Contact Number:</span>
            <span className="text-xs sm:text-base">{booking?.contactMobile}</span>
          </div>
          <hr className="border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-500 w-[120px] sm:w-[150px] mr-4 sm:mr-16">Email Address:</span>
            <span className="text-xs sm:text-base break-all">{booking?.contactEmail}</span>
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col sm:flex-row items-center justify-center w-full space-y-3 sm:space-y-0 sm:space-x-4 mt-6 mb-8"> */}
      {/* Print Receipt Button */}
      {/* <Button
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <span className="text-customText text-sm font-medium">Print Receipt</span>
          <CiReceipt className="text-gray-500 ml-2" />
        </Button> */}

      {/* Print Itinerary Button */}
      {/* <Button
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <span className="text-customText text-sm font-medium">Print Itinerary</span>
          <MdLocalPrintshop className="text-gray-500 ml-2" />
        </Button> */}
      {/* </div> */}
    </div>
  );
}
