import { IPress } from '@/models';
import { PRESS_API } from 'constants/api';

export async function getPress(): Promise<IPress[] | undefined> {
  try {
    const response = await fetch(PRESS_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch press: ${response.status} ${response.statusText}`);
    }

    const data: IPress[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching press:', e);
    throw e;
  }
}

export async function getPressByShippingLineId(
  shippingLineId: number
): Promise<IPress[] | undefined> {
  try {
    const response = await fetch(`${PRESS_API}/${shippingLineId}`);

    if (!response.ok) {
      throw new Error(`Error fetching press by shipping line id: ${response.statusText}`);
    }

    const press: IPress[] = await response.json();

    return press
      .filter((item) => item.isPublish)
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getPressById(
  id: number
): Promise<IPress | undefined> { 
  try {
    const response = await fetch(`${PRESS_API}/item/${id}`);

    if (!response.ok) {
        throw new Error(`Error fetching press by id: ${response.statusText}`);
    }

    const press: IPress = await response.json();
    return press;

  } catch (e) {
    console.error(e);
    throw e;
  }
}