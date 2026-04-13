import { WHY_CHOOSE_REASONS_API, WHY_CHOOSE_SECTION_API } from 'constants/api';
import { SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';

import whyChooseSectionData from '@/data/why-choose-section.json';
import whyChooseReasonsData from '@/data/why-choose-reasons.json';

export interface IWhyChooseSection {
  id: string;
  page_id: string;
  type: string;
  bg_type: string | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string;
  subtitle: string | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface IWhyChooseReason {
  id: string;
  page_id: string;
  section_id: string;
  title: string;
  description: string;
  icon_url: string;
  icon_alt: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export async function getWhyChooseSection(): Promise<IWhyChooseSection | undefined> {
  try {
    if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
      return whyChooseSectionData as IWhyChooseSection;
    }

    const res = await fetch(WHY_CHOOSE_SECTION_API, {
      next: { tags: ['why-choose-section'], revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch why choose section');
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('Error fetching why choose section:', error);
    }
    return undefined;
  }
}

export async function getWhyChooseReasons(): Promise<IWhyChooseReason[] | undefined> {
  try {
    if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
      return whyChooseReasonsData as IWhyChooseReason[];
    }

    const res = await fetch(WHY_CHOOSE_REASONS_API, {
      next: { tags: ['why-choose-reasons'], revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch why choose reasons');
    }

    const { data } = await res.json();

    return data;
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('Error fetching why choose reasons:', error);
    }
    return undefined;
  }
}
