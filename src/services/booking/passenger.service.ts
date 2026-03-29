import { PASSENGER_TYPES_ACTIVE_API, IS_CLIENT } from '../../../constants/api';
import axios from 'axios';

export interface PassengerType {
    id: number;
    code: string;
    name: string;
    description: string;
    age_min: number | null;
    age_max: number | null;
    requires_id: boolean;
    sort_order: number;
    is_active: boolean;
}

export const getActivePassengerTypes = async (shippingLineId?: string): Promise<PassengerType[]> => {
    try {
        const url = !IS_CLIENT && shippingLineId
            ? `${PASSENGER_TYPES_ACTIVE_API}?shipping_line_id=${shippingLineId}`
            : PASSENGER_TYPES_ACTIVE_API;
        const response = await axios.get(url);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch active passenger types:', error);
        return [];
    }
};
