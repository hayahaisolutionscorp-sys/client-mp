import { IRateTableRow } from '@/models';
import { RATE_TABLE_ROWS_API } from 'constants/api';

export async function getRateTableRowsByRateTableId(
  rateTableId: number
): Promise<IRateTableRow | undefined> {
  try {
    if (rateTableId === 0) return;

    const response = await fetch(`${RATE_TABLE_ROWS_API}/${rateTableId}`);

    if (!response.ok) {
      throw new Error(`Error fetching rate table row: ${response.statusText}`);
    }

    const rateTableRow: IRateTableRow = await response.json();
    return rateTableRow;
    
  } catch (e) {
    console.error(e);
    throw e;
  }
}