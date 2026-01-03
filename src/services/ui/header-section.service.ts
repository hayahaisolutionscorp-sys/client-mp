import { IHeaderSection } from '@/models';
import { HEADER_SECTION_API } from 'constants/api';


import headerSectionsData from '@/data/header-sections.json';

export async function getHeadersSections(): Promise<IHeaderSection | undefined> {
  try {
    const res = await fetch(HEADER_SECTION_API, {
      next: { tags: ['header-sections'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return undefined;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getHeaderSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeaderSection | undefined> {
  // try {
  //   const { data } = await axios.get(`${HEADER_SECTION_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (headerSectionsData as IHeaderSection[]).find(h => h.shippingLineId === shippingLineId);
}