import { IPrivacyPolicy } from '@/models';
import { PRIVACY_POLICY_API } from 'constants/api';

export const PrivacyPolicyService = {
  async getAll(): Promise<IPrivacyPolicy[]> {
    try {
      const response = await fetch(PRIVACY_POLICY_API);
      if (!response.ok) {
        throw new Error(`Failed to fetch privacy policies: ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.error('Error fetching privacy policies:', e);
      throw e;
    }
  },

  async getByShippingLineId(shippingLineId: number): Promise<IPrivacyPolicy[]> {
    try {
      const response = await fetch(`${PRIVACY_POLICY_API}/${shippingLineId}`);
      if (!response.ok) {
        throw new Error(`Error fetching privacy policies by shipping line ID: ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.error('Error fetching privacy policies by shipping line ID:', e);
      throw e;
    }
  },

  async getByTitleAndShippingLineId(
    titleId: string,
    shippingLineId: number
  ): Promise<IPrivacyPolicy | null> {
    try {
      const response = await fetch(
        `${PRIVACY_POLICY_API}/section?titleId=${titleId}&shippingLineId=${shippingLineId}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching section: ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.error('Error fetching section by titleId and shippingLineId:', e);
      throw e;
    }
  },
};
