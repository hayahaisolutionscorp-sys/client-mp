import { TERMS_AND_CONDITIONS_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import termsAndConditionsData from '@/data/terms-and-conditions.json';

export interface ITermsAndConditions {
    id: string;
    page_type: string;
    title: string;
    content: any; // TipTap JSON content
    slug: string;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export async function getTermsAndConditions(): Promise<ITermsAndConditions | undefined> {
    try {
        if (!IS_CLIENT) {
            return termsAndConditionsData as ITermsAndConditions;
        }

        const res = await fetch(TERMS_AND_CONDITIONS_API, {
            next: { tags: ['terms-and-conditions'], revalidate: 3600 }
        });

        if (res.ok) {
            const { data } = await res.json();
            return data;
        }

        return undefined;
    } catch (e) {
        if (typeof window === 'undefined') {
            console.error('Error fetching terms and conditions:', e);
        }
        return undefined;
    }
}
