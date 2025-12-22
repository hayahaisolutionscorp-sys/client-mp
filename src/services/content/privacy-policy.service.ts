import { IPrivacyPolicy } from '@/models';
import { PRIVACY_POLICY_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import privacyData from '@/data/privacy-policies.json';

export const PrivacyPolicyService = {
  async getAll(): Promise<IPrivacyPolicy[]> {
    // const cached = fetchItem<IPrivacyPolicy[]>('privacy-policy');
    // if (cached) return cached;
    //
    // try {
    //   const { data } = await axios.get(PRIVACY_POLICY_API);
    //   cacheItem('privacy-policy', data);
    //   return data;
    // } catch (e) {
    //   console.error(e);
    //   return [];
    // }

    await new Promise(resolve => setTimeout(resolve, 100));
    return privacyData as any as IPrivacyPolicy[];
  },

  async getByShippingLineId(shippingLineId: number): Promise<IPrivacyPolicy[]> {
    // try {
    //   const { data } = await axios.get(`${PRIVACY_POLICY_API}/shippingLine/${shippingLineId}`);
    //   return data;
    // } catch (e) {
    //   console.error(e);
    //   return [];
    // }

    await new Promise(resolve => setTimeout(resolve, 100));
    return (privacyData as any as IPrivacyPolicy[]).filter(p => p.shippingLineId === shippingLineId);
  },

  async getByTitleAndShippingLineId(
    titleId: string,
    shippingLineId: number
  ): Promise<IPrivacyPolicy | null> {
    // try {
    //   const { data } = await axios.get(`${PRIVACY_POLICY_API}/title/${titleId}`, { params: { shippingLineId } });
    //   return data;
    // } catch (e) {
    //   console.error(e);
    //   return null;
    // }

    await new Promise(resolve => setTimeout(resolve, 100));
    return (privacyData as any as IPrivacyPolicy[]).find(p => p.shippingLineId === shippingLineId && p.titleId === titleId) || null;
  },
};
