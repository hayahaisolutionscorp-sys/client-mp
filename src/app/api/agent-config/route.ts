import { NextRequest, NextResponse } from "next/server";

const API_V2_URL =
  process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL || "http://localhost:3002";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get("tenantId") || "1";
  const agentType = url.searchParams.get("type") || "trip-search";

  try {
    const res = await fetch(
      `${API_V2_URL}/knowledge-base/agent-config/${tenantId}/${agentType}`,
      { cache: "no-store" } // no cache in dev; use ISR in production
    );

    if (!res.ok) {
      return NextResponse.json({ config: null }, { status: 200 });
    }

    const data = await res.json();
    // Unwrap the SuccessResponseInterceptor wrapper if present
    const config = data?.data?.config || data?.config || null;
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Failed to fetch agent config:", error);
    return NextResponse.json({ config: null }, { status: 200 });
  }
}
