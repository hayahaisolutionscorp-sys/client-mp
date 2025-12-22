import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import { RATE_TABLES_API } from 'constants/api';
import { IRateTable, IRateTableMarkup } from '@/models';

export async function getRateTableById(
  rateTableId: number
): Promise<IRateTable | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    id: rateTableId,
    shippingLineId: 3,
    name: 'Dummy Rate Table',
    description: 'Dummy Description'
  } as any as IRateTable;
}

export async function getRateTables(): Promise<IRateTable[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
}

export async function getFullRateTableById(
  id: number
): Promise<IRateTable | undefined> {
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
  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function updateRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
}