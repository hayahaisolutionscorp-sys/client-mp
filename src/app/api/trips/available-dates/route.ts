import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const origin_code = searchParams.get("origin_code");
        const destination_code = searchParams.get("destination_code");
        const limit = searchParams.get("limit") || "5";

        if (!origin_code || !destination_code) {
            return NextResponse.json(
                { error: "Missing required parameters: origin_code, destination_code" },
                { status: 400 }
            );
        }

        const backendParams = new URLSearchParams({
            origin_code,
            destination_code,
            limit,
        });

        const response = await fetch(`${API_URL}/public/trips/available-dates?${backendParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Backend error fetching available dates:", await response.text());
            return NextResponse.json(
                { error: "Failed to fetch available dates" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Available dates API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
