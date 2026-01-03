import { OUR_PARTNERS_API } from "../../../constants/api";

export interface IPartner {
    id: string;
    name: string;
    logo_url: string;
    created_at: string;
    updated_at: string | null;
}

export interface IPartnersResponse {
    message: string;
    data: IPartner[];
}

export const getPartners = async (): Promise<IPartnersResponse> => {
    const response = await fetch(OUR_PARTNERS_API, {
        next: { tags: ['partners'], revalidate: 3600 }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch Partners data");
    }
    return response.json();
};
