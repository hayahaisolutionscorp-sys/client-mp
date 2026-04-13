export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setFaqDraft } from "@/lib/preview/faq-draft-store";
import type { FaqPreviewPayload } from "@/lib/preview/faq-preview";

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
  const payload = json as FaqPreviewPayload;
  const draftId = json.draftId || randomUUID();

  setFaqDraft(draftId, payload);

  return NextResponse.json({ draftId }, { headers: corsHeaders });
}
