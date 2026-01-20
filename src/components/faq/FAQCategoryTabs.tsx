'use client';

import { Button } from '@/components/ui/Button';
import { hexToRgb } from 'helpers/theme.helpers';

interface FAQCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  themeColor: string;
}

export default function FAQCategoryTabs({ categories, activeCategory, onCategoryChange, themeColor }: FAQCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center bg-[#EEF8FC]/95 py-4 z-10">
      {categories.map((category) => (
        <Button
          variant="default"
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base transition-all transform hover:scale-105 ${activeCategory !== category ? 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md' : 'text-primary-foreground'
            }`}
          style={
            activeCategory === category
              ? ({
                backgroundColor: themeColor,
                '--bg-color': hexToRgb(themeColor)
              } as React.CSSProperties)
              : undefined
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
