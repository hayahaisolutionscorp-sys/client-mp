'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { useThemeSettings } from '@/hooks/theme-settings';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const themeSettings = useThemeSettings();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!bookingId) {
      router.push('/booking/destination');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/booking/confirmed/${bookingId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingId, router]);

  if (!bookingId) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaCheckCircle 
            className="mx-auto text-6xl" 
            style={{ color: themeSettings?.primaryColor || '#23abff' }}
          />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Your booking is now confirmed.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Booking ID</p>
          <p className="text-lg font-semibold text-gray-800">{bookingId}</p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Redirecting to booking details in {countdown} seconds...
        </p>

        <Button
          onClick={() => router.push(`/booking/confirmed/${bookingId}`)}
          style={{ backgroundColor: themeSettings?.primaryColor || '#23abff' }}
          className="w-full"
        >
          View Booking Details
        </Button>

        <Button
          onClick={() => router.push('/booking/destination')}
          variant="outline"
          className="w-full mt-3"
        >
          Book Another Trip
        </Button>
      </div>
    </div>
  );
}
