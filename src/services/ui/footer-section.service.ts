import { IFooterSection } from '@/models';
import { FOOTER_SECTION_API } from 'constants/api';


import footerSectionsData from '@/data/footer-sections.json';

export async function getFooterSections(): Promise<IFooterSection | undefined> {
  try {
    const res = await fetch(FOOTER_SECTION_API, {
      next: { tags: ['footer-sections'], revalidate: 3600 }
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

export async function getFooterSectionByShippingLineId(
  shippingLineId: number
): Promise<IFooterSection | undefined> {
  // try {
  //   const { data } = await axios.get(`${FOOTER_SECTION_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (footerSectionsData as IFooterSection[]).find(f => f.shippingLineId === shippingLineId);
}