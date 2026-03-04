import { MetadataRoute } from 'next';
import { ManifestService } from '@/services/ui/manifest.service';
import { getBrandingConfig } from '@/services/ui/branding.service';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const brandingConfig = await getBrandingConfig();
    const data = ManifestService.getManifest(brandingConfig);

    return {
        name: data.name,
        short_name: data.short_name,
        description: data.description,
        start_url: data.start_url,
        id: data.id,
        display: data.display,
        background_color: data.background_color,
        theme_color: data.theme_color,
        icons: data.icons,
        screenshots: data.screenshots as any, // Cast to any because MetadataRoute.Manifest might have slightly different internal typing for screenshots in some Next.js versions
    };
}
