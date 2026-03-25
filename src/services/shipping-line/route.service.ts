import { ROUTE_API } from 'constants/api';
import { IRoute } from '@/models/shipping-line/route.model';

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');
const CLIENT_API_BASE_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
const EFFECTIVE_ROUTE_BASE_URL = ROUTE_API.replace(/\/routes\/?$/, '');

export async function getRoutes(): Promise<IRoute[]> {
    const routeEndpoints = Array.from(new Set([
        ROUTE_API,
        `${EFFECTIVE_ROUTE_BASE_URL}/public/routes`,
        `${CLIENT_API_BASE_URL}/routes`,
        `${CLIENT_API_BASE_URL}/public/routes`,
    ]));

    try {
        for (const endpoint of routeEndpoints) {
            const res = await fetch(endpoint, {
                next: { tags: ['routes'], revalidate: 3600 }
            });

            if (res.ok) {
                const payload = await res.json();
                return payload?.data || payload || [];
            }
        }
    } catch (error) {
        console.error('Failed to fetch routes:', error);
    }
    return [];
}
