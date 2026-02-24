"use client";

import { ChatWidget as HayahAIChatWidget } from "@oltek/hayahai-sdk/react";

type Props = {
  agentId?: string;
  threadId?: string;
  tenantId?: number;
};

export default function ChatWidget({ agentId, threadId, tenantId = 1 }: Props) {
  return (
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
  );
}
