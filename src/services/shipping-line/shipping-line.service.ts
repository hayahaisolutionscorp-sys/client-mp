import { IShippingLine } from '@/models';
import { SHIPPING_LINE_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';

import shippingLinesData from '@/data/shipping-lines.json';

export async function getAllShippingLines(): Promise<IShippingLine[] | undefined> {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return shippingLinesData as any as IShippingLine[];
}

export async function getAllShippingLinesServer(): Promise<IShippingLine[] | undefined> {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return shippingLinesData as any as IShippingLine[];
}

export async function getShippingLineServer(
  shippingLineId: number
): Promise<IShippingLine | undefined> {
  const shippingLines = await getAllShippingLinesServer();
  return shippingLines?.find(
    (shippingLine) => shippingLine.id === shippingLineId
  );
}

export async function getShippingLine(
  shippingLineId: number
): Promise<IShippingLine | undefined> {
  const shippingLines = await getAllShippingLines();
  return shippingLines?.find(
    (shippingLine) => shippingLine.id === shippingLineId
  );
}
