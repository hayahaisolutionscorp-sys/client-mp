'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useThemeSettings } from '@/hooks/theme-settings';
import type { EnabledPaymentProvider } from '@/services/booking/payment.service';

// Method code → display metadata
const METHOD_META: Record<string, { label: string; logo: string; logoBg: string }> = {
  gcash:    { label: 'GCash',               logo: '/assets/images/GCash-Logo.jpg',          logoBg: '#ffffff' },
  paymaya:  { label: 'PayMaya',             logo: '/assets/images/maya_logo.jpg',           logoBg: '#000000' },
  qrph:     { label: 'QR Ph',              logo: '/assets/images/QR_Ph_Logo.svg',          logoBg: '#ffffff' },
  dob:      { label: 'Online Banking',     logo: '/assets/images/online_banking_logo.png', logoBg: '#ffffff' },
  grab_pay: { label: 'GrabPay',            logo: '/assets/images/grab_pay_logo.png',       logoBg: '#ffffff' },
  card:     { label: 'Credit / Debit Card',logo: '/assets/images/visa_logo.png',           logoBg: '#ffffff' },
};

// Provider code → display metadata (logo / brand colour)
const PROVIDER_META: Record<string, { label: string; logo: string; accent: string }> = {
  paymongo: { label: 'PayMongo', logo: '/assets/images/paymongo_logo.png', accent: '#0069ff' },
  maya:     { label: 'Maya',     logo: '/assets/images/maya_logo.jpg',     accent: '#00b67a' },
};

export type PaymentPickerMethod = string; // dynamic from DB now

interface Props {
  providers: EnabledPaymentProvider[];
  selected: PaymentPickerMethod | null;
  onChange: (method: PaymentPickerMethod) => void;
}

export default function PaymentMethodPicker({ providers, selected, onChange }: Props) {
  const themeSettings = useThemeSettings();
  const accent = themeSettings?.accent || '#23abff';

  if (!providers || providers.length === 0) return null;

  // If only one provider with one method, no picker needed (auto-selected upstream)
  const totalMethods = providers.reduce((sum, p) => sum + p.methods.length, 0);
  if (totalMethods === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 tracking-tight">
          Choose Payment Method
        </h2>
      </div>

      <div className="space-y-5">
        {providers.map((provider) => {
          if (provider.methods.length === 0) return null;
          const providerMeta = PROVIDER_META[provider.code];

          return (
            <div key={provider.code}>
              {/* Provider header */}
              <div className="flex items-center gap-2 mb-3">
                {providerMeta?.logo ? (
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100"
                    style={{ backgroundColor: '#fff' }}
                  >
                    <Image
                      src={providerMeta.logo}
                      alt={providerMeta.label ?? provider.name}
                      width={28}
                      height={28}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : null}
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {providerMeta?.label ?? provider.name}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
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
                        isSelected
                          ? 'shadow-md bg-blue-50/60 scale-[1.02]'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]'
                      )}
                      style={{
                        borderColor: isSelected ? accent : undefined,
                      }}
                    >
                      {/* Selection indicator */}
                      <div
                        className={cn(
                          'absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all',
                        )}
                        style={{ borderColor: isSelected ? accent : '#d1d5db' }}
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
                          style={{ backgroundColor: meta.logoBg ?? '#f3f4f6' }}
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
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-400">
                            {method.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Label */}
                      <span className="text-[11px] sm:text-xs font-semibold text-center text-gray-700 leading-tight line-clamp-2">
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
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
          <span className="text-xs text-gray-500">Selected:</span>
          <Badge variant="outline" className="text-xs font-semibold" style={{ borderColor: accent, color: accent }}>
            {METHOD_META[selected]?.label ?? selected}
          </Badge>
        </div>
      )}
    </div>
  );
}
