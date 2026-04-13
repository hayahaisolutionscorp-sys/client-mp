import { EFFECTIVE_API_BASE_URL, isEffectiveClientApiMode } from 'constants/api';

const trimTrailingSlash = (url?: string | null) => (url ?? '').replace(/\/+$/, '');

/** Matches tenant client-api resolution in constants/api (incl. API_BASE_URL without IS_CLIENT flag). */
export const isClientMode = isEffectiveClientApiMode;

export const resolveApiBaseUrl = () => EFFECTIVE_API_BASE_URL;

// Knowledge-base endpoints (chat, agent-config) route to the dedicated KB API
// when NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL is explicitly set (e.g. local dev).
// In production client-mode deployments without that override, fall back to
// the client-api so the deployment remains self-contained.
export const resolveKnowledgeBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL);
  }
  if (isEffectiveClientApiMode) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
  }
  return trimTrailingSlash('http://localhost:3002');
};
