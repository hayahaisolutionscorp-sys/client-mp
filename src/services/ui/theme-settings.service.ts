import { IThemeSettings } from '@/models';
import { THEME_SETTINGS_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import themeSettingsData from '@/data/theme-settings.json';

export async function getThemeSettings(): Promise<IThemeSettings[] | undefined> {
  // const cached = fetchItem<IThemeSettings[]>('theme-settings');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(THEME_SETTINGS_API);
  //   cacheItem('theme-settings', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return themeSettingsData as IThemeSettings[];
}

export async function getThemeSettingsByShippingLineId(
  shippingLineId: number
): Promise<IThemeSettings | undefined> {
  // try {
  //   const { data } = await axios.get(`${THEME_SETTINGS_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (themeSettingsData as IThemeSettings[]).find(t => t.shippingLineId === shippingLineId);
}