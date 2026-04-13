export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setLoginDraft } from "@/lib/preview/login-draft-store";
import type { LoginPreviewPayload } from "@/lib/preview/login-preview";

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
  const payload = json as LoginPreviewPayload;
  const draftId = json.draftId || randomUUID();

  setLoginDraft(draftId, payload);

  return NextResponse.json(
    { draftId },
    {
      headers: corsHeaders,
    }
  );
}
