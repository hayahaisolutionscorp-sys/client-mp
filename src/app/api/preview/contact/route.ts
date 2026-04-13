export const dynamic = 'force-dynamic';
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { setContactDraft } from "@/lib/preview/contact-draft-store";
import type { ContactPreviewPayload } from "@/lib/preview/contact-preview";

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
  const payload = json as ContactPreviewPayload;
  const draftId = json.draftId || randomUUID();

  setContactDraft(draftId, payload);

  return NextResponse.json({ draftId }, { headers: corsHeaders });
}
