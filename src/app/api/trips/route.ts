import { NextRequest, NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '../_utils/resolveApiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();

function normalizeDateParam(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin_code = searchParams.get('origin_code');
    const destination_code = searchParams.get('destination_code');
    const departure_date = normalizeDateParam(searchParams.get('departure_date'));
    const passenger_count = searchParams.get('passenger_count') || '1';
    const sort = searchParams.get('sort') || 'departureDate';
    const page = searchParams.get('page') || '1';

    const parsedPassengerCount = Number.parseInt(passenger_count, 10);
    const parsedPage = Number.parseInt(page, 10);

    if (!origin_code || !destination_code || !departure_date) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin_code, destination_code, departure_date' },
        { status: 400 }
      );
    }

    // Build query string for backend - convert to integers where needed
    const backendParams = new URLSearchParams({
      origin_code,
      destination_code,
      departure_date,
      passenger_count: String(Number.isFinite(parsedPassengerCount) && parsedPassengerCount > 0 ? parsedPassengerCount : 1),
      sort,
      page: String(Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1)
    });

    const response = await fetch(`${API_BASE_URL}/public/trips?${backendParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Backend error fetching trips:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: response.status });
    }

    const trips = await response.json();
    return NextResponse.json(trips);
  } catch (error) {
    console.error('Trips API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
