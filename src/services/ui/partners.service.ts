import { OUR_PARTNERS_API } from "../../../constants/api";
import { IS_CLIENT } from '../config';

import partnersData from '@/data/partners.json';

export interface IPartner {
    id: string;
    name: string;
    logo_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface IPartnersResponse {
    message: string;
    data: IPartner[];
}

export const getPartners = async (): Promise<IPartnersResponse> => {
    if (!IS_CLIENT) {
        return {
            message: "Partners successfully fetched.",
            data: partnersData as IPartner[]
        };
    }

    const response = await fetch(OUR_PARTNERS_API, {
        // next: { tags: ['partners'], revalidate: 3600 }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch Partners data");
    }
    return response.json();
};
