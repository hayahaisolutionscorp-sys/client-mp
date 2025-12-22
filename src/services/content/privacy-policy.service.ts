import { IPrivacyPolicy } from '@/models';
import { PRIVACY_POLICY_API } from 'constants/api';

import privacyData from '@/data/privacy-policies.json';

export const PrivacyPolicyService = {
  async getAll(): Promise<IPrivacyPolicy[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return privacyData as any as IPrivacyPolicy[];
  },

  async getByShippingLineId(shippingLineId: number): Promise<IPrivacyPolicy[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return (privacyData as any as IPrivacyPolicy[]).filter(p => p.shippingLineId === shippingLineId);
  },

  async getByTitleAndShippingLineId(
    titleId: string,
    shippingLineId: number
  ): Promise<IPrivacyPolicy | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return (privacyData as any as IPrivacyPolicy[]).find(p => p.shippingLineId === shippingLineId && p.titleId === titleId) || null;
  },
};
