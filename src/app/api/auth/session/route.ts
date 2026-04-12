import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type AuthMeta = {
  access_token_expires_at?: string;
  access_token_expires_in?: number;
  refresh_token_expires_at?: string;
  refresh_token_expires_in?: number;
  updated_at?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get('access_token')?.value);
  const hasRefreshToken = Boolean(cookieStore.get('refresh_token')?.value);
  const userRaw = cookieStore.get('user')?.value;
  const authMetaRaw = cookieStore.get('auth_meta')?.value;

  let user: unknown = null;
  let authMeta: AuthMeta | null = null;

  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  if (authMetaRaw) {
    try {
      authMeta = JSON.parse(authMetaRaw) as AuthMeta;
    } catch {
      authMeta = null;
    }
  }

  return NextResponse.json({
    authenticated: hasAccessToken || hasRefreshToken,
    has_access_token: hasAccessToken,
    has_refresh_token: hasRefreshToken,
    user,
    auth_meta: authMeta,
  });
}