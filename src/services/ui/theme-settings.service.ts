import { IThemeSettings } from '@/models';
import { IBrandingResponse } from '@/models/branding.model';
import { THEME_SETTINGS_API } from 'constants/api';
import themeSettingsData from '@/data/theme-settings.json';
import { IS_CLIENT } from '../config';

export async function getThemeSettings(): Promise<IThemeSettings | undefined> {
  try {
    if (!IS_CLIENT) {
      // console.log("isClient disabled")
      return (themeSettingsData as IThemeSettings[])[0];
    }

    const res = await fetch(THEME_SETTINGS_API, {
      next: { tags: ['theme-settings'], revalidate: 3600 }
    });

    if (res.ok) {
      const response: IBrandingResponse = await res.json();
      return {
        primary: response.data.colors.primaryColor,
        secondary: response.data.colors.secondaryColor,
        accent: response.data.colors.accent,
        fontStyle: 'Inter'
      };
    }

    return (themeSettingsData as IThemeSettings[])[0];
  } catch (e) {
    console.error('Error fetching theme settings:', e);
    return (themeSettingsData as IThemeSettings[])[0];
  }
}