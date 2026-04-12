import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/app/api/_utils/resolveApiBaseUrl';
import { setSessionCookiesFromPayload } from '@/lib/auth/server-session';

export async function POST(request: Request) {
  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'Missing auth base URL' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const upstream = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
    cache: 'no-store',
  });

  const json = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(json || { error: 'Register failed' }, { status: upstream.status });
  }

  const payload = json?.data || {};
  const metadata = await setSessionCookiesFromPayload(payload);

  return NextResponse.json({
    message: json?.message || 'User successfully registered.',
    data: {
      user: payload.user || null,
      access_token_expires_in: metadata.accessTokenExpiresIn,
      access_token_expires_at: metadata.accessTokenExpiresAt,
      refresh_token_expires_in: metadata.refreshTokenExpiresIn,
      refresh_token_expires_at: metadata.refreshTokenExpiresAt,
    },
  });
}