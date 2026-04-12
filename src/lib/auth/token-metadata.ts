export const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 24 * 60 * 60;

export type TokenMetadata = {
  accessTokenExpiresIn: number;
  accessTokenExpiresAt: string;
  refreshTokenExpiresIn: number;
  refreshTokenExpiresAt: string;
};

type RawTokenMetadata = {
  access_token_expires_in?: unknown;
  access_token_expires_at?: unknown;
  refresh_token_expires_in?: unknown;
  refresh_token_expires_at?: unknown;
};

function toPositiveNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return fallback;
}

function toIsoOrDefault(value: unknown, ttlSeconds: number): string {
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

export function extractTokenMetadata(
  payload: RawTokenMetadata | null | undefined,
): TokenMetadata {
  const accessTokenExpiresIn = toPositiveNumber(
    payload?.access_token_expires_in,
    DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  );
  const refreshTokenExpiresIn = toPositiveNumber(
    payload?.refresh_token_expires_in,
    DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
  );

  return {
    accessTokenExpiresIn,
    accessTokenExpiresAt: toIsoOrDefault(
      payload?.access_token_expires_at,
      accessTokenExpiresIn,
    ),
    refreshTokenExpiresIn,
    refreshTokenExpiresAt: toIsoOrDefault(
      payload?.refresh_token_expires_at,
      refreshTokenExpiresIn,
    ),
  };
}