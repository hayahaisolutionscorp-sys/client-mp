import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const VALID_TAGS = [
  'branding',
  'destinations',
  'header-sections',
  'footer-sections',
  'landing-builder',
  'hero-sections',
  'why-choose-section',
  'why-choose-reasons',
  'get-to-know',
  'get-to-know-mission',
  'get-to-know-vision',
  'partners',
  'promos',
  'faqs',
  'privacy-policy',
  'terms-and-conditions',
  'ports',
  'routes',
  'seo',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags, secret } = body;

    // Simple secret check to prevent abuse
    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401, headers: corsHeaders });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { message: 'Missing or invalid "tags" array in request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    const revalidated: string[] = [];
    const skipped: string[] = [];

    for (const tag of tags) {
      if (typeof tag === 'string' && VALID_TAGS.includes(tag)) {
        revalidateTag(tag);
        revalidated.push(tag);
      } else {
        skipped.push(tag);
      }
    }

    return NextResponse.json({
      message: 'Revalidation complete',
      revalidated,
      skipped,
    }, { headers: corsHeaders });
  } catch {
    return NextResponse.json(
      { message: 'Failed to process revalidation request' },
      { status: 500, headers: corsHeaders }
    );
  }
}
