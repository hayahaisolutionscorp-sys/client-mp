"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatWidget as HayahAIChatWidget } from "@oltek/hayahai-sdk/react";
import type { DeepPartial, HayahAITheme } from "@oltek/hayahai-sdk/react";
import { useLandingBuilder } from "@/hooks/landing-builder";
import { useThemeSettings } from "@/hooks/theme-settings";

type Props = {
  agentId?: string;
  threadId?: string;
  tenantId?: number;
  builderConfigOverride?: any;
};

export default function ChatWidget({ agentId, threadId, tenantId = 1, builderConfigOverride }: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fetchedBuilderConfig = useLandingBuilder();
  const builderConfig = builderConfigOverride || fetchedBuilderConfig;
  const themeSettings = useThemeSettings();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/agent-config?tenantId=${tenantId}&type=chatbot`);
        if (res.ok) {
          const data = await res.json();
          const cfg = data?.config;
          setEnabled(cfg?.enabled ?? true);
        } else {
          setEnabled(true);
        }
      } catch {
        setEnabled(true);
      }
    })();
  }, [tenantId]);

  const linkifyNode = useCallback((node: HTMLElement) => {
    if (node.querySelector("a")) return;
    const text = node.innerHTML;
    const linkified = text.replace(
      /(\/booking\/destination\?[^\s<"]+)/g,
      '<a href="$1" style="color:#2563eb;text-decoration:underline;word-break:break-all;" target="_top">$1</a>'
    );
    if (linkified !== text) {
      node.innerHTML = linkified;
    }
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const added of Array.from(m.addedNodes)) {
          if (added instanceof HTMLElement) {
            const divs = added.querySelectorAll<HTMLElement>("div[style*='pre-wrap']");
            divs.forEach(linkifyNode);
            if (added.style?.whiteSpace === "pre-wrap") linkifyNode(added);
          }
        }
      }
    });
    observer.observe(wrapperRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled, linkifyNode]);

  // Still loading config or explicitly disabled
  if (enabled === null || enabled === false) return null;

  const ctaSection = builderConfig?.sections?.find((s: any) => s.section_key === "floating_cta");
  if (ctaSection && !ctaSection.enabled) return null;

  const ctaVariant = ctaSection?.variant || "default";
  const primaryColor = themeSettings?.primaryColor || themeSettings?.primary || "#13357B";

  const baseTheme: DeepPartial<HayahAITheme> = {
    colors: {
      primary: primaryColor,
      primaryHover: primaryColor,
      headerBg: primaryColor,
      headerText: "#FFFFFF",
    },
    fontFamily: themeSettings?.fontStyle ? `'${themeSettings.fontStyle}', sans-serif` : "'Inter', sans-serif",
  };

  let widgetTheme = baseTheme;
  let customClass = "";

  if (ctaVariant === "modern-dark") {
    widgetTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: "#1E1E1E",
        headerBg: "#121212",
        headerText: "#FFFFFF",
        headerSubtext: "#A0A0A0",
        inputBg: "#2C2C2C",
        inputText: "#FFFFFF",
        inputPlaceholder: "#888888",
        inputBorder: "#444444",
        userBubble: primaryColor,
        userBubbleText: "#FFFFFF",
        botBubble: "#2C2C2C",
        botBubbleText: "#FFFFFF",
        border: "#333333",
      },
    };
    customClass = "hayahai-modern-dark shadow-2xl";
  } else if (ctaVariant === "minimal-light") {
    widgetTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: "#FFFFFF",
        headerBg: "#F9FAFB",
        headerText: "#111827",
        headerSubtext: "#6B7280",
        inputBg: "#F3F4F6",
        inputText: "#111827",
        inputBorder: "#E5E7EB",
        userBubble: "#F3F4F6",
        userBubbleText: "#111827",
        botBubble: "#FFFFFF",
        botBubbleText: "#111827",
        botBubbleBorder: "#E5E7EB",
        border: "#E5E7EB",
      },
      borderRadius: {
        widget: "12px",
        button: "12px",
        bubble: "12px",
        input: "12px",
      }
    };
    customClass = "hayahai-minimal-light shadow-sm border border-gray-200";
  }

  return (
    <div ref={wrapperRef}>
      <style>{`
        /* Modern Dark Layout & Design Overrides */
        .hayahai-modern-dark > div {
          border-radius: 12px !important;
          border: 1px solid #333 !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
        .hayahai-modern-dark > button {
          border-radius: 16px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4) !important;
        }
        /* Custom Modern Dark Icon (Message) */
        .hayahai-modern-dark > button > svg {
          display: none !important;
        }
        .hayahai-modern-dark > button::before {
          content: "";
          display: block;
          width: 24px;
          height: 24px;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        /* Show X when open */
        .hayahai-modern-dark:has(> div) > button::before {
          display: none !important;
        }
        .hayahai-modern-dark:has(> div) > button > svg {
          display: block !important;
        }

        /* Minimal Light Layout & Design Overrides */
        .hayahai-minimal-light > div {
          border-radius: 20px !important;
          border: 1px solid #E5E7EB !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08) !important;
          bottom: 90px !important;
          right: 24px !important;
        }
        .hayahai-minimal-light > button {
          border-radius: 28px !important;
          width: 64px !important;
          height: 48px !important;
          bottom: 32px !important;
          right: 24px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        /* Custom Minimal Light Icon (Message Circle) */
        .hayahai-minimal-light > button > svg {
          display: none !important;
        }
        .hayahai-minimal-light > button::before {
          content: "";
          display: block;
          width: 24px;
          height: 24px;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        /* Show X when open */
        .hayahai-minimal-light:has(> div) > button::before {
          display: none !important;
        }
        .hayahai-minimal-light:has(> div) > button > svg {
          display: block !important;
        }
      `}</style>
      <HayahAIChatWidget
        key={ctaVariant}
        tenantId={tenantId}
        agentId={agentId}
        threadId={threadId}
        chatApiUrl="/api/chat"
        configApiUrl="/api/agent-config"
        position="bottom-right"
        poweredByText="Powered by HayahAI"
        subtitle="Ask about trip schedules, ticket prices, or booking assistance."
        theme={widgetTheme}
        className={customClass}
      />
    </div>
  );
}
