"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

// Capture beforeinstallprompt at module load â€” before React hydrates.
// Chrome can fire this event during initial page load, before useEffect runs.
let _earlyPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        _earlyPrompt = e as BeforeInstallPromptEvent;
    });
}

function isSupportedBrowser(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isChromium = /Chrome|Chromium|Edg|OPR|Opera/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !isChromium;
    // iOS Safari: supports Add to Home Screen via Share menu (no beforeinstallprompt)
    const isIOSSafari = isIOS && isSafari;
    // Chromium on non-iOS (Chrome/Edge/Opera on desktop or Android): supports beforeinstallprompt
    const isNonIOSChromium = isChromium && !isIOS;
    return isIOSSafari || isNonIOSChromium;
}

function isInstalled(): boolean {
    try {
        const standaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
        const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        const androidTwa = document.referrer.includes("android-app://");
        const installedFlag = localStorage.getItem("pwa_installed") === "true";
        return standaloneMatch || iosStandalone || androidTwa || installedFlag;
    } catch {
        return false;
    }
}

function isDismissed(): boolean {
    try {
        return sessionStorage.getItem("pwa_banner_dismissed") === "true";
    } catch {
        return false;
    }
}

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isSupportedBrowser() || isInstalled() || isDismissed()) return;

        // Absorb any early-captured prompt (fired before React mounted)
        if (_earlyPrompt) {
            setDeferredPrompt(_earlyPrompt);
        }

        setIsVisible(true);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            _earlyPrompt = e as BeforeInstallPromptEvent;
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            if (!isInstalled() && !isDismissed()) {
                setIsVisible(true);
            }
        };

        const handleAppInstalled = () => {
            try { localStorage.setItem("pwa_installed", "true"); } catch { /* ignore */ }
            try { sessionStorage.removeItem("pwa_banner_dismissed"); } catch { /* ignore */ }
            setDeferredPrompt(null);
            _earlyPrompt = null;
            setIsVisible(false);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        const prompt = deferredPrompt ?? _earlyPrompt;

        if (!prompt) {
            const ua = navigator.userAgent;
            if (/iPhone|iPad|iPod/i.test(ua)) {
                alert("To install: Tap the 'Share' icon and then 'Add to Home Screen'.");
            } else if (/Android/i.test(ua)) {
                alert("To install: Open browser menu (â‹®) then tap 'Install app' or 'Add to Home screen'.");
            } else {
                alert("Install option is not available yet on this browser. Try Chrome or Safari on mobile.");
            }
            return;
        }

        prompt.prompt();
        const { outcome } = await prompt.userChoice;

        if (outcome === "accepted") {
            try { localStorage.setItem("pwa_installed", "true"); } catch { /* ignore */ }
            try { sessionStorage.removeItem("pwa_banner_dismissed"); } catch { /* ignore */ }
        } else {
        }

        setDeferredPrompt(null);
        _earlyPrompt = null;
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        try { sessionStorage.setItem("pwa_banner_dismissed", "true"); } catch { /* ignore */ }
    };

    return { isVisible, handleInstallClick, handleDismiss };
};
