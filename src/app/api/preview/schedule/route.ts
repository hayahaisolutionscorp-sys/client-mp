import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { setScheduleDraft } from "@/lib/preview/schedule-draft-store";
import type { SchedulePreviewPayload } from "@/lib/preview/schedule-preview";

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
  const payload = json as SchedulePreviewPayload;
  const draftId = json.draftId || randomUUID();

  setScheduleDraft(draftId, payload);

  return NextResponse.json(
    { draftId },
    {
      headers: corsHeaders,
    }
  );
}
