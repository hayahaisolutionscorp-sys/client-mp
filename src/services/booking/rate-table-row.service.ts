import { IRateTableRow } from '@/models';
import { RATE_TABLE_ROWS_API } from 'constants/api';

export async function getRateTableRowsByRateTableId(
  rateTableId: number
): Promise<IRateTableRow | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (rateTableId === 0) return;

  return {
    id: 1,
    rateTableId: rateTableId,
    // Add other fields as necessary based on IRateTableRow interface, or cast as any if complex
  } as any as IRateTableRow;
}