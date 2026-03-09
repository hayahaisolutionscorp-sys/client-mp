'use client';

import Image from 'next/image';
import { useThemeSettings } from '@/hooks/theme-settings';

export type PaymentPickerMethod = 'card' | 'gcash' | 'paymaya' | 'qrph' | 'dob' | 'grab_pay';

interface Method {
  id: PaymentPickerMethod;
  label: string;
  description: string;
  logo: string;
  logoBg?: string; // optional background color for logo container
}

const METHODS: Method[] = [
  { id: 'card',     label: 'Credit / Debit Card', description: 'Via Maya',          logo: '/assets/images/visa_logo.png',          logoBg: '#ffffff' },
  { id: 'gcash',    label: 'GCash',               description: 'Via PayMongo',      logo: '/assets/images/GCash-Logo.jpg',          logoBg: '#ffffff' },
  { id: 'paymaya',  label: 'PayMaya',              description: 'Via PayMongo',      logo: '/assets/images/maya_logo.jpg',           logoBg: '#000000' },
  { id: 'qrph',     label: 'QR Ph',               description: 'Via PayMongo',      logo: '/assets/images/QR_Ph_Logo.svg',          logoBg: '#ffffff' },
  { id: 'dob',      label: 'Online Banking',        description: 'Via PayMongo',      logo: '/assets/images/online_banking_logo.png', logoBg: '#ffffff' },
  { id: 'grab_pay', label: 'GrabPay',              description: 'Via PayMongo',      logo: '/assets/images/grab_pay_logo.png',       logoBg: '#ffffff' },
];

interface Props {
  selected: PaymentPickerMethod | null;
  onChange: (method: PaymentPickerMethod) => void;
}

export default function PaymentMethodPicker({ selected, onChange }: Props) {
  const themeSettings = useThemeSettings();
  const accent = themeSettings?.accent || '#23abff';

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4">
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-customText">
        Choose Payment Method
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {METHODS.map((method) => {
          const isSelected = selected === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              aria-pressed={isSelected}
              aria-label={`Pay with ${method.label}`}
              className={`
                relative flex flex-col items-center justify-center gap-2
                p-3 rounded-lg border-2 transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-1
                ${isSelected ? 'bg-blue-50' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}
              `}
              style={{ borderColor: isSelected ? accent : undefined }}
            >
              {/* Radio indicator */}
              <div
                className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: isSelected ? accent : '#d1d5db' }}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                )}
              </div>

              {/* Logo */}
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ backgroundColor: method.logoBg || '#f3f4f6' }}
              >
                <Image
                  src={method.logo}
                  alt={method.label}
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                />
              </div>

              <span className="text-xs font-medium text-center text-customText leading-tight">
                {method.label}
              </span>
              <span className="text-xs text-gray-400 text-center leading-tight hidden sm:block">
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
