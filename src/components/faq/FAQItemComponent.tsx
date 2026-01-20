'use client';

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { IFaq } from '@/models';
import TipTapRenderer from '@/components/shared/TipTapRenderer';

interface FAQItemComponentProps {
  faq: IFaq;
  themeColor: string;
}

export default function FAQItemComponent({ faq, themeColor }: FAQItemComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleQuestion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        onClick={toggleQuestion}
        className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
        <IoIosArrowDown
          className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 py-4 text-gray-600 border-t border-gray-100 animate-fade-in">
          <TipTapRenderer content={faq.answer} />
        </div>
      )}
    </div>
  );
}
