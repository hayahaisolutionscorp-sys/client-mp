import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setLandingDraft } from "@/lib/preview/landing-draft-store";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const payload = json as LandingPreviewPayload;
  
  // Reuse existing draftId if provided to prevent iframe re-loading in builder
  const draftId = json.draftId || randomUUID();

  setLandingDraft(draftId, payload);

  return NextResponse.json(
    { draftId },
    {
      headers: corsHeaders,
    }
  );
}
