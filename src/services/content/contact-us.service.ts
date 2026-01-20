import { IContactInformation } from '@/models';
import { CONTACT_INFORMATION_API, CONTACT_US_HERO_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import contactInformationData from '@/data/contact-information.json';
import contactUsHeroData from '@/data/contact-us-hero.json';

export interface IContactUsHero {
  id: string;
  page_id: string;
  type: string;
  bg_type: 'image' | 'video' | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export async function getContactUs(): Promise<IContactInformation[]> {
  try {
    if (!IS_CLIENT) {
      return contactInformationData as IContactInformation[];
    }

    const res = await fetch(CONTACT_INFORMATION_API, {
      next: { tags: ['contact-us'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getContactUsHero(): Promise<IContactUsHero | undefined> {
  try {
    if (!IS_CLIENT) {
      return contactUsHeroData as IContactUsHero;
    }

    const res = await fetch(CONTACT_US_HERO_API, {
      next: { tags: ['contact-us-hero'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return undefined;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}