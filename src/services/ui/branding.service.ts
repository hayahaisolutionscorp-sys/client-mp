import { BRANDING_API } from 'constants/api';
import { IBrandingConfig, IBrandingResponse } from '@/models/branding.model';

export const getBrandingConfig = async (): Promise<IBrandingConfig | null> => {
    try {
        const res = await fetch(`${BRANDING_API}`, {
            next: { tags: ['branding'], revalidate: 3600 }
        });

        if (res.ok) {
            const response: IBrandingResponse = await res.json();
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching branding config:', error);
        return null;
    }
};
