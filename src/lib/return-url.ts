export function sanitizeReturnUrl(returnUrl: string | null | undefined): string | null {
  if (!returnUrl) return null;
  if (!returnUrl.startsWith('/')) return null;
  if (returnUrl.startsWith('//')) return null;
  return returnUrl;
}

export function buildReturnUrlParam(returnUrl: string | null | undefined): string {
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  return safeReturnUrl ? `?returnUrl=${encodeURIComponent(safeReturnUrl)}` : '';
}

export function withReturnUrl(path: string, returnUrl: string | null | undefined): string {
  const returnUrlParam = buildReturnUrlParam(returnUrl);
  if (!returnUrlParam) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${returnUrlParam.slice(1)}`;
}

export function resolvePostAuthPath(returnUrl: string | null | undefined, fallback = '/'): string {
  return sanitizeReturnUrl(returnUrl) ?? fallback;
}
