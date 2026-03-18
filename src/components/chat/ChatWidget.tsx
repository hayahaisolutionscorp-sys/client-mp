"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatWidget as HayahAIChatWidget } from "@oltek/hayahai-sdk/react";

type Props = {
  agentId?: string;
  threadId?: string;
  tenantId?: number;
};

export default function ChatWidget({ agentId, threadId, tenantId = 1 }: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={wrapperRef}>
      <HayahAIChatWidget
        tenantId={tenantId}
        agentId={agentId}
        threadId={threadId}
        chatApiUrl="/api/chat"
        configApiUrl="/api/agent-config"
        position="bottom-right"
        poweredByText="Powered by HayahAI"
        subtitle="Ask about trip schedules, ticket prices, or booking assistance."
      />
    </div>
  );
}
