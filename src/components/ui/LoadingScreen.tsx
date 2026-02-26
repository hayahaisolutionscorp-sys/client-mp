"use client";

import { useThemeSettings } from "@/hooks/theme-settings";

interface LoadingScreenProps {
  fullScreen?: boolean;
}

export default function LoadingScreen({ fullScreen = true }: LoadingScreenProps) {
  const themeSettings = useThemeSettings();

  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'h-[60vh]'} w-full`}>
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
