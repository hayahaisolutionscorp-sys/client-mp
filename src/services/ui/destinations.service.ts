import { DESTINATIONS_API } from 'constants/api';


export interface IDestination {
    id: string;
    route: string;
    image_url: string;
    image_alt: string;
    is_featured: boolean;
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
        const res = await fetch(DESTINATIONS_API, {
            next: { tags: ['destinations'], revalidate: 3600 }
        });

        if (res.ok) {
            const { data } = await res.json();
            return data;
        }

        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
