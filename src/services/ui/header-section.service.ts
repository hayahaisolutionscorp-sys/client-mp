import { IHeaderSection } from '@/models';
import { HEADER_SECTION_API } from 'constants/api';

export async function getHeadersSections(): Promise<IHeaderSection[] | undefined> {
  try {
    const response = await fetch(HEADER_SECTION_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch header sections: ${response.status} ${response.statusText}`);
    }

    const data: IHeaderSection[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching header sections:', e);
    throw e;
  }
}

export async function getHeaderSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeaderSection | undefined> { 
  try {
    const response = await fetch(`${HEADER_SECTION_API}/${shippingLineId}`);

    if (!response.ok) {
        throw new Error(`Error fetching header section by shipping line id: ${response.statusText}`);
    }

    const headerSection: IHeaderSection = await response.json();
    return headerSection;

  } catch (e) {
    console.error(e);
    throw e;
  }
}