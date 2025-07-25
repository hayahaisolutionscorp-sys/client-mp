import { IThumbnail } from '@/models';
import { THUMBNAIL_API } from 'constants/api';

export async function getThumbnails(): Promise<IThumbnail[] | undefined> {
  try {
    const response = await fetch(THUMBNAIL_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch thumbnails: ${response.status} ${response.statusText}`);
    }

    const data: IThumbnail[] = await response.json();
    return data;
  } catch (e) {
    console.error('Error fetching thumbnails:', e);
    throw e;
  }
}

export async function getThumbnailsByShippingLineId(location: string, shippingLineId: number): Promise<IThumbnail[]> {
  try {
    const response = await fetch(`${THUMBNAIL_API}/${location}/${shippingLineId}`, {
    });

    if (!response.ok) {
      throw new Error(`Error fetching thumbnails by shipping line id: ${response.statusText}`);
    }

    const thumbnails: IThumbnail[] = await response.json();
    return thumbnails;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
