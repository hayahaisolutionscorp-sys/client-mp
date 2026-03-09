'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useThemeSettings } from '@/hooks/theme-settings';

export type PaymentMethodType = 'credit-card' | 'maya' | 'gcash' | 'grabpay' | 'online-banking' | 'qrph';

interface PaymentMethod {
  id: PaymentMethodType;
  label: string;
  icon: string;
  altText: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    label: 'Credit / Debit Card',
    icon: '/assets/icons/visa-mastercard.svg',
    altText: 'Credit/Debit Card'
  },
  {
    id: 'maya',
    label: 'Maya',
    icon: '/assets/icons/maya.svg',
    altText: 'Maya'
  },
  {
    id: 'gcash',
    label: 'GCash',
    icon: '/assets/icons/gcash.svg',
    altText: 'GCash'
  },
  {
    id: 'grabpay',
    label: 'GrabPay',
    icon: '/assets/icons/grabpay.svg',
    altText: 'GrabPay'
  },
  {
    id: 'online-banking',
    label: 'Online Banking',
    icon: '/assets/icons/online-banking.svg',
    altText: 'Online Banking'
  },
  {
    id: 'qrph',
    label: 'QR Ph',
    icon: '/assets/icons/qrph.svg',
    altText: 'QR Ph'
  }
];

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethodType;
  onMethodChange?: (method: PaymentMethodType) => void;
}

export default function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange 
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethodType>(selectedMethod || 'credit-card');
  const themeSettings = useThemeSettings();

  const handleSelect = (methodId: PaymentMethodType) => {
    setSelected(methodId);
    onMethodChange?.(methodId);
  };

  const accentColor = themeSettings?.accent || '#23abff';

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-customText">
        Select Payment Method
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const isSelected = selected === method.id;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelect(method.id)}
              className={`
                relative flex flex-col items-center justify-center
                p-4 sm:p-6 rounded-lg border-2 transition-all
                hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isSelected 
                  ? 'border-[var(--accent)] bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              style={{
                '--accent': accentColor,
                borderColor: isSelected ? accentColor : undefined,
                focusRingColor: accentColor
              } as React.CSSProperties}
              aria-pressed={isSelected}
              aria-label={`Select ${method.label}`}
            >
              {/* Radio Button Indicator */}
              <div 
                className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? accentColor : '#d1d5db'
                }}
              >
                {isSelected && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </div>

              {/* Payment Method Icon - Placeholder */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
                <div 
                  className="w-full h-full flex items-center justify-center text-4xl font-bold"
                  style={{ color: isSelected ? accentColor : '#6b7280' }}
                >
                  {method.id === 'credit-card' && '💳'}
                  {method.id === 'maya' && '🅼'}
                  {method.id === 'gcash' && '🅶'}
                  {method.id === 'grabpay' && '🟢'}
                  {method.id === 'online-banking' && '🏦'}
                  {method.id === 'qrph' && '📱'}
                </div>
              </div>

              {/* Payment Method Label */}
              <span 
                className={`text-sm sm:text-base font-medium text-center ${
                  isSelected ? 'text-customText' : 'text-gray-600'
                }`}
              >
                {method.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
