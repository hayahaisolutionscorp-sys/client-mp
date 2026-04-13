'use client';

import { Button } from '@/components/ui/Button';
import { hexToRgb } from 'helpers/theme.helpers';
import { getReadableTextColor } from '@/lib/color-utils';

interface FAQCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  themeColor: string;
}

export default function FAQCategoryTabs({ categories, activeCategory, onCategoryChange, themeColor }: FAQCategoryTabsProps) {
  const textOnTheme = getReadableTextColor(themeColor);

  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center bg-[var(--surface-alt)] py-4 z-10">
      {categories.map((category) => (
        <Button
          variant="default"
          key={category}
          data-template-ignore="true"
          onClick={() => onCategoryChange(category)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base transition-all transform hover:scale-105 ${activeCategory !== category ? 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md' : ''
            }`}
          style={
            activeCategory === category
              ? ({
                backgroundColor: themeColor,
                color: textOnTheme,
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
