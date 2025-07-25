import { IThemeSettings } from '@/models';
import { THEME_SETTINGS_API } from 'constants/api';

export async function getThemeSettings(): Promise<IThemeSettings[] | undefined> {
  try {
    const response = await fetch(THEME_SETTINGS_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch theme settings: ${response.status} ${response.statusText}`);
    }

    const data: IThemeSettings[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching theme settings:', e);
    throw e;
  }
}

export async function getThemeSettingsByShippingLineId(
  shippingLineId: number
): Promise<IThemeSettings | undefined> { 
  try {
    const response = await fetch(`${THEME_SETTINGS_API}/${shippingLineId}`, { next: { revalidate: 3600 }});

    if (!response.ok) {
        throw new Error(`Error fetching theme settings by shipping line id: ${response.statusText}`);
    }

    const themeSettings: IThemeSettings = await response.json();
    return themeSettings;

  } catch (e) {
    return undefined;
  }
}