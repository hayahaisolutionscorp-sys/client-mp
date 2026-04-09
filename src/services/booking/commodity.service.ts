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

export async function getCommodities(shippingLineId?: string): Promise<ICommodity[] | undefined> {
    try {
        const params = new URLSearchParams({ page: '1', page_size: '500', order_by: '+name' });
        // if (shippingLineId) {
        //     params.append('shipping_line_id', shippingLineId);
        // }
        // TODO: Temporary workaround. Re-enable shipping_line_id after client-api so we can book properly temporarily
        // commodities query DTO supports this field. Causing errors on the marketplace booking
        void shippingLineId;
        const response = await fetch(`${COMMODITIES_API}?${params.toString()}`, {
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
