import seoData from '@/data/seo.json';

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
    getManifest: (): ManifestData => {
        const { manifest } = seoData.global;
        return {
            name: manifest.name,
            short_name: manifest.short_name,
            description: seoData.global.description,
            start_url: manifest.start_url,
            id: manifest.id,
            display: manifest.display as any,
            background_color: manifest.background_color,
            theme_color: manifest.theme_color,
            icons: manifest.icons as ManifestIcon[],
            screenshots: manifest.screenshots as ManifestScreenshot[]
        };
    }
};
