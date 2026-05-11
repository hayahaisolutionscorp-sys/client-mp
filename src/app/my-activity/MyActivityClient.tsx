'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Ship,
  CreditCard,
  Banknote,
  ArrowUp,
  ArrowDown,
  Inbox,
  ArrowRight,
  Users,
  Armchair,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import {
  IPassengerRequest,
  IPassengerRequestTrip,
  RequestStatus,
  RequestType,
} from '@/models/passenger-request/passenger-request.model';
import {
  cancelPassengerRequest,
  getMyPassengerRequests,
} from '@/services/passenger-requests/passenger-requests.service';
import {
  getMyPassengerActions,
  IPassengerAction,
} from '@/services/passenger-actions/passenger-actions.service';

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  REFUND: 'Refund',
  REBOOK: 'Rebook',
  UPGRADE_DOWNGRADE: 'Upgrade / Downgrade',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  APPROVED_PENDING_GATEWAY: 'bg-blue-100 text-blue-800 border-blue-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800 border-amber-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
};

const ACTION_LABELS: Record<string, string> = {
  REBOOK_UPGRADE: 'Rebook Upgrade',
  CABIN_UPGRADE: 'Cabin Upgrade',
  CABIN_DOWNGRADE: 'Cabin Downgrade',
};

const ACTION_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
};

