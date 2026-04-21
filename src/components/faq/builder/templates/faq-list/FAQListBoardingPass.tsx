'use client';

import { useState } from 'react';
import type { IFaq } from '@/models';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface FAQListBoardingPassProps {
  faqs: IFaq[];
  categories: string[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function FAQListBoardingPass({
  faqs,
  categories,
  primaryColor,
  textColor,
  mutedColor,
}: FAQListBoardingPassProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(
    (faq) => activeCategory === 'All' || faq.category === activeCategory
  );

  return (
    <div className="mx-auto max-w-3xl px-2 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          ★ Manifest
        </span>
        <span className="flex-1 h-[2px] border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.2)' }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textColor }}>
          {String(filteredFaqs.length).padStart(2, '0')} · Entries
        </span>
      </div>

      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.25em] font-black px-3 py-1.5 border-2 transition-all',
                  isActive ? 'text-white' : 'hover:-translate-y-[1px]'
                )}
                style={{
                  borderColor: isActive ? primaryColor : 'rgba(15,23,42,0.2)',
                  backgroundColor: isActive ? primaryColor : 'transparent',
                  color: isActive ? '#fff' : textColor,
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.id}
              className={cn(
                'relative rounded-xl border-2 overflow-hidden transition-all',
                isOpen && 'shadow-[0_14px_28px_-14px_rgba(15,23,42,0.2)]'
              )}
              style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
              >
                <div
                  className="shrink-0 w-14 text-center font-mono text-[10px] uppercase tracking-[0.2em] font-black py-2 border-2 border-dashed rounded-md"
                  style={{ borderColor: 'rgba(15,23,42,0.2)', color: primaryColor }}
                >
                  Q·{String(index + 1).padStart(2, '0')}
                </div>
                <span className="flex-1 text-base font-bold pr-2" style={{ color: textColor }}>
                  {faq.question}
                </span>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 transition-transform"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    borderColor: primaryColor,
                    color: primaryColor,
                    backgroundColor: isOpen ? primaryColor + '18' : 'transparent',
                  }}
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={3} />
                </div>
              </button>
              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-5 pt-0 sm:px-5">
                    <div className="border-t-2 border-dashed pt-4" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                      <div
                        className="prose prose-sm max-w-none text-[15px] leading-relaxed"
                        style={{ color: mutedColor }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: 'rgba(15,23,42,0.2)' }}>
            <p className="font-mono text-sm uppercase tracking-[0.2em] opacity-60" style={{ color: mutedColor }}>
              ··· No entries in this category ···
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
