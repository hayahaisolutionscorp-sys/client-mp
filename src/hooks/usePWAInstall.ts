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

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    const isInstalled = () => {
        const standaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
        const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        const androidTwa = document.referrer.includes("android-app://");
        const installedFlag = localStorage.getItem("pwa_installed") === "true";

        return standaloneMatch || iosStandalone || androidTwa || installedFlag;
    };

    useEffect(() => {
        const checkDevice = () => {
            const ua = navigator.userAgent;
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            const isMobileScreen = window.matchMedia("(max-width: 1024px)").matches;
            const shouldTargetMobile = isMobileDevice || isMobileScreen;

            // Simpler, more inclusive Chromium check - includes Edge (Edg) and Opera (OPR)
            const isChromiumBrowser = /Chrome|Chromium|Edg|OPR|Opera/i.test(ua);
            const isIOS = /iPhone|iPad|iPod/i.test(ua);
            const isSafari = /Safari/i.test(ua) && !isChromiumBrowser;
            const isInstallableIOS = isIOS && isSafari;

            setIsMobileView(shouldTargetMobile);

            if (!shouldTargetMobile || isInstalled()) {
                setIsVisible(false);
                return;
            }

            const sessionDismissed = sessionStorage.getItem("pwa_banner_dismissed") === "true";
            setIsVisible(!sessionDismissed);
        };

        checkDevice();

        const mediaQuery = window.matchMedia("(max-width: 1024px)");
        const handleViewportChange = () => checkDevice();
        mediaQuery.addEventListener("change", handleViewportChange);

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            const sessionDismissed = sessionStorage.getItem("pwa_banner_dismissed") === "true";
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isMobileScreen = window.matchMedia("(max-width: 1024px)").matches;
            const shouldTargetMobile = isMobileDevice || isMobileScreen;

            if (shouldTargetMobile && !isInstalled() && !sessionDismissed) {
                setIsVisible(true);
            }
        };

        const handleAppInstalled = () => {
            localStorage.setItem("pwa_installed", "true");
            sessionStorage.removeItem("pwa_banner_dismissed");
            setDeferredPrompt(null);
            setIsVisible(false);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
            mediaQuery.removeEventListener("change", handleViewportChange);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            const ua = navigator.userAgent;
            const isIOS = /iPhone|iPad|iPod/i.test(ua);
            const isAndroid = /Android/i.test(ua);

            if (isIOS) {
                alert("To install: Tap the 'Share' icon and then 'Add to Home Screen'.");
                return;
            }

            if (isAndroid) {
                alert("To install: Open browser menu (⋮) then tap 'Install app' or 'Add to Home screen'.");
                return;
            }

            alert("Install option is not available yet on this browser. Try Chrome or Safari on mobile.");
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the PWA install");
            localStorage.setItem("pwa_installed", "true");
            sessionStorage.removeItem("pwa_banner_dismissed");
        } else {
            console.log("User dismissed the PWA install");
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("pwa_banner_dismissed", "true");
    };

    return {
        isVisible: isVisible && isMobileView,
        handleInstallClick,
        handleDismiss,
    };
};
