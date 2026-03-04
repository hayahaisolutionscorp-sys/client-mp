import { NextResponse } from 'next/server';
import { EFFECTIVE_API_BASE_URL } from 'constants/api';
import { getBrandingConfigWithSource } from '@/services/ui/branding.service';
import { ManifestService } from '@/services/ui/manifest.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brandingResult = await getBrandingConfigWithSource({ cache: 'no-store' });
    const manifest = ManifestService.getManifest(brandingResult.data);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        isClientMode: process.env.NEXT_PUBLIC_IS_CLIENT === 'true',
        effectiveApiBaseUrl: EFFECTIVE_API_BASE_URL
      },
      branding: {
        source: brandingResult.source,
        brandName: brandingResult.data?.brand_name || null,
        domainName: brandingResult.data?.domain_name || null,
        subdomainName: brandingResult.data?.subdomain_name || null,
        faviconUrl: brandingResult.data?.favicon_url || null,
        colors: brandingResult.data?.colors || null,
        logo: brandingResult.data?.logo || null
      },
      pwaManifest: manifest
    });
  } catch (error) {
    console.error('PWA debug endpoint failed:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to resolve PWA debug info'
      },
      { status: 500 }
    );
  }
}
