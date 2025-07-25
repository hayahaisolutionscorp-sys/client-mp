import { IFooterSection } from '@/models';
import { FOOTER_SECTION_API } from 'constants/api';

export async function getFooterSections(): Promise<IFooterSection[] | undefined> {
  try {
    const response = await fetch(FOOTER_SECTION_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch footer sections: ${response.status} ${response.statusText}`);
    }

    const data: IFooterSection[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching footer sections:', e);
    throw e;
  }
}

export async function getFooterSectionByShippingLineId(
  shippingLineId: number
): Promise<IFooterSection | undefined> { 
  try {
    const response = await fetch(`${FOOTER_SECTION_API}/${shippingLineId}`);

    if (!response.ok) {
        throw new Error(`Error fetching footer section by shipping line id: ${response.statusText}`);
    }

    const footerSection: IFooterSection = await response.json();
    return footerSection;

  } catch (e) {
    console.error(e);
    throw e;
  }
}