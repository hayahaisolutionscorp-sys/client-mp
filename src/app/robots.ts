import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    if (process.env.NODE_ENV === 'development') {
        return {
            rules: {
                userAgent: '*',
                disallow: '/',
            },
        };
    }

    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: 'https://ayahay.com/sitemap.xml',
    };
}
