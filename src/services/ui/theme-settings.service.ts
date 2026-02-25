import { IThemeSettings } from '@/models';
import { IBrandingResponse } from '@/models/branding.model';
import { THEME_SETTINGS_API } from 'constants/api';
import brandingData from '@/data/branding.json';
import { IS_CLIENT } from '../config';

const DEFAULT_THEME: IThemeSettings = {
  primary: brandingData.colors.primary,
  secondary: brandingData.colors.secondary,
  accent: brandingData.colors.accent,
  primaryColor: brandingData.colors.primary,
  secondaryColor: brandingData.colors.secondary,
  fontStyle: 'Inter'
};

export async function getThemeSettings(): Promise<IThemeSettings | undefined> {
  try {
    /* if (!IS_CLIENT) {
      return DEFAULT_THEME;
    } */

    const res = await fetch(THEME_SETTINGS_API, {
      // next: { tags: ['theme-settings'], revalidate: 3600 }
    });

    if (res.ok) {
      const response: IBrandingResponse = await res.json();
      return {
        primaryColor: response.data.colors.primaryColor || response.data.colors.primary,
        secondaryColor: response.data.colors.secondaryColor || response.data.colors.secondary,
        primary: response.data.colors.primary || response.data.colors.primaryColor || '',
        secondary: response.data.colors.secondary || response.data.colors.secondaryColor || '',
        accent: response.data.colors.accent,
        fontStyle: 'Inter'
      };
    }

    return DEFAULT_THEME;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching theme settings:', e);
    }
    return DEFAULT_THEME;
  }
}