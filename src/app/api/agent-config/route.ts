import { NextRequest, NextResponse } from 'next/server';
import { resolveKnowledgeBaseUrl } from '../_utils/resolveApiBaseUrl';

const API_BASE_URL = resolveKnowledgeBaseUrl();
const MARKETPLACE_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '1';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenantId') || MARKETPLACE_TENANT_ID;
  const agentType = url.searchParams.get('type') || 'trip-search';

  try {
    const res = await fetch(
      `${API_BASE_URL}/knowledge-base/agent-config/${tenantId}/${agentType}`,
      { cache: 'no-store' } // no cache in dev; use ISR in production
    );

    if (!res.ok) {
      return NextResponse.json({ config: null }, { status: 200 });
    }

    const data = await res.json();
    // Unwrap the SuccessResponseInterceptor wrapper if present
    const config = data?.data?.config || data?.config || null;
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ config: null }, { status: 200 });
  }
}
