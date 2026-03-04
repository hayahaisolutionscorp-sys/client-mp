import { DESTINATIONS_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import destinationsData from '@/data/destinations.json';

export interface IDestination {
    id: string;
    route: string;
    image_url: string;
    image_alt: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string | null;
}

export interface IDestinationsResponse {
    message: string;
    data: IDestination[];
}

export async function getDestinations(): Promise<IDestination[]> {
    try {
        if (!IS_CLIENT) {
            return destinationsData as IDestination[];
        }

        const res = await fetch(DESTINATIONS_API, {
            // next: { tags: ['destinations'], revalidate: 3600 }
        });

        if (res.ok) {
            const { data } = await res.json();
            return data;
        }

        return destinationsData as IDestination[];
    } catch (e) {
        if (typeof window === 'undefined') {
            console.error('Error fetching destinations:', e);
        }
        return destinationsData as IDestination[];
    }
}
