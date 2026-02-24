import { ICommodity } from "@/models";
import { COMMODITIES_API } from "constants/api";

interface CommoditiesResponse {
    message: string;
    data: {
        results: ICommodity[];
        total: number;
        page: number;
        page_size: number;
    };
}

export async function getCommodities(): Promise<ICommodity[] | undefined> {
    try {
        const response = await fetch(`${COMMODITIES_API}?page=1&page_size=500&order_by=+name`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch commodities: ${response.statusText}`);
        }

        const result: CommoditiesResponse = await response.json();
        const commodities = result.data.results;

        return commodities;
    } catch (e) {
        console.error('Error fetching commodities:', e);
        return undefined;
    }
}

export async function getCommodity(
    commodityId: number
): Promise<ICommodity | undefined> {
    const commodities = await getCommodities();
    return commodities?.find((commodity) => commodity.id === commodityId);
}
