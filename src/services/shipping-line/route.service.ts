import { ROUTE_API } from 'constants/api';
import { IRoute } from '@/models/shipping-line/route.model';

export async function getRoutes(): Promise<IRoute[]> {
    try {
        const res = await fetch(ROUTE_API, {
            next: { tags: ['routes'], revalidate: 3600 }
        });

        if (res.ok) {
            const { data } = await res.json();
            return data || [];
        }
    } catch (error) {
        console.error('Failed to fetch routes:', error);
    }
    return [];
}
