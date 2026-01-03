import { GET_TO_KNOW_API, GET_TO_KNOW_MISSION_API, GET_TO_KNOW_VISION_API } from "../../../constants/api";

export interface IGetToKnowData {
    id: string;
    page_id: string;
    type: string;
    bg_type: "image" | "video" | null;
    bg_url: string | null;
    bg_alt: string | null;
    title: string;
    subtitle: string | null;
    description: string;
    created_at: string;
    updated_at: string | null;
}

export interface IGetToKnowResponse {
    message: string;
    data: IGetToKnowData;
}

export const getGetToKnow = async (): Promise<IGetToKnowResponse> => {
    const response = await fetch(GET_TO_KNOW_API, {
        next: { tags: ['get-to-know'], revalidate: 3600 }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch Get To Know data");
    }
    return response.json();
};

export const getGetToKnowMission = async (): Promise<IGetToKnowResponse> => {
    const response = await fetch(GET_TO_KNOW_MISSION_API, {
        next: { tags: ['get-to-know-mission'], revalidate: 3600 }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch Get To Know Mission data");
    }
    return response.json();
};

export const getGetToKnowVision = async (): Promise<IGetToKnowResponse> => {
    const response = await fetch(GET_TO_KNOW_VISION_API, {
        next: { tags: ['get-to-know-vision'], revalidate: 3600 }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch Get To Know Vision data");
    }
    return response.json();
};
