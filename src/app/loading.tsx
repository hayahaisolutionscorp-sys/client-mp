"use client";

import { useThemeSettings } from "@/hooks/theme-settings";

export default function Loading() {
  const themeSettings = useThemeSettings();

  return (
    <div className="flex items-center justify-center h-screen">
      {/* Spinner */}
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-4"
        style={{ borderTopColor: themeSettings?.primaryColor || '#3b82f6' }}
      ></div>
      {/* Loading Text */}
      <span className="ml-4 text-xl font-medium text-gray-700">Loading...</span>
    </div>
  );
}