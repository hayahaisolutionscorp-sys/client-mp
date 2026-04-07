const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

export const isClientMode = process.env.NEXT_PUBLIC_IS_CLIENT === 'true';

export const resolveApiBaseUrl = () => {
  const clientApiBaseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');

  const defaultApiUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

  return isClientMode ? clientApiBaseUrl : defaultApiUrl;
};

// Knowledge-base endpoints (chat, agent-config) route to the dedicated KB API
// when NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL is explicitly set (e.g. local dev).
// In production client-mode deployments without that override, fall back to
// the client-api so the deployment remains self-contained.
export const resolveKnowledgeBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL);
  }
  if (isClientMode) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
  }
  return trimTrailingSlash('http://localhost:3002');
};
