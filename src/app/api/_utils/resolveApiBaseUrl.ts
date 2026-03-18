const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

export const isClientMode = process.env.NEXT_PUBLIC_IS_CLIENT === 'true';

export const resolveApiBaseUrl = () => {
  const clientApiBaseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');

  const defaultApiUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

  return isClientMode ? clientApiBaseUrl : defaultApiUrl;
};

// Knowledge-base endpoints (chat, agent-config) always live on api-v2,
// regardless of client mode.
export const resolveKnowledgeBaseUrl = () => {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL || 'http://localhost:3002');
};
