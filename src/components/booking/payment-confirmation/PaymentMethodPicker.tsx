'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { EnabledPaymentProvider } from '@/services/booking/payment.service';

// Method code → display metadata
const METHOD_META: Record<string, { label: string; logo: string }> = {
  gcash:    { label: 'GCash',                logo: '/assets/images/GCash-Logo.jpg' },
  paymaya:  { label: 'PayMaya',              logo: '/assets/images/maya_logo.jpg' },
  qrph:     { label: 'QR Ph',                logo: '/assets/images/QR_Ph_Logo.svg' },
  dob:      { label: 'Online Banking',       logo: '/assets/images/online_banking_logo.png' },
  grab_pay: { label: 'GrabPay',              logo: '/assets/images/grab_pay_logo.png' },
  card:     { label: 'Credit / Debit Card',  logo: '' },
};

// Provider code → display metadata
const PROVIDER_META: Record<string, { label: string; accent: string }> = {
  paymongo: { label: 'PayMongo', accent: '#0069ff' },
  maya:     { label: 'Maya',     accent: '#00b67a' },
};

export type PaymentPickerMethod = string;

interface Props {
  providers: EnabledPaymentProvider[];
  selected: PaymentPickerMethod | null;
  onChange: (method: PaymentPickerMethod) => void;
}

export default function PaymentMethodPicker({ providers, selected, onChange }: Props) {
  if (!providers || providers.length === 0) return null;
  const totalMethods = providers.reduce((sum, p) => sum + p.methods.length, 0);
  if (totalMethods === 0) return null;

  return (
    <div
      className="rounded-xl border border-gray-200 p-5 sm:p-6 mb-4"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-gray-400" />
        <h2 className="text-sm sm:text-base font-semibold tracking-tight" style={{ color: '#1f2937' }}>
          Choose Payment Method
        </h2>
      </div>

      <div className="space-y-5">
        {providers.map((provider) => {
          if (provider.methods.length === 0) return null;
          const providerMeta = PROVIDER_META[provider.code];
          const accent = providerMeta?.accent ?? '#6b7280';

          return (
            <div key={provider.code}>
              {/* Provider header — text + colored dot, no image (provider logos
                  are not bundled, so we avoid broken-image placeholders). */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#374151' }}
                >
                  {providerMeta?.label ?? provider.name}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
              </div>

              {/* Methods grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {provider.methods.map((method) => {
                  const meta = METHOD_META[method.code];
                  const isSelected = selected === method.code;

                  return (
                    <button
                      key={method.code}
                      type="button"
                      onClick={() => onChange(method.code)}
                      aria-pressed={isSelected}
                      aria-label={`Pay with ${meta?.label ?? method.name}`}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-1',
                      )}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        borderColor: isSelected ? accent : '#e5e7eb',
                        boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.08)' : undefined,
                      }}
                    >
                      {/* Selection indicator */}
                      <div
                        className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: isSelected ? accent : '#d1d5db', backgroundColor: '#ffffff' }}
                      >
                        {isSelected && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                        )}
                      </div>

                      {/* Logo */}
                      {meta?.logo ? (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: '#ffffff' }}
                        >
                          <Image
                            src={meta.logo}
                            alt={meta.label ?? method.name}
                            width={48}
                            height={48}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#f3f4f6' }}
                        >
                          <span className="text-lg font-bold" style={{ color: '#9ca3af' }}>
                            {(method.name ?? method.code).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Label */}
                      <span
                        className="text-[11px] sm:text-xs font-semibold text-center leading-tight line-clamp-2"
                        style={{ color: '#374151' }}
                      >
                        {meta?.label ?? method.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {selected && (
        <div
          className="mt-4 pt-4 flex items-center gap-2"
          style={{ borderTop: '1px solid #f3f4f6' }}
        >
          <span className="text-xs" style={{ color: '#6b7280' }}>Selected:</span>
          <Badge
            variant="outline"
            className="text-xs font-semibold"
            style={{ borderColor: '#9ca3af', color: '#374151', backgroundColor: '#ffffff' }}
          >
            {METHOD_META[selected]?.label ?? selected}
          </Badge>
        </div>
      )}
    </div>
  );
}
