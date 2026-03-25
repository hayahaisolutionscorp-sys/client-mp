const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

const KNOWLEDGE_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL || 'http://localhost:3002'
);

const MARKETPLACE_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1';

export interface AgentConfig {
  enabled?: boolean;
  [key: string]: unknown;
}

export async function getAgentConfig(
  type: string = 'trip-search',
  tenantId: string = MARKETPLACE_TENANT_ID
): Promise<AgentConfig | null> {
  try {
    const res = await fetch(
      `${KNOWLEDGE_BASE_URL}/knowledge-base/agent-config/${tenantId}/${type}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data?.config || data?.config || null;
  } catch (error) {
    return null;
  }
}
