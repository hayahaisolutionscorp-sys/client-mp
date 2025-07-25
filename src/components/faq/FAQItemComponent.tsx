'use client';

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { hexToRgb } from 'helpers/theme.helpers';
import { FAQItem } from '@/app/faq/faq.data';

interface FAQItemComponentProps {
  faq: FAQItem;
  themeColor: string;
}

const formatAnswer = (answer: string, color: string) => {
  // Replace <br> and <br/> with actual newline characters
  const normalizedAnswer = answer.replace(/<br\s*\/?>/gi, '\n');

  const convertLinksInText = (text: string) => {
    const websitePattern = /(nvqsd)(?:\[([^\]]+)\])?/gi;
    const modifiedText = text.replace(websitePattern, (match) => {
      return `<a href="https://nvqsd.bai.gov.ph/">${match}</a>`;
    });

    const parts = modifiedText.split(/(<a[^>]*>.*?<\/a>)/gi);

    return parts.map((part, index) => {
      if (part?.startsWith('<a')) {
        const hrefMatch = part.match(/href="([^"]+)"/);
        const textMatch = part.match(/>([^<]+)</);
        if (hrefMatch && textMatch) {
          return (
            <a
              key={index}
              href={hrefMatch[1]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-customBlue hover:text-blue-700 underline"
            >
              {textMatch[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  return normalizedAnswer.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('•')) {
      return (
        <div key={index} className="flex items-start space-x-2 mt-2">
          <span
            className="text-[rgba(var(--bg-color),1)] ml-4"
            style={
              {
                '--bg-color': hexToRgb(color)
              } as React.CSSProperties
            }
          >
            •
          </span>
          <span>{convertLinksInText(trimmedLine.substring(1).trim())}</span>
        </div>
      );
    }
    return (
      <p key={index} className={index > 0 ? 'mt-4' : ''}>
        {convertLinksInText(trimmedLine)}
      </p>
    );
  });
};

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
          className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 py-4 text-gray-600 border-t border-gray-100 animate-fade-in">
          <div className="space-y-1">{formatAnswer(faq.answer, themeColor)}</div>
        </div>
      )}
    </div>
  );
}
