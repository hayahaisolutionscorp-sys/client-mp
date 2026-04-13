export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setAboutDraft } from "@/lib/preview/about-draft-store";
import type { AboutPreviewPayload } from "@/lib/preview/about-preview";

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
  const payload = json as AboutPreviewPayload;
  const draftId = json.draftId || randomUUID();

  setAboutDraft(draftId, payload);

  return NextResponse.json(
    { draftId },
    {
      headers: corsHeaders,
    }
  );
}
