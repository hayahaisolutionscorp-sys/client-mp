import { MetadataRoute } from 'next';
import { getGlobalMetadata } from '@/services/content/seo.service';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const metadata = await getGlobalMetadata();
    const manifestData = metadata.manifest || {
        name: 'Ayahay Marketplace',
        short_name: 'Ayahay',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };

    return manifestData;
}
