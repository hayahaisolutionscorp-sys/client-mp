import { BRANDING_API } from 'constants/api';
import { IBrandingConfig, IBrandingResponse } from '@/models/branding.model';
import brandingData from '@/data/branding.json';
import { IS_CLIENT } from '../config';

export const getBrandingConfig = async (): Promise<IBrandingConfig> => {
    try {
        if (!IS_CLIENT) {
            return brandingData as unknown as IBrandingConfig;
        }

        const res = await fetch(`${BRANDING_API}`, {
            next: { tags: ['branding'], revalidate: 3600 }
        });

        if (res.ok) {
            const response: IBrandingResponse = await res.json();
            if (response.data) return response.data;
        }
        return brandingData as unknown as IBrandingConfig;
    } catch (error) {
        if (typeof window === 'undefined') {
            console.error('Error fetching branding config:', error);
        }
        return brandingData as unknown as IBrandingConfig;
    }
};
