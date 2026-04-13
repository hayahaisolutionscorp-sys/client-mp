import { cookies } from 'next/headers';
import { resolveApiBaseUrl } from '@/app/api/_utils/resolveApiBaseUrl';
import {
  extractTokenMetadata,
  type TokenMetadata,
} from '@/lib/auth/token-metadata';

const isProd = process.env.NODE_ENV === 'production';

function authCookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge,
  };
}

function buildCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): string {
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}

function buildAuthMeta(metadata: TokenMetadata): string {
  return JSON.stringify({
    access_token_expires_at: metadata.accessTokenExpiresAt,
    access_token_expires_in: metadata.accessTokenExpiresIn,
    refresh_token_expires_at: metadata.refreshTokenExpiresAt,
    refresh_token_expires_in: metadata.refreshTokenExpiresIn,
    updated_at: new Date().toISOString(),
  });
}

export async function setSessionCookiesFromPayload(payload: Record<string, unknown>) {
  const cookieStore = await cookies();
  const metadata = extractTokenMetadata(payload as any);

  const accessToken = typeof payload.access_token === 'string' ? payload.access_token : null;
  const refreshToken = typeof payload.refresh_token === 'string' ? payload.refresh_token : null;
  const user = payload.user;

  if (accessToken) {
    // httpOnly=false so client-side axios can read it via document.cookie
    // and attach it as Authorization: Bearer for cross-origin API calls.
    cookieStore.set('access_token', accessToken, authCookieOptions(metadata.accessTokenExpiresIn, false));
  }

  if (refreshToken) {
    cookieStore.set('refresh_token', refreshToken, authCookieOptions(metadata.refreshTokenExpiresIn));
  }

  if (user) {
    cookieStore.set(
      'user',
      JSON.stringify(user),
      authCookieOptions(metadata.refreshTokenExpiresIn, false),
    );
  }

  cookieStore.set(
    'auth_meta',
    buildAuthMeta(metadata),
    authCookieOptions(metadata.refreshTokenExpiresIn, false),
  );

  return metadata;
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  const cookiesToClear = ['access_token', 'refresh_token', 'user', 'auth_meta'];

  for (const name of cookiesToClear) {
    cookieStore.set(name, '', authCookieOptions(0, name !== 'user' && name !== 'auth_meta'));
  }
}

export async function refreshSessionTokens() {
  const cookieStore = await cookies();
  const cookieHeader = buildCookieHeader(cookieStore);
  const apiBaseUrl = resolveApiBaseUrl();

  if (!apiBaseUrl) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({}),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json().catch(() => null);
  const payload = json?.data || {};
  const metadata = await setSessionCookiesFromPayload(payload);

  return {
    accessToken:
      typeof payload.access_token === 'string'
        ? payload.access_token
        : (await cookies()).get('access_token')?.value || null,
    metadata,
  };
}