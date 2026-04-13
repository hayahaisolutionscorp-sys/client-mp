import { cookies } from 'next/headers';
import type { IAccount } from '@/models';
import { mapApiUserToAccount } from '@/lib/auth/map-api-user-to-account';

export type InitialAuthFromCookies = {
  initialUser: IAccount | null;
  /** True if access or refresh token cookie is present (client should still call /me if initialUser is null). */
  hasSessionCookies: boolean;
};

/**
 * Read session snapshot from request cookies (same source as /api/auth/session) so the
 * root layout can pass initialUser to AuthContext — navbar shows My Bookings / notifications
 * on first paint without waiting for client /auth/me.
 */
export async function getInitialAuthFromCookies(): Promise<InitialAuthFromCookies> {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get('access_token')?.value);
  const hasRefreshToken = Boolean(cookieStore.get('refresh_token')?.value);
  const hasSessionCookies = hasAccessToken || hasRefreshToken;

  if (!hasSessionCookies) {
    return { initialUser: null, hasSessionCookies: false };
  }

  const userRaw = cookieStore.get('user')?.value;
  if (!userRaw) {
    return { initialUser: null, hasSessionCookies: true };
  }

  try {
    const parsed = JSON.parse(userRaw) as unknown;
    const initialUser = mapApiUserToAccount(parsed);
    return { initialUser, hasSessionCookies: true };
  } catch {
    return { initialUser: null, hasSessionCookies: true };
  }
}
