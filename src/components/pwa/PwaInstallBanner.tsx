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
            className="sticky top-0 z-[100] w-full px-4 py-3 flex items-center justify-between shadow-md transition-all duration-300 ease-in-out"
            style={{ backgroundColor: primaryColor }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={handleDismiss}
                    className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <IoCloseOutline size={24} />
                </button>
                <div className="flex flex-col text-white">
                    <span className="font-bold text-sm leading-tight">Install Hayahai</span>
                    <span className="text-xs opacity-90 leading-tight">
                        Install once. Access anytime.
                    </span>
                </div>
            </div>

            <button
                onClick={handleInstallClick}
                className="bg-white text-purple-700 px-6 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-all"
                style={{ color: primaryColor }}
            >
                Install
            </button>
        </div>
    );
};

export default PWAInstallBanner;
