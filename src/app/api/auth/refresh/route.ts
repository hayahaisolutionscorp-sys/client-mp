import { NextResponse } from 'next/server';
import { refreshSessionTokens } from '@/lib/auth/server-session';

export async function POST() {
  const refreshed = await refreshSessionTokens();

  if (!refreshed) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Session refreshed.',
    data: {
      access_token_expires_in: refreshed.metadata.accessTokenExpiresIn,
      access_token_expires_at: refreshed.metadata.accessTokenExpiresAt,
      refresh_token_expires_in: refreshed.metadata.refreshTokenExpiresIn,
      refresh_token_expires_at: refreshed.metadata.refreshTokenExpiresAt,
    },
  });
}