import { NextRequest, NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '../_utils/resolveApiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();
const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');
const CLIENT_API_BASE_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');

export async function GET(request: NextRequest) {
  try {
    const baseUrls = Array.from(new Set([API_BASE_URL, CLIENT_API_BASE_URL]));
    const routePaths = ['/public/routes', '/routes'];

    for (const baseUrl of baseUrls) {
      for (const path of routePaths) {
        const response = await fetch(`${baseUrl}${path}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const routes = await response.json();
          return NextResponse.json(routes);
        }
      }
    }

    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 404 });
  } catch (error) {
    console.error('Routes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
