'use client';

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import type { IFaq } from '@/models';
import TipTapRenderer from '@/components/shared/TipTapRenderer';
import FAQCategoryTabs from '@/components/faq/FAQCategoryTabs';

interface FAQListDefaultProps {
  faqs: IFaq[];
  categories: string[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
}

export default function FAQListDefault({
  faqs,
  categories,
  primaryColor,
  textColor,
  mutedColor,
}: FAQListDefaultProps) {
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

      <div className="space-y-4">
        {filteredFaqs.map((faq) => {
          const isOpen = openItems.has(faq.id);
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <button
                type="button"
                data-template-ignore="true"
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50"
              >
                <span className="pr-4 font-medium" style={{ color: textColor }}>
                  {faq.question}
                </span>
                <IoIosArrowDown
                  className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  style={{ color: primaryColor }}
                />
              </button>

              {isOpen && (
                <div
                  className="border-t border-slate-100 px-6 py-4"
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
