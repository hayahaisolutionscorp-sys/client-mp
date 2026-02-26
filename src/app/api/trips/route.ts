import { NextRequest, NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '../_utils/resolveApiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin_code = searchParams.get('origin_code');
    const destination_code = searchParams.get('destination_code');
    const departure_date = searchParams.get('departure_date');
    const passenger_count = searchParams.get('passenger_count') || '1';
    const vehicle_count = searchParams.get('vehicle_count') || '0';
    const sort = searchParams.get('sort') || 'departureDate';
    const page = searchParams.get('page') || '1';

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
      passenger_count: String(parseInt(passenger_count, 10)),
      vehicle_count: String(parseInt(vehicle_count, 10)),
      sort,
      page: String(parseInt(page, 10))
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
