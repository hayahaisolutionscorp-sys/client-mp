'use client';

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import type { IFaq } from '@/models';
import TipTapRenderer from '@/components/shared/TipTapRenderer';
import FAQCategoryTabs from '@/components/faq/FAQCategoryTabs';

interface FAQListCompactProps {
  faqs: IFaq[];
  categories: string[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

export default function FAQListCompact({
  faqs,
  categories,
  primaryColor,
  textColor,
  mutedColor,
}: FAQListCompactProps) {
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

      <div className="space-y-2">
        {filteredFaqs.map((faq) => {
          const isOpen = openItems.has(faq.id);
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-lg border-l-4 bg-white shadow-sm transition-all hover:shadow-md"
              style={{ borderLeftColor: primaryColor }}
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50"
              >
                <span className="pr-4 text-sm font-semibold" style={{ color: textColor }}>
                  {faq.question}
                </span>
                <IoIosArrowDown
                  className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  style={{ color: primaryColor }}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-3 text-sm" style={{ color: mutedColor }}>
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
