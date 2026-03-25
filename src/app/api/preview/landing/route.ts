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
  const payload = (await request.json()) as LandingPreviewPayload;
  const draftId = randomUUID();

  setLandingDraft(draftId, payload);

  return NextResponse.json(
    { draftId },
    {
      headers: corsHeaders,
    }
  );
}
