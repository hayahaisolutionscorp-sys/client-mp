import { IHeaderSection } from '@/models';
import { HEADER_SECTION_API } from 'constants/api';

import headerSectionsData from '@/data/header-sections.json';

export async function getHeadersSections(): Promise<IHeaderSection[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return headerSectionsData as IHeaderSection[];
}

export async function getHeaderSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeaderSection | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (headerSectionsData as IHeaderSection[]).find(h => h.shippingLineId === shippingLineId);
}