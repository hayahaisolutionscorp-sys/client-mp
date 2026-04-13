import { IThemeSettings } from '@/models';
import { IBrandingResponse } from '@/models/branding.model';
import { THEME_SETTINGS_API } from 'constants/api';
import brandingData from '@/data/branding.json';
import { IS_BROWSER, SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';

const WHITELABEL_DEBUG = process.env.NEXT_PUBLIC_WHITELABEL_DEBUG === 'true';

const DEFAULT_THEME: IThemeSettings = {
  primary: brandingData.colors.primary,
  secondary: brandingData.colors.secondary,
  accent: brandingData.colors.accent,
  primaryColor: brandingData.colors.primary,
  secondaryColor: brandingData.colors.secondary,
  surface: (brandingData.colors as { surface?: string }).surface || '#FFFFFF',
  surfaceAlt: (brandingData.colors as { surfaceAlt?: string }).surfaceAlt || '#EEF8FC',
  fontStyle: 'Inter'
};

export async function getThemeSettings(): Promise<IThemeSettings | undefined> {
  if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
    return DEFAULT_THEME;
  }

  let cachedTheme: IThemeSettings | undefined;
  if (IS_BROWSER) {
    try {
      const cached = localStorage.getItem('theme_settings');
      if (cached) {
        cachedTheme = JSON.parse(cached) as IThemeSettings;
      }
    } catch (e) {
      if (WHITELABEL_DEBUG) {
        console.warn('[WhitelabelAPI] failed to parse cached theme settings', e);
      }
    }
  }

  try {
    const res = await fetch(
      THEME_SETTINGS_API,
      IS_BROWSER ? { cache: 'no-store' } : { next: { tags: ['branding'], revalidate: 3600 } }
    );

    if (res.ok) {
      const response: IBrandingResponse = await res.json();
      const theme: IThemeSettings = {
        primaryColor: response.data.colors.primaryColor || response.data.colors.primary,
        secondaryColor: response.data.colors.secondaryColor || response.data.colors.secondary,
        primary: response.data.colors.primary || response.data.colors.primaryColor || '',
        secondary: response.data.colors.secondary || response.data.colors.secondaryColor || '',
        accent: response.data.colors.accent,
        surface: response.data.colors.surface || '#FFFFFF',
        surfaceAlt: response.data.colors.surfaceAlt || '#EEF8FC',
        fontStyle: 'Inter'
      };

      if (IS_BROWSER) {
        localStorage.setItem('theme_settings', JSON.stringify(theme));
      }

      return theme;
    }

    return cachedTheme ?? DEFAULT_THEME;
  } catch (e) {
    if (typeof window === 'undefined' || WHITELABEL_DEBUG) {
      console.error('[WhitelabelAPI] Error fetching theme settings:', e);
    }
    return cachedTheme ?? DEFAULT_THEME;
  }
}
