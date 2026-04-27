import { GET_TO_KNOW_API, GET_TO_KNOW_MISSION_API, GET_TO_KNOW_VISION_API } from '../../../constants/api';
import { SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';

import getToKnowData from '@/data/get-to-know.json';
import getToKnowMissionData from '@/data/get-to-know-mission.json';
import getToKnowVisionData from '@/data/get-to-know-vision.json';

export interface IGetToKnowData {
  id: string;
  page_id: string;
  type: string;
  bg_type: 'image' | 'video' | 'youtube' | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string;
  subtitle: string | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface IGetToKnowResponse {
  message: string;
  data: IGetToKnowData;
}

export const getGetToKnow = async (): Promise<IGetToKnowResponse> => {
  if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
    return {
      message: 'Page section with ID get_to_know successfully fetched.',
      data: getToKnowData as IGetToKnowData
    };
  }

  try {
    const response = await fetch(GET_TO_KNOW_API, {
      next: { tags: ['get-to-know'], revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Get To Know data');
    }
    return response.json();
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('Error fetching Get To Know data:', error);
    }
    return {
      message: 'Fallback to local data due to fetch error.',
      data: getToKnowData as IGetToKnowData
    };
  }
};

export const getGetToKnowMission = async (): Promise<IGetToKnowResponse> => {
  if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
    return {
      message: 'Page section with ID get_to_know_mission successfully fetched.',
      data: getToKnowMissionData as IGetToKnowData
    };
  }

  try {
    const response = await fetch(GET_TO_KNOW_MISSION_API, {
      next: { tags: ['get-to-know-mission'], revalidate: 3600 }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Get To Know Mission data');
    }
    return response.json();
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('Error fetching Get To Know Mission data:', error);
    }
    return {
      message: 'Fallback to local data due to fetch error.',
      data: getToKnowMissionData as IGetToKnowData
    };
  }
};

export const getGetToKnowVision = async (): Promise<IGetToKnowResponse> => {
  if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
    return {
      message: 'Page section with ID get_to_know_vision successfully fetched.',
      data: getToKnowVisionData as IGetToKnowData
    };
  }

  try {
    const response = await fetch(GET_TO_KNOW_VISION_API, {
      next: { tags: ['get-to-know-vision'], revalidate: 3600 }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Get To Know Vision data');
    }
    return response.json();
  } catch (error) {
    if (typeof window === 'undefined') {
      console.error('Error fetching Get To Know Vision data:', error);
    }
    return {
      message: 'Fallback to local data due to fetch error.',
      data: getToKnowVisionData as IGetToKnowData
    };
  }
};
