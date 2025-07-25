import { IAboutUs } from '@/models';
import { ABOUT_US_API } from 'constants/api';

export async function getAboutUs(): Promise<IAboutUs[] | undefined> {
  try {
    const response = await fetch(ABOUT_US_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch about us: ${response.status} ${response.statusText}`);
    }

    const data: IAboutUs[] = await response.json();
    return data;
  } catch (e) {
    console.error('Error fetching about us:', e);
    throw e;
  }
}

export async function getAboutUsByShippingLineId(shippingLineId: number): Promise<IAboutUs | undefined> {
  try {
    const response = await fetch(`${ABOUT_US_API}/${shippingLineId}`, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`Error fetching about us by shipping line id: ${response.statusText}`);
    }

    const aboutUs: IAboutUs = await response.json();
    return aboutUs;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

