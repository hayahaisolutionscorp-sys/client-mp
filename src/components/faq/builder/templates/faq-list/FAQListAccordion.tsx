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
  textOnPrimary: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function FAQListAccordion({
  faqs,
  categories,
  primaryColor,
  textColor: _textColor,
  textOnPrimary,
  mutedColor,
  surfaceColor,
}: FAQListAccordionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');
  const [openItem, setOpenItem] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((item) => item.category === activeCategory);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  /**
   * Matches homepage tokens: :root --text-on-primary (layout + ThemeProvider applyFullThemeToDocument).
   * `textOnPrimary` prop is the JS fallback when CSS vars are not yet applied.
   */
  const onPrimaryControlBg = `color-mix(in srgb, var(--text-on-primary, ${textOnPrimary}) 22%, ${primaryColor})`;

  return (
    <>
      <FAQCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        themeColor={primaryColor}
      />

      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openItem === faq.id;

          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-2xl border border-black/5 shadow-sm"
            >
              <button
                type="button"
                data-template-ignore="true"
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-[filter] hover:brightness-105"
                style={{
                  backgroundColor: primaryColor,
                  color: 'var(--text-on-primary, ' + textOnPrimary + ')',
                }}
              >
                <span
                  className="pr-2 font-semibold"
                  style={{ color: 'var(--text-on-primary, ' + textOnPrimary + ')' }}
                >
                  {faq.question}
                </span>
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all"
                  style={{ backgroundColor: onPrimaryControlBg }}
                >
                  <IoIosArrowDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: 'var(--text-on-primary, ' + textOnPrimary + ')' }}
                  />
                </div>
              </button>

              {isOpen && (
                <div
                  className="border-t border-black/5 px-6 py-4"
                  style={{ backgroundColor: surfaceColor, color: mutedColor }}
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
