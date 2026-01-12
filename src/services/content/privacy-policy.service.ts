import { PRIVACY_POLICY_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import privacyPolicyData from '@/data/privacy-policy.json';

export interface IPrivacyPolicyTipTap {
  id: string;
  page_type: string;
  title: string;
  content: any; // TipTap JSON content
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export async function getPrivacyPolicy(): Promise<IPrivacyPolicyTipTap | undefined> {
  try {
    if (!IS_CLIENT) {
      return privacyPolicyData as IPrivacyPolicyTipTap;
    }

    const res = await fetch(`${PRIVACY_POLICY_API}`, {
      next: { tags: ['privacy-policy'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    // Fallback to local data if API fails
    return privacyPolicyData as IPrivacyPolicyTipTap;
  } catch (e) {
    console.error(e);
    // Fallback to local data on error
    return privacyPolicyData as IPrivacyPolicyTipTap;
  }
}
