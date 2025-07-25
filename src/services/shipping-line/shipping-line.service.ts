import { IShippingLine } from '@/models';
import { SHIPPING_LINE_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';

export async function getAllShippingLines(): Promise<IShippingLine[] | undefined> {
  const cachedShippingLines = fetchItem<IShippingLine[]>('shipping-lines');
  if (cachedShippingLines) return cachedShippingLines;

  try {
    const response = await fetch(SHIPPING_LINE_API);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch shipping lines: ${response.status} ${response.statusText}`);
    }

    const data: IShippingLine[] = await response.json();
    cacheItem('shipping-lines', data, 1);
    return data;

  } catch (e) {
    console.error('Error fetching shipping lines:', e);
    throw e;
  }
}

export async function getAllShippingLinesServer(): Promise<IShippingLine[] | undefined> {
  try {
    const response = await fetch(SHIPPING_LINE_API, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch shipping lines: ${response.status} ${response.statusText}`);
    }

    const data: IShippingLine[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching shipping lines:', e);
    throw e;
  }
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
