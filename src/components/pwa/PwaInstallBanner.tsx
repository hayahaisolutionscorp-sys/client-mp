"use client";

import React from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useThemeSettings } from '@/hooks/theme-settings';
import { IoCloseOutline } from 'react-icons/io5';

const PWAInstallBanner = () => {
    const { isVisible, handleInstallClick, handleDismiss } = usePWAInstall();
    const themeSettings = useThemeSettings();

    if (!isVisible) return null;

    const primaryColor = themeSettings?.primary || themeSettings?.primaryColor || 'oklch(60% 0.15 280)';

    return (
        <div
            className="sticky top-0 z-[100] w-full px-3 py-3 sm:px-4 border-b border-white/20 shadow-md"
            style={{ backgroundColor: primaryColor }}
        >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                    <button
                        onClick={handleDismiss}
                        className="text-white hover:bg-white/20 p-1 rounded-full"
                        aria-label="Close"
                        type="button"
                    >
                        <IoCloseOutline size={22} />
                    </button>
                    <div className="flex min-w-0 flex-col text-white">
                        <span className="font-bold text-sm sm:text-base leading-tight">Install Hayahai App</span>
                        <span className="text-xs sm:text-sm opacity-90 leading-tight">
                            Download once, open anytime on your phone.
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto min-h-10 bg-white px-5 py-2 rounded-full font-bold text-sm shadow-sm"
                    style={{ color: primaryColor }}
                    type="button"
                >
                    Install Now
                </button>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
