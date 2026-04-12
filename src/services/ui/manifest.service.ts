import seoData from '@/data/seo.json';
import { IBrandingConfig } from '@/models/branding.model';

export interface ManifestIcon {
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface ManifestScreenshot {
    src: string;
    sizes: string;
    type: string;
    form_factor?: 'wide' | 'narrow';
    label?: string;
}

export interface ManifestData {
    name: string;
    short_name: string;
    description: string;
    start_url: string;
    id?: string;
    display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
    background_color: string;
    theme_color: string;
    icons: ManifestIcon[];
    screenshots?: ManifestScreenshot[];
}

export const ManifestService = {
    getManifest: (brandingConfig?: IBrandingConfig | null): ManifestData => {
        const { manifest } = seoData.global;

        const dynamicName = brandingConfig?.brand_name?.trim();
        const dynamicThemeColor = brandingConfig?.colors?.primaryColor || brandingConfig?.colors?.primary;
        const dynamicFavicon = brandingConfig?.favicon_url?.trim();

        const dynamicIcons: ManifestIcon[] = dynamicFavicon && !dynamicFavicon.endsWith('.ico')
            ? [
                {
                    src: dynamicFavicon,
                    sizes: 'any',
                    type: 'image/png',
                    purpose: 'any'
                }
            ]
            : [];

        const mergedIcons = dynamicIcons.length > 0
            ? [...dynamicIcons, ...(manifest.icons as ManifestIcon[])]
            : (manifest.icons as ManifestIcon[]);

        return {
            name: dynamicName || manifest.name,
            short_name: dynamicName || manifest.short_name,
            description: seoData.global.description,
            start_url: manifest.start_url,
            id: manifest.id,
            display: manifest.display as any,
            background_color: manifest.background_color,
            theme_color: dynamicThemeColor || manifest.theme_color,
            icons: mergedIcons,
            screenshots: manifest.screenshots as ManifestScreenshot[]
        };
    }
};
