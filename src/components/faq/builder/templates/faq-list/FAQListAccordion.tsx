'use client';

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import type { IFaq } from '@/models';
import TipTapRenderer from '@/components/shared/TipTapRenderer';
import FAQCategoryTabs from '@/components/faq/FAQCategoryTabs';

interface FAQListAccordionProps {
  faqs: IFaq[];
  categories: string[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function FAQListAccordion({
  faqs,
  categories,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: FAQListAccordionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');
  const [openItem, setOpenItem] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((item) => item.category === activeCategory);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <>
      <FAQCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        themeColor={primaryColor}
      />

      <div
        className="overflow-hidden rounded-[28px] border border-slate-200 shadow-sm"
        style={{ backgroundColor: surfaceColor }}
      >
        {filteredFaqs.map((faq, index) => {
          const isOpen = openItem === faq.id;
          const isLast = index === filteredFaqs.length - 1;

          return (
            <div key={faq.id} className={!isLast ? 'border-b border-slate-200' : ''}>
              <button
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50"
              >
                <span className="pr-4 font-semibold" style={{ color: textColor }}>
                  {faq.question}
                </span>
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor: isOpen ? primaryColor : `${primaryColor}20`,
                  }}
                >
                  <IoIosArrowDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: isOpen ? '#ffffff' : primaryColor }}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-4" style={{ color: mutedColor }}>
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
