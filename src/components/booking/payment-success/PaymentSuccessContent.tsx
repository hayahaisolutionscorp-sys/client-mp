'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { useThemeSettings } from '@/hooks/theme-settings';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { reconcilePaymongoBooking } from '@/services/booking/payment.service';

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const tenantId = searchParams.get('tenant_id');
  const themeSettings = useThemeSettings();
  const [countdown, setCountdown] = useState(5);
  const [reconciling, setReconciling] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push('/booking/destination');
      return;
    }

    let cancelled = false;
    // Reconcile against PayMongo before showing the booking page so the
    // booking is flipped to `completed` even if the webhook is delayed.
    // Capped at ~6s so a hung gateway doesn't block the redirect forever.
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, 6000),
    );
    Promise.race([reconcilePaymongoBooking(bookingId), timeoutPromise]).finally(() => {
      if (!cancelled) setReconciling(false);
    });

    return () => {
      cancelled = true;
    };
  }, [bookingId, router]);

  useEffect(() => {
    if (!bookingId || reconciling) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [bookingId, reconciling]);

  useEffect(() => {
    if (!bookingId || reconciling) return;
    if (countdown > 0) return;
    router.push(`/booking/confirmed/${bookingId}${tenantId ? `?tenant_id=${tenantId}` : ''}`);
  }, [countdown, bookingId, tenantId, reconciling, router]);

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
          {reconciling ? 'Confirming your payment…' : 'Payment Successful!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {reconciling
            ? 'Verifying with the payment gateway. This usually takes a few seconds.'
            : 'Your payment has been processed successfully. Your booking is now confirmed.'}
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Booking ID</p>
          <p className="text-lg font-semibold text-gray-800">{bookingId}</p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {reconciling
            ? 'Please wait…'
            : `Redirecting to booking details in ${countdown} seconds...`}
        </p>

        <Button
          onClick={() => router.push(`/booking/confirmed/${bookingId}${tenantId ? `?tenant_id=${tenantId}` : ''}`)}
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
