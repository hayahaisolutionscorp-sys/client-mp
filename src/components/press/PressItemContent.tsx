"use client";

// src/components/press/PressItemContent.tsx
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { useThemeSettings } from "@/hooks/theme-settings";
import { IPress } from "@/models";
import { hexToRgb } from "helpers/theme.helpers";
import TipTapRenderer from "@/components/shared/TipTapRenderer";

interface PressItemContentProps {
  pressItem: IPress & {
    formattedDate: string;
  };
}

export function PressItemContent({ pressItem }: PressItemContentProps) {
  const themeSettings = useThemeSettings();
  const primaryColor = themeSettings?.primary || "#000000";

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 pb-32 sm:pb-60"
      style={{
        background: `linear-gradient(180deg, rgba(${hexToRgb(primaryColor)}, 0.1) 0%, #FFFFFF 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Link
          href="/press"
          className="inline-flex items-center mb-6 sm:mb-8 hover:opacity-80 transition-colors duration-200"
          style={{ color: primaryColor }}
        >
          <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
          Back to Press Releases
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: primaryColor }}>
            {pressItem.title}
          </h1>
          <div className="flex items-center justify-center text-gray-500 text-sm sm:text-base">
            <Calendar className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
            {pressItem.formattedDate}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">
          <TipTapRenderer content={pressItem.content} />
        </div>
      </div>
    </div>
  );
}
