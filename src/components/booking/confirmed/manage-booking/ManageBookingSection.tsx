'use client';

import { useState, useEffect, useCallback } from 'react';
import { IBooking } from '@/models';
import { IPassengerRequest, RequestType } from '@/models/passenger-request/passenger-request.model';
import { getPassengerRequestsByBookingId } from '@/services/passenger-requests/passenger-requests.service';
import { SuccessModal } from '@/components/ui/SuccessModal';
import RequestRefundModal from './RequestRefundModal';
import RequestRebookModal from './RequestRebookModal';
import RequestUpgradeDowngradeModal from './RequestUpgradeDowngradeModal';
import RequestHistoryList from './RequestHistoryList';

interface Props {
  booking: IBooking;
}

const SUCCESS_MESSAGES: Record<RequestType, { title: string; description: string }> = {
  REFUND: {
    title: 'Refund request submitted',
    description:
      'Staff will review your refund and process it on the original payment method when applicable.',
  },
  REBOOK: {
    title: 'Rebook submitted',
    description:
      "We've received your rebook. If a refund is owed, staff will process it back to your original payment method.",
  },
  UPGRADE_DOWNGRADE: {
    title: 'Cabin change submitted',
    description: 'Your cabin change has been recorded.',
  },
};

export default function ManageBookingSection({ booking }: Props) {
  const [requests, setRequests] = useState<IPassengerRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [openModal, setOpenModal] = useState<RequestType | null>(null);
  const [successType, setSuccessType] = useState<RequestType | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!booking.id) return;
    setLoadingRequests(true);
    try {
      const data = await getPassengerRequestsByBookingId(booking.id);
      setRequests(data);
    } catch {
      // silently ignore — history is non-critical
    } finally {
      setLoadingRequests(false);
    }
  }, [booking.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const hasPendingOfType = (type: RequestType) =>
    requests.some((r) => r.requestType === type && r.status === 'PENDING');

  const handleSuccess = (type: RequestType) => {
    setSuccessType(type);
    fetchRequests();
  };

  if (booking.bookingStatus !== 'Confirmed') return null;

  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-3">Manage Booking</h2>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setOpenModal('REFUND')}
          disabled={hasPendingOfType('REFUND')}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {hasPendingOfType('REFUND') ? 'Request Refund pending…' : 'Request Refund'}
        </button>

        <button
          onClick={() => setOpenModal('REBOOK')}
          disabled={hasPendingOfType('REBOOK')}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {hasPendingOfType('REBOOK') ? 'Rebook pending…' : 'Rebook trip'}
        </button>

        <button
          onClick={() => setOpenModal('UPGRADE_DOWNGRADE')}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Change cabin
        </button>
      </div>

      {loadingRequests ? (
        <p className="text-xs text-gray-400 mt-3">Loading request history...</p>
      ) : (
        <RequestHistoryList
          requests={requests}
          onRequestCancelled={fetchRequests}
        />
      )}

      {openModal === 'REFUND' && (
        <RequestRefundModal
          isOpen
          onClose={() => setOpenModal(null)}
          booking={booking}
          onSuccess={() => handleSuccess('REFUND')}
        />
      )}

      {openModal === 'REBOOK' && (
        <RequestRebookModal
          isOpen
          onClose={() => setOpenModal(null)}
          booking={booking}
          onSuccess={() => handleSuccess('REBOOK')}
        />
      )}

      {openModal === 'UPGRADE_DOWNGRADE' && (
        <RequestUpgradeDowngradeModal
          isOpen
          onClose={() => setOpenModal(null)}
          booking={booking}
          onSuccess={() => handleSuccess('UPGRADE_DOWNGRADE')}
        />
      )}

      {successType && (
        <SuccessModal
          isOpen
          onClose={() => setSuccessType(null)}
          title={SUCCESS_MESSAGES[successType].title}
          description={SUCCESS_MESSAGES[successType].description}
        />
      )}
    </div>
  );
}