const fmtCurrency = (n: number | string | null | undefined) => {
  if (n == null) return '—';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '—';
  return `₱${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const passengerName = (p?: { firstName?: string | null; lastName?: string | null } | null) => {
  if (!p) return 'Passenger';
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Passenger';
};

function TripLine({ trip, label }: { trip?: IPassengerRequestTrip | null; label?: string }) {
  if (!trip) return null;
  return (
    <div className="space-y-0.5">
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      )}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="font-mono font-semibold">{trip.srcPortCode || '—'}</span>
        <ArrowRight className="h-3 w-3 text-gray-400" />
        <span className="font-mono font-semibold">{trip.destPortCode || '—'}</span>
        {trip.shipName && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
            <Ship className="h-3 w-3" />
            {trip.shipName}
          </span>
        )}
      </div>
      {trip.departureDate && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {fmtDate(trip.departureDate)}
        </p>
      )}
    </div>
  );
}

const PAGE_SIZE = 10;

type ActivityTab = 'requests' | 'actions';

const ACTION_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'CABIN_UPGRADE', label: 'Cabin Upgrade' },
  { value: 'CABIN_DOWNGRADE', label: 'Cabin Downgrade' },
  { value: 'REBOOK_UPGRADE', label: 'Rebook Upgrade' },
];

const ACTION_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_PAYMENT', label: 'Awaiting payment' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
];

export default function MyActivityClient() {
  const [tab, setTab] = useState<ActivityTab>('requests');
  const [requests, setRequests] = useState<IPassengerRequest[]>([]);
  const [actions, setActions] = useState<IPassengerAction[]>([]);
  const [total, setTotal] = useState(0);
  const [actionsTotal, setActionsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'ALL'>('ALL');
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('ALL');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [actionsPage, setActionsPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'requests') {
        const data = await getMyPassengerRequests({
          page,
          limit: PAGE_SIZE,
          request_type: typeFilter !== 'ALL' ? typeFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: search.trim() || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
        });
        setRequests(Array.isArray(data?.results) ? data.results : []);
        setTotal(Number(data?.total ?? 0));
      } else {
        const a = await getMyPassengerActions({
          page: actionsPage,
          limit: PAGE_SIZE,
          action_type: actionTypeFilter !== 'ALL' ? actionTypeFilter : undefined,
          status: actionStatusFilter !== 'ALL' ? actionStatusFilter : undefined,
          search: search.trim() || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
        });
        setActions(Array.isArray(a?.results) ? a.results : []);
        setActionsTotal(Number(a?.total ?? 0));
      }
    } catch {
      setError('Could not load your activity. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [
    tab,
    page,
    actionsPage,
    typeFilter,
    statusFilter,
    actionTypeFilter,
    actionStatusFilter,
    search,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset to page 1 when filters change (other than `page` itself)
  useEffect(() => {
    setPage(1);
    setActionsPage(1);
  }, [
    tab,
    typeFilter,
    statusFilter,
    actionTypeFilter,
    actionStatusFilter,
    search,
    dateFrom,
    dateTo,
  ]);

  // Debounce search input → applied search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Sync the unified date range picker → existing dateFrom / dateTo state
  useEffect(() => {
    setDateFrom(dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '');
    setDateTo(dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '');
  }, [dateRange]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const actionsTotalPages = Math.max(1, Math.ceil(actionsTotal / PAGE_SIZE));

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCancel = (id: string) => {
    setPendingCancelId(id);
  };

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    const id = pendingCancelId;
    setCancelling(id);
    try {
      await cancelPassengerRequest(id);
      await fetchRequests();
      setPendingCancelId(null);
    } catch {
      alert('Failed to cancel the request. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  // Server-side filtering & pagination — `requests` is already the current page.
  const filtered = requests;
  const hasActiveFilters =
    (tab === 'requests'
      ? statusFilter !== 'ALL' || typeFilter !== 'ALL'
      : actionStatusFilter !== 'ALL' || actionTypeFilter !== 'ALL') ||
    search.trim() !== '' ||
    !!dateFrom ||
    !!dateTo;
  const clearFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setActionStatusFilter('ALL');
    setActionTypeFilter('ALL');
    setSearchInput('');
    setSearch('');
    setDateRange(undefined);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-[120px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track refund and rebook requests, plus self-serve actions like cabin upgrades and
          downgrades. Cancel any request that&apos;s still pending.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b flex gap-1">
        <button
          type="button"
          onClick={() => setTab('requests')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'requests'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Requests
          {tab === 'requests' && total > 0 && (
            <span className="ml-2 text-[11px] text-gray-400">({total})</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('actions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'actions'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Self-serve actions
          {tab === 'actions' && actionsTotal > 0 && (
            <span className="ml-2 text-[11px] text-gray-400">({actionsTotal})</span>
          )}
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-5 shadow-sm">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by booking reference..."
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md pl-9 pr-9 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1">Status</label>
            {tab === 'requests' ? (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'ALL')}
                className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            ) : (
              <select
                value={actionStatusFilter}
                onChange={(e) => setActionStatusFilter(e.target.value)}
                className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ACTION_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1">Type</label>
            {tab === 'requests' ? (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as RequestType | 'ALL')}
                className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="REFUND">Refund</option>
                <option value="REBOOK">Rebook</option>
                <option value="UPGRADE_DOWNGRADE">Upgrade / Downgrade</option>
              </select>
            ) : (
              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
                className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ACTION_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1">Date range</label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className={dateRange?.from ? 'text-gray-900' : 'text-gray-400'}>
                    {dateRange?.from
                      ? dateRange.to
                        ? `${format(dateRange.from, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}`
                        : format(dateRange.from, 'MMM d, yyyy')
                      : 'Pick a date range'}
                  </span>
                  {dateRange?.from && (
                    <X
                      className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDateRange(undefined);
                      }}
                    />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-md"
              >
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="p-3 bg-white text-gray-900 rdp-marketplace"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your requests...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-4">{error}</p>
      )}

      {!loading && !error && tab === 'requests' && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Inbox className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">
            {requests.length === 0
              ? "You haven't submitted any requests yet."
              : 'No requests match the current filters.'}
          </p>
        </div>
      )}

      {!loading && !error && tab === 'actions' && actions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Inbox className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">
            {actionsTotal === 0
              ? "You haven't completed any self-serve actions yet."
              : 'No actions match the current filters.'}
          </p>
        </div>
      )}

      {!loading && !error && tab === 'actions' && actions.length > 0 && (
        <ul className="space-y-3">
          {actions.map((a) => (
            <li
              key={a.id}
              className="border rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                      {ACTION_LABELS[a.actionType] ?? a.actionType}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        STATUS_STYLES[a.status] ??
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {ACTION_STATUS_LABELS[a.status] ?? a.status}
                    </span>
                    {a.bookingReferenceNo && (
                      <span className="text-xs text-gray-500 font-mono">
                        {a.bookingReferenceNo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    <Calendar className="h-3 w-3" />
                    {fmtDate(a.createdAt)}
                    {a.amountPaid > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Paid {fmtCurrency(a.amountPaid)}
                        {a.gatewayCode ? ` via ${a.gatewayCode}` : ''}
                      </span>
                    )}
                    {a.amountPaid === 0 && a.actionType === 'CABIN_DOWNGRADE' && (
                      <span className="text-gray-500">No payment required</span>
                    )}
                  </p>
                  {a.oldTotal != null && a.newTotal != null && (
                    <p className="text-xs text-gray-500">
                      {fmtCurrency(a.oldTotal)} → {fmtCurrency(a.newTotal)}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && tab === 'requests' && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((req) => {
            const isExpanded = expanded.has(req.id);
            const isCancellable = req.status === 'PENDING';
            const trip = req.currentTrip;
            const newTrip = req.newTrip;
            const passengerCount = req.items?.length ?? 0;
            const totalFareDiff = (req.items ?? []).reduce(
              (acc, it) => acc + (Number(it.fareDifference) || 0),
              0,
            );

            return (
              <li
                key={req.id}
                className="border rounded-lg bg-white shadow-sm overflow-hidden"
              >
                {/* Important details (always visible) */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        {REQUEST_TYPE_LABELS[req.requestType]}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[req.status]}`}
                      >
                        {req.status}
                      </span>
                      {req.bookingReferenceNo && (
                        <span className="text-xs text-gray-500 font-mono">
                          {req.bookingReferenceNo}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{fmtDate(req.createdAt)}</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <TripLine trip={trip} label="Current Trip" />
                    {req.requestType === 'REBOOK' && newTrip && (
                      <TripLine trip={newTrip} label="Requested New Trip" />
                    )}
                    {req.requestType === 'UPGRADE_DOWNGRADE' && req.newCabin && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          New Cabin
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {req.newCabin.cabinName || `Cabin #${req.newCabin.cabinId}`}
                          {req.newCabin.cabinTypeName && (
                            <span className="text-xs text-gray-500">
                              ({req.newCabin.cabinTypeName})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-xs text-gray-600 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {passengerCount} passenger{passengerCount === 1 ? '' : 's'}
                    </span>
                    {req.requestType === 'REBOOK' && req.rebookingFee != null && (
                      <span className="inline-flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Rebooking fee: <strong>{fmtCurrency(req.rebookingFee)}</strong>
                      </span>
                    )}
                    {req.requestType === 'UPGRADE_DOWNGRADE' && totalFareDiff !== 0 && (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          totalFareDiff > 0 ? 'text-orange-600' : 'text-green-600'
                        }`}
                      >
                        {totalFareDiff > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        Fare diff: {fmtCurrency(Math.abs(totalFareDiff))}
                        {totalFareDiff > 0 ? ' (you pay)' : ' (refund)'}
                      </span>
                    )}
                    {req.requestType === 'REFUND' && req.refundMethod && (
                      <span className="inline-flex items-center gap-1">
                        <Banknote className="h-3 w-3 text-green-600" />
                        {req.refundMethod}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(req.id)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 border-t pt-2"
                  >
                    {isExpanded ? (
                      <>
                        Hide details <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Show all details <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>

                {/* Full details (expandable) */}
                {isExpanded && (
                  <div className="border-t px-4 py-3 space-y-3 bg-gray-50">
                    {/* Passengers list */}
                    {(req.items?.length ?? 0) > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Passengers
                        </p>
                        <ul className="text-sm space-y-1.5">
                          {req.items.map((it) => (
                            <li
                              key={it.id}
                              className="flex flex-wrap items-center gap-2 bg-white border rounded px-2 py-1.5"
                            >
                              <span className="font-medium">{passengerName(it.passenger)}</span>
                              {it.passenger?.cabinName && (
                                <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {it.passenger.cabinName}
                                </span>
                              )}
                              {it.passenger?.seatId && (
                                <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                                  <Armchair className="h-3 w-3" />
                                  {it.passenger.seatId}
                                </span>
                              )}
                              {it.newSeatId && (
                                <span className="text-xs text-blue-700 inline-flex items-center gap-1">
                                  <Armchair className="h-3 w-3" />→ {it.newSeatId}
                                </span>
                              )}
                              {it.passenger?.totalPrice != null && (
                                <span className="text-xs text-gray-500">
                                  Paid: {fmtCurrency(it.passenger.totalPrice)}
                                </span>
                              )}
                              {it.fareDifference != null && it.fareDifference !== 0 && (
                                <span
                                  className={`text-xs font-medium ${
                                    it.fareDifference > 0 ? 'text-orange-600' : 'text-green-600'
                                  }`}
                                >
                                  {it.fareDifference > 0 ? '+' : ''}
                                  {fmtCurrency(it.fareDifference)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Refund destination details */}
                    {req.requestType === 'REFUND' && req.refundMethod && (
                      <div className="text-sm space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Refund Destination
                        </p>
                        <p className="text-xs text-gray-700 flex items-center gap-1">
                          <Banknote className="h-3 w-3 text-green-600" />
                          {req.refundMethod}
                          {req.refundAccountName ? ` · ${req.refundAccountName}` : ''}
                          {req.refundAccountNumber ? ` · ${req.refundAccountNumber}` : ''}
                          {req.refundBankName ? ` (${req.refundBankName})` : ''}
                        </p>
                      </div>
                    )}

                    {/* Booking ref */}
                    <div className="text-xs text-gray-500 grid sm:grid-cols-2 gap-x-4 gap-y-1">
                      <span>
                        Booking ID: <span className="font-mono">{req.bookingId}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted {fmtDate(req.createdAt)}
                      </span>
                      {req.reviewedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Reviewed {fmtDate(req.reviewedAt)}
                        </span>
                      )}
                      {req.preferredPaymentMethod && (
                        <span>
                          Preferred payment:{' '}
                          <span className="font-medium">{req.preferredPaymentMethod}</span>
                        </span>
                      )}
                    </div>

                    {req.passengerRemarks && (
                      <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="font-semibold text-gray-700">Your remarks:</p>
                        <p className="italic text-gray-600">&ldquo;{req.passengerRemarks}&rdquo;</p>
                      </div>
                    )}

                    {req.staffRemarks && (
                      <div
                        className={`text-xs border rounded p-2 ${
                          req.status === 'REJECTED'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <p className="font-semibold text-gray-700">Staff note:</p>
                        <p className="text-gray-600">{req.staffRemarks}</p>
                      </div>
                    )}

                    {isCancellable && (
                      <div className="pt-2 border-t flex justify-end">
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={cancelling === req.id}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                          {cancelling === req.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {!loading &&
        !error &&
        ((tab === 'requests' && total > 0) ||
          (tab === 'actions' && actionsTotal > 0)) && (
          <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-500">
              {tab === 'requests'
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
                : `Showing ${(actionsPage - 1) * PAGE_SIZE + 1}–${Math.min(actionsPage * PAGE_SIZE, actionsTotal)} of ${actionsTotal}`}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  tab === 'requests'
                    ? setPage((p) => Math.max(1, p - 1))
                    : setActionsPage((p) => Math.max(1, p - 1))
                }
                disabled={
                  (tab === 'requests' ? page : actionsPage) <= 1 || loading
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="text-xs text-gray-600 px-2">
                Page{' '}
                <span className="font-semibold">
                  {tab === 'requests' ? page : actionsPage}
                </span>{' '}
                of {tab === 'requests' ? totalPages : actionsTotalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  tab === 'requests'
                    ? setPage((p) => Math.min(totalPages, p + 1))
                    : setActionsPage((p) => Math.min(actionsTotalPages, p + 1))
                }
                disabled={
                  (tab === 'requests' ? page >= totalPages : actionsPage >= actionsTotalPages) ||
                  loading
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
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

