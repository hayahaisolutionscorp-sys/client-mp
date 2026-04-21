'use client';

import { useState } from 'react';
import type { IFaq } from '@/models';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface FAQListGlassmorphicProps {
  faqs: IFaq[];
  categories: string[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function FAQListGlassmorphic({
  faqs,
  categories,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: FAQListGlassmorphicProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(
    (faq) => activeCategory === 'All' || faq.category === activeCategory
  );

  return (
    <div className="mx-auto max-w-4xl px-2 py-8 relative">
        <div 
            className="absolute left-1/4 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-[120px] opacity-[0.08]"
            style={{ backgroundColor: primaryColor }}
        />

        {categories.length > 1 && (
            <div className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                        "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 backdrop-blur-md shadow-sm border",
                        isActive ? "shadow-md scale-105 border-transparent" : "hover:border-white/50 border-white/20"
                    )}
                    style={{
                        backgroundColor: isActive ? primaryColor : 'rgba(255, 255, 255, 0.6)',
                        color: isActive ? '#fff' : mutedColor,
                    }}
                >
                    {category}
                </button>
                );
            })}
            </div>
        )}

      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
                key={faq.id} 
                className={cn(
                    "rounded-[1.5rem] border border-white/40 overflow-hidden transition-all duration-300 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] backdrop-blur-2xl",
                    isOpen ? "bg-white/70 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)]" : "bg-white/40 hover:bg-white/60"
                )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left md:px-8 md:py-6"
              >
                <span className="text-lg font-bold pr-8" style={{ color: textColor }}>
                  {faq.question}
                </span>
                <div 
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 shadow-inner border border-white/40"
                    style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        backgroundColor: isOpen ? primaryColor : 'rgba(255,255,255,0.8)',
                        color: isOpen ? '#ffffff' : primaryColor
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
                  <div className="px-6 pb-6 pt-0 md:px-8 md:pb-8">
                    <div
                      className="prose prose-sm md:prose-base max-w-none border-t border-black/5 pt-5 text-[15px] leading-relaxed"
                      style={{ color: mutedColor }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(faq.answer),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="rounded-[2rem] border border-white/40 bg-white/40 p-12 text-center backdrop-blur-xl">
            <p className="text-lg font-medium" style={{ color: mutedColor }}>
              No frequently asked questions found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
