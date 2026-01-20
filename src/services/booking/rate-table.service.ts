import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import { RATE_TABLES_API } from 'constants/api';
import { IRateTable, IRateTableMarkup } from '@/models';
import axios from '@/services/core/axios';

export async function getRateTableById(
  rateTableId: number
): Promise<IRateTable | undefined> {
  // try {
  //   const { data } = await axios.get(`${RATE_TABLES_API}/${rateTableId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    id: rateTableId,
    shippingLineId: 3,
    name: 'Dummy Rate Table',
    description: 'Dummy Description'
  } as any as IRateTable;
}

export async function getRateTables(): Promise<IRateTable[] | undefined> {
  // try {
  //   const { data } = await axios.get(RATE_TABLES_API);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
}

export async function getFullRateTableById(
  id: number
): Promise<IRateTable | undefined> {
  // try {
  //   const { data } = await axios.get(`${RATE_TABLES_API}/${id}/full`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    id: id,
    shippingLineId: 3,
    name: 'Dummy Full Rate Table',
    description: 'Dummy Description'
  } as any as IRateTable;
}

export async function createRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  // try {
  //   await axios.post(`${RATE_TABLES_API}/${rateTableId}/markup`, rateMarkup);
  // } catch (e) {
  //   console.error(e);
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function updateRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  // try {
  //   await axios.put(`${RATE_TABLES_API}/${rateTableId}/markup/${rateMarkup.id}`, rateMarkup);
  // } catch (e) {
  //   console.error(e);
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
}