import type { Metadata } from "next";
import { getGlobalMetadata } from '@/services/content/seo.service';
import { getBrandingConfig } from '@/services/ui/branding.service';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalMetadata();
  const branding = await getBrandingConfig();
  const title = typeof seo.title === 'string' ? { default: seo.title, template: `%s | ${seo.title}` } : seo.title;
  const description = seo.description || "Short, clear description of your app or website.";

  return {
    // metadataBase: new URL("https://ayahay.com"),

    // title: {
    //   default: (title as any).default || "Ayahay",
    //   template: (title as any).template || "%s | Ayahay",
    // },

    // description: description,

    // applicationName: "Ayahay",
    // generator: "Next.js",
    // referrer: "origin-when-cross-origin",
    // keywords: ["next.js", "react", "seo", "ferry", "booking", "philippines"],
    // creator: "Ayahay Team",
    // publisher: "Ayahay",

    // robots: {
    //   index: true,
    //   follow: true,
    //   googleBot: {
    //     index: true,
    //     follow: true,
    //     "max-image-preview": "large",
    //     "max-snippet": -1,
    //   },
    // },

    // alternates: {
    //   canonical: "/",
    // },

    // openGraph: {
    //   title: (title as any).default || "Ayahay",
    //   description: description,
    //   url: "/",
    //   siteName: "Ayahay",
    //   images: seo.openGraph?.images || [
    //     {
    //       url: "/og.png",
    //       width: 1200,
    //       height: 630,
    //       alt: "Ayahay preview",
    //     },
    //   ],
    //   locale: seo.openGraph?.locale || "en_US",
    //   type: "website",
    // },

    // twitter: {
    //   card: "summary_large_image",
    //   title: (title as any).default || "Ayahay",
    //   description: description,
    //   images: seo.openGraph?.images?.map((img: any) => img.url) || ["/og.png"],
    // },

    icons: branding?.favicon_url ? {
      icon: branding.favicon_url,
      apple: branding.favicon_url,
    } : seo.icons || {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    // manifest: "/manifest.json", // Handled by src/app/manifest.ts
  };
}
