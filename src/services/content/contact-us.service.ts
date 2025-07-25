import { IContactUs } from '@/models';
import { CONTACT_US_API } from 'constants/api';

export async function getContactUs(): Promise<IContactUs[] | undefined> {
  try {
    const response = await fetch(CONTACT_US_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch contact us: ${response.status} ${response.statusText}`);
    }

    const data: IContactUs[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching contact us:', e);
    throw e;
  }
}

export async function getContactUsByShippingLineId(
  shippingLineId: number
): Promise<IContactUs | undefined> { 
  try {
    const response = await fetch(`${CONTACT_US_API}/${shippingLineId}`, { next: { revalidate: 3600 }});

    if (!response.ok) {
        throw new Error(`Error fetching contact us by shipping line id: ${response.statusText}`);
    }

    const contactUs: IContactUs = await response.json();
    return contactUs;

  } catch (e) {
    console.error(e);
    throw e;
  }
}