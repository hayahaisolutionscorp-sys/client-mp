"use client";

import { useState, useEffect } from "react";
import { IS_CLIENT } from "@/services/config";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isCompatible, setIsCompatible] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const ua = navigator.userAgent;
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

            // Simpler, more inclusive Chromium check - includes Edge (Edg) and Opera (OPR)
            const isChromiumBrowser = /Chrome|Chromium|Edg|OPR|Opera/i.test(ua);
            const isIOS = /iPhone|iPad|iPod/i.test(ua);
            const isSafari = /Safari/i.test(ua) && !isChromiumBrowser;
            const isInstallableIOS = isIOS && isSafari;

            setIsMobile(isMobileDevice);
            setIsCompatible(isChromiumBrowser || isInstallableIOS);

            // iOS Safari doesn't support beforeinstallprompt, so we show the banner manually
            if (isInstallableIOS) {
                const dismissedAt = localStorage.getItem("pwa_banner_dismissed_at");
                if (dismissedAt) {
                    const lastDismissed = parseInt(dismissedAt, 10);
                    const now = Date.now();
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    if (now - lastDismissed > twentyFourHours) {
                        setIsVisible(true);
                    }
                } else {
                    setIsVisible(true);
                }
            }
        };

        checkDevice();

        // Register Service Worker manually as a fallback/reinforcement
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js")
                .then((reg) => console.log("SW registered:", reg.scope))
                .catch((err) => console.error("SW reg failed:", err));
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Check if user has already dismissed the banner and if it has expired
            const dismissedAt = localStorage.getItem("pwa_banner_dismissed_at");
            if (dismissedAt) {
                const lastDismissed = parseInt(dismissedAt, 10);
                const now = Date.now();
                const twentyFourHours = 24 * 60 * 60 * 1000;

                if (now - lastDismissed > twentyFourHours) {
                    setIsVisible(true);
                }
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If No deferredPrompt but on iOS Safari, we can't trigger native prompt
            // Maybe show a hint/alert for iOS users
            const ua = navigator.userAgent;
            const isIOS = /iPhone|iPad|iPod/i.test(ua);
            if (isIOS) {
                alert("To install: Tap the 'Share' icon and then 'Add to Home Screen'.");
            }
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the PWA install");
        } else {
            console.log("User dismissed the PWA install");
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwa_banner_dismissed_at", Date.now().toString());
    };

    return {
        isVisible: isVisible && isCompatible, // Renamed from isChromium
        handleInstallClick,
        handleDismiss,
    };
};
