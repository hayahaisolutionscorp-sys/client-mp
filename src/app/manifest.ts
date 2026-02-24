import { MetadataRoute } from 'next';
import { ManifestService } from '@/services/ui/manifest.service';

export default function manifest(): MetadataRoute.Manifest {
    const data = ManifestService.getManifest();

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
