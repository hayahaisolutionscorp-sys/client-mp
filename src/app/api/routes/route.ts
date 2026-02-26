import { NextRequest, NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '../_utils/resolveApiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '1';

    const response = await fetch(`${API_BASE_URL}/public/routes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Backend error fetching routes:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch routes' }, { status: response.status });
    }

    const routes = await response.json();
    return NextResponse.json(routes);
  } catch (error) {
    console.error('Routes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
