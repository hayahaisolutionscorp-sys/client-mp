import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/app/api/_utils/resolveApiBaseUrl';
import { clearSessionCookies } from '@/lib/auth/server-session';

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}

export async function POST() {
  const cookieStore = await cookies();
  const apiBaseUrl = resolveApiBaseUrl();

  try {
    if (apiBaseUrl) {
      const cookieHeader = buildCookieHeader(cookieStore);
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      });
    }
  } catch {
    // Ignore upstream transport errors and always clear local session.
  }

  await clearSessionCookies();

  return NextResponse.json({ message: 'Successfully logged out' });
}