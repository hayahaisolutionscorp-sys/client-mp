import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get("tenantId") || "1";

        const response = await fetch(`${API_URL}/public/routes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Backend error fetching routes:", await response.text());
            return NextResponse.json(
                { error: "Failed to fetch routes" },
                { status: response.status }
            );
        }

        const routes = await response.json();
        return NextResponse.json(routes);
    } catch (error) {
        console.error("Routes API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
