import { IFooterSection } from '@/models';
import { FOOTER_SECTION_API } from 'constants/api';

import footerSectionsData from '@/data/footer-sections.json';

export async function getFooterSections(): Promise<IFooterSection[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return footerSectionsData as IFooterSection[];
}

export async function getFooterSectionByShippingLineId(
  shippingLineId: number
): Promise<IFooterSection | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (footerSectionsData as IFooterSection[]).find(f => f.shippingLineId === shippingLineId);
}