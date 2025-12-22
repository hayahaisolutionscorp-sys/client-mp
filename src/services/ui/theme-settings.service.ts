import { IThemeSettings } from '@/models';
import { THEME_SETTINGS_API } from 'constants/api';

import themeSettingsData from '@/data/theme-settings.json';

export async function getThemeSettings(): Promise<IThemeSettings[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return themeSettingsData as IThemeSettings[];
}

export async function getThemeSettingsByShippingLineId(
  shippingLineId: number
): Promise<IThemeSettings | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (themeSettingsData as IThemeSettings[]).find(t => t.shippingLineId === shippingLineId);
}