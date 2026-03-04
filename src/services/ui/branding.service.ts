import { BRANDING_API } from 'constants/api';
import { IBrandingConfig, IBrandingResponse } from '@/models/branding.model';
import brandingData from '@/data/branding.json';
import { IS_BUILD_TIME } from '../config';

export type BrandingSource = 'api' | 'fallback';

export interface BrandingConfigResult {
    data: IBrandingConfig;
    source: BrandingSource;
}

export const getBrandingConfigWithSource = async (init?: RequestInit): Promise<BrandingConfigResult> => {
    if (IS_BUILD_TIME) {
        return {
            data: brandingData as unknown as IBrandingConfig,
            source: 'fallback'
        };
    }

    try {
        const res = await fetch(`${BRANDING_API}`, {
            ...init,
            // next: { tags: ['branding'], revalidate: 3600 }
        });

        if (res.ok) {
            const response: IBrandingResponse = await res.json();
            if (response.data) {
                return {
                    data: response.data,
                    source: 'api'
                };
            }
        }

        return {
            data: brandingData as unknown as IBrandingConfig,
            source: 'fallback'
        };
    } catch (error) {
        if (typeof window === 'undefined') {
            console.error('Error fetching branding config:', error);
        }

        return {
            data: brandingData as unknown as IBrandingConfig,
            source: 'fallback'
        };
    }
};

export const getBrandingConfig = async (): Promise<IBrandingConfig> => {
    const result = await getBrandingConfigWithSource();
    return result.data;
};
