import { BRANDING_API } from 'constants/api';
import { IBrandingConfig, IBrandingResponse } from '@/models/branding.model';
import brandingData from '@/data/branding.json';
import { IS_BUILD_TIME, IS_CLIENT } from '../config';

export type BrandingSource = 'api' | 'fallback';

export interface BrandingConfigResult {
  data: IBrandingConfig;
  source: BrandingSource;
}

const appendVersionParam = (url: string, version?: string): string => {
  if (!url || !version) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('v', version);
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(version)}`;
  }
};

const withBrandingCacheBuster = (config: IBrandingConfig): IBrandingConfig => {
  const version = config.updated_at || config.created_at || '';

  return {
    ...config,
    favicon_url: appendVersionParam(config.favicon_url, version),
    logo: {
      ...config.logo,
      dark: appendVersionParam(config.logo?.dark, version),
      light: appendVersionParam(config.logo?.light, version)
    }
  };
};

export const getBrandingConfigWithSource = async (init?: RequestInit): Promise<BrandingConfigResult> => {
  if (IS_BUILD_TIME || !IS_CLIENT) {
    return {
      data: brandingData as unknown as IBrandingConfig,
      source: 'fallback'
    };
  }

  try {
    const isBrowser = typeof window !== 'undefined';
    const requestInit: RequestInit = {
      ...init
    };

    const res = await fetch(
      `${BRANDING_API}`,
      isBrowser
        ? {
            ...requestInit,
            cache: 'no-store',
          }
        : {
            ...requestInit,
            next: { tags: ['branding'], revalidate: 3600 },
          }
    );

    if (res.ok) {
      const response: IBrandingResponse = await res.json();
      if (response.data) {
        return {
          data: withBrandingCacheBuster(response.data),
          source: 'api'
        };
      }
    }

    return {
      data: brandingData as unknown as IBrandingConfig,
      source: 'fallback'
    };
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('Error fetching branding config:', error);
    }

    return {
      data: brandingData as unknown as IBrandingConfig,
      source: 'fallback'
    };
  }
};

export const getBrandingConfig = async (): Promise<IBrandingConfig> => {
  const result = await getBrandingConfigWithSource();
  return result.data;
};
