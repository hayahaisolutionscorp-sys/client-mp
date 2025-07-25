import { IFaq } from '@/models';
import { FAQ_API } from 'constants/api';

export async function getFaqs(): Promise<IFaq[] | undefined> {
  try {
    const response = await fetch(FAQ_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch faqs: ${response.status} ${response.statusText}`);
    }

    const data: IFaq[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching faqs:', e);
    throw e;
  }
}

export async function getFaqsByShippingLineId(
  shippingLineId: number
): Promise<IFaq[] | undefined> { 
  try {
    const response = await fetch(`${FAQ_API}/${shippingLineId}`);

    if (!response.ok) {
        throw new Error(`Error fetching faqs by shipping line id: ${response.statusText}`);
    }

    const faqs: IFaq[] = await response.json();
    return faqs;

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getFaqsByCategoryAndShippingLineId(
  category: string,
  shippingLineId: number
): Promise<IFaq[] | undefined> { 
  try {
    const response = await fetch(`${FAQ_API}/${category}/${shippingLineId}`);

    if (!response.ok) {
        throw new Error(`Error fetching faqs by category and shipping line id: ${response.statusText}`);
    }

    const faqs: IFaq[] = await response.json();
    return faqs;

  } catch (e) {
    console.error(e);
    throw e;
  }
}