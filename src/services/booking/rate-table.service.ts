import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import { RATE_TABLES_API } from 'constants/api';
import { IRateTable, IRateTableMarkup } from '@/models';

export async function getRateTableById(
  rateTableId: number
): Promise<IRateTable | undefined> {
  const cachedRateTables =
    fetchItem<{ [rateTableId: number]: IRateTable }>('rate-tables-by-id') ?? {};

  if (cachedRateTables[rateTableId]) {
    return cachedRateTables[rateTableId];
  }

  try {
    const response = await fetch(`${RATE_TABLES_API}/${rateTableId}`);
    if (!response.ok) {
      throw new Error(`Error fetching rate table: ${response.statusText}`);
    }

    const rateTable: IRateTable = await response.json();
    cachedRateTables[rateTableId] = rateTable;
    cacheItem('rate-tables-by-id', cachedRateTables, 60);
    return rateTable;

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getRateTables(): Promise<IRateTable[] | undefined> {
  try {
    const response = await fetch(RATE_TABLES_API);

    if (!response.ok) {
      throw new Error(`Error fetching rate tables: ${response.statusText}`);
    }

    return await response.json();

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getFullRateTableById(
  id: number
): Promise<IRateTable | undefined> {
  try {
    const response = await fetch(`${RATE_TABLES_API}/${id}/full`);

    if (!response.ok) {
      throw new Error(`Error fetching full rate table: ${response.statusText}`);
    }

    return await response.json();

  } catch (e) {
    console.error(e);
    throw e;
  }
}

// export function buildRateTableMarkupFromForm(
//   form: FormInstance
// ): IRateTableMarkup {
//   return {
//     id: form.getFieldValue('id'),
//     rateTableId: form.getFieldValue('rateTableId'),
//     travelAgencyId: form.getFieldValue('travelAgencyId'),
//     clientId: form.getFieldValue('clientId'),

//     markupFlat: form.getFieldValue('markupFlat'),
//     markupPercent: form.getFieldValue('markupPercent') / 100.0,
//     markupMaxFlat: form.getFieldValue('markupMaxFlat'),
//   };
// }

export async function createRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  try {
    const response = await fetch(`${RATE_TABLES_API}/${rateTableId}/markups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rateMarkup),
    });

    if (!response.ok) {
      throw new Error(`Error creating rate markup: ${response.statusText}`);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function updateRateMarkup(
  rateTableId: number,
  rateMarkup: IRateTableMarkup
): Promise<void> {
  try {
    const response = await fetch(
      `${RATE_TABLES_API}/${rateTableId}/markups/${rateMarkup.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rateMarkup),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating rate markup: ${response.statusText}`);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}