"use client";

import React, { useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useThemeSettings } from '@/hooks/theme-settings';
import { useTheme } from '@/components/ThemeProvider';
import { IoCloseOutline } from 'react-icons/io5';

const PWAInstallBanner = () => {
    const { isVisible, handleInstallClick, handleDismiss } = usePWAInstall();
    const themeSettings = useThemeSettings();
    const { branding } = useTheme();

    useEffect(() => {
        if (isVisible) {
            document.documentElement.style.setProperty('--pwa-install-height', '102px');
            document.documentElement.style.setProperty('--pwa-hero-lift', '25px');
            document.documentElement.style.setProperty('--pwa-search-lift', '60px');
            return () => {
                document.documentElement.style.removeProperty('--pwa-install-height');
                document.documentElement.style.removeProperty('--pwa-hero-lift');
                document.documentElement.style.removeProperty('--pwa-search-lift');
            };
        }

        document.documentElement.style.removeProperty('--pwa-install-height');
        document.documentElement.style.removeProperty('--pwa-hero-lift');
        document.documentElement.style.removeProperty('--pwa-search-lift');
    }, [isVisible]);

    if (!isVisible) return null;

    const primaryColor = themeSettings?.primary || themeSettings?.primaryColor || 'oklch(60% 0.15 280)';
    const buttonColor = themeSettings?.secondary || themeSettings?.secondaryColor || '#ffffff';
    const appName = branding?.brand_name || process.env.NEXT_PUBLIC_TENANT_NAME || 'Hayahai';

    return (
        <>
            <div
                className="fixed top-0 inset-x-0 z-[10000] pointer-events-auto w-full px-3 py-3 sm:px-4 border-b border-white/20 shadow-md md:hidden"
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
                            <span className="font-bold text-sm sm:text-base leading-tight">Install {appName} App</span>
                            <span className="text-xs sm:text-sm opacity-90 leading-tight">
                                Download once, open anytime on your phone.
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleInstallClick}
                        className="w-full sm:w-auto min-h-10 px-5 py-2 rounded-full font-bold text-sm shadow-sm border border-white/25"
                        style={{ backgroundColor: buttonColor, color: primaryColor }}
                        type="button"
                    >
                        Install Now
                    </button>
                </div>
            </div>
            <div className="h-[102px] sm:h-[68px] md:hidden" aria-hidden="true" />
        </>
    );
};

export default PWAInstallBanner;
