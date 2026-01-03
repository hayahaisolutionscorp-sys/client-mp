import { PROMOS_API } from 'constants/api';


export interface IPromo {
    id: string;
    title: string | null;
    description: string | null;
    image_url: string;
    image_alt: string;
    start_date: string | null;
    end_date: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface IPromosResponse {
    message: string;
    data: IPromo[];
}

export async function getPromos(): Promise<IPromo[]> {
    try {
        const res = await fetch(PROMOS_API, {
            next: { tags: ['promos'], revalidate: 3600 }
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
