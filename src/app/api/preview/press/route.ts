import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { setPressDraft } from "@/lib/preview/press-draft-store";
import type { PressPreviewPayload } from "@/lib/preview/press-preview";

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
  const payload = json as PressPreviewPayload;
  const draftId = json.draftId || randomUUID();

  setPressDraft(draftId, payload);

  return NextResponse.json({ draftId }, { headers: corsHeaders });
}
