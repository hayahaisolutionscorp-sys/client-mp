import { PASSENGER_TYPES_ACTIVE_API } from '../../../constants/api';
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

export const getActivePassengerTypes = async (): Promise<PassengerType[]> => {
    try {
        const response = await axios.get(PASSENGER_TYPES_ACTIVE_API);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch active passenger types:', error);
        return [];
    }
};
