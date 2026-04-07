'use client';

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import type { IFaq } from '@/models';
import TipTapRenderer from '@/components/shared/TipTapRenderer';
import FAQCategoryTabs from '@/components/faq/FAQCategoryTabs';

interface FAQListCardsProps {
  faqs: IFaq[];
  categories: string[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

export default function FAQListCards({
  faqs,
  categories,
  primaryColor,
  textColor,
  mutedColor,
}: FAQListCardsProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const filteredFaqs = faqs.filter((item) => item.category === activeCategory);

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <>
      <FAQCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        themeColor={primaryColor}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {filteredFaqs.map((faq) => {
          const isOpen = openItems.has(faq.id);
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-2xl border-2 bg-white shadow-md transition-all hover:shadow-lg"
              style={{ borderColor: isOpen ? primaryColor : '#e2e8f0' }}
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="flex w-full flex-col items-start gap-3 px-6 py-5 text-left"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <span className="font-semibold leading-snug" style={{ color: textColor }}>
                    {faq.question}
                  </span>
                  <div
                    className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <IoIosArrowDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      style={{ color: primaryColor }}
                    />
                  </div>
                </div>
              </button>

              {isOpen && (
                <div
                  className="border-t border-slate-100 px-6 pb-5"
                  style={{ color: mutedColor }}
                >
                  <TipTapRenderer content={faq.answer} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
