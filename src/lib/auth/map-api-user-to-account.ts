import type { IAccount } from '@/models';

export function normalizeProviders(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((provider) => {
      if (typeof provider === 'string') {
        return provider;
      }

      if (
        typeof provider === 'object' &&
        provider !== null &&
        'provider' in provider &&
        typeof (provider as { provider?: unknown }).provider === 'string'
      ) {
        return (provider as { provider: string }).provider;
      }

      return '';
    })
    .filter(Boolean);
}

/** Map GET /auth/me (or session cookie) payload to IAccount — shared with AuthContext loadProfile. */
export function mapApiUserToAccount(user: unknown): IAccount | null {
  if (!user || typeof user !== 'object' || Object.keys(user as object).length === 0) {
    return null;
  }

  const u = user as Record<string, unknown> & {
    role?: string | { name?: string };
    roles?: Array<{ name?: string }>;
  };
  const normalizedProviders = normalizeProviders(u.providers);

  const roleName =
    typeof u.role === 'string'
      ? u.role
      : (u.role?.name || u.roles?.[0]?.name || 'Passenger');

  return {
    id: ((u.id || u.accountId) as string | number | undefined)?.toString() || '',
    email: typeof u.email === 'string' ? u.email : '',
    name: typeof u.name === 'string' ? u.name : '',
    profile_picture_url: typeof u.profile_picture_url === 'string' ? u.profile_picture_url : '',
    role: roleName as IAccount['role'],
    emailConsent: typeof u.emailConsent === 'boolean' ? u.emailConsent : false,
    passenger: (u.passenger || undefined) as IAccount['passenger'],
    verification: Array.isArray(u.verificationDetails)
      ? (u.verificationDetails[0] as IAccount['verification'])
      : ((u.verificationDetails || u.verification) as IAccount['verification']),
    verificationDetails: Array.isArray(u.verificationDetails)
      ? (u.verificationDetails as IAccount['verificationDetails'])
      : u.verificationDetails
        ? ([u.verificationDetails] as IAccount['verificationDetails'])
        : undefined,
    hasPassword: u.hasPassword as boolean | undefined,
    providers: normalizedProviders,
  };
}
