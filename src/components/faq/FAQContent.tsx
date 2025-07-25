'use client';

import { useState } from 'react';
import FAQCategoryTabs from './FAQCategoryTabs';
import { FAQItem } from '@/app/faq/faq.data';
import FAQItemComponent from './FAQItemComponent';

interface FAQContentProps {
  faqs: FAQItem[];
  categories: string[];
  themeColor: string;
}

export default function FAQContent({ faqs, categories, themeColor }: FAQContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');

  const filteredFaqs = faqs.filter((item) => item.category === activeCategory);

  return (
    <>
      <FAQCategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* FAQ Items */}
      <div className="space-y-3 md:space-y-4">
        {filteredFaqs.map((faq, index) => (
          <FAQItemComponent key={index} faq={faq} themeColor={themeColor} />
        ))}
      </div>
    </>
  );
}
