'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { IPassengerRequest, RequestStatus, RequestType } from '@/models/passenger-request/passenger-request.model';
import { cancelPassengerRequest } from '@/services/passenger-requests/passenger-requests.service';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  REFUND: 'Refund',
  REBOOK: 'Rebook',
  UPGRADE_DOWNGRADE: 'Upgrade/Downgrade',
};

const STATUS_STYLES: Record<RequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

interface Props {
  requests: IPassengerRequest[];
  onRequestCancelled: () => void;
}

export default function RequestHistoryList({ requests, onRequestCancelled }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  if (requests.length === 0) return null;

  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleCancel = (id: string) => {
    setPendingCancelId(id);
  };

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    const id = pendingCancelId;
    setCancelling(id);
    try {
      await cancelPassengerRequest(id);
      onRequestCancelled();
      setPendingCancelId(null);
    } catch {
      alert('Failed to cancel request. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        onClick={() => setExpanded((v) => !v)}
      >
        <span>Request History ({requests.length})</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <ul className="divide-y">
          {sorted.map((req) => (
            <li key={req.id} className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {REQUEST_TYPE_LABEL[req.requestType]}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[req.status]}`}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {req.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(req.id)}
                    disabled={cancelling === req.id}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    {cancelling === req.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
              {req.status === 'REJECTED' && req.staffRemarks && (
                <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                  Staff note: {req.staffRemarks}
                </p>
              )}
              {req.passengerRemarks && (
                <p className="text-xs text-gray-500 italic">"{req.passengerRemarks}"</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmationModal
        isOpen={!!pendingCancelId}
        onClose={() => !cancelling && setPendingCancelId(null)}
        onConfirm={confirmCancel}
        title="Cancel this request?"
        description="This action cannot be undone. The request will be marked as cancelled and removed from staff review."
        confirmText="Yes, cancel request"
        cancelText="Keep request"
        variant="destructive"
        isLoading={!!cancelling}
      />
    </div>
  );
}
