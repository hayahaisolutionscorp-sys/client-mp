import { NextRequest, NextResponse } from "next/server";

// Knowledge base endpoints are on api-v2 (port 3002), not client-api (port 3000)
const KNOWLEDGE_BASE_API_URL = process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL || "http://localhost:3002";

export interface BookingContext {
    srcPort?: string;
    destPort?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: {
        adults: number;
        children: number;
        seniors: number;
        pwd: number;
    };
    step?: "greeting" | "ports" | "date" | "passengers" | "results" | "booking";
}

export interface ChatBookingResponse {
    message: string;
    interactive?: {
        type: "quick_reply" | "date_picker" | "passenger_selector" | "trip_results" | "port_selector";
        data: unknown;
    };
    context?: BookingContext;
    tripResults?: TripResult[];
}

export interface TripResult {
    id: string;
    shippingLine: string;
    vesselName: string;
    srcPort: string;
    destPort: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    availableSeats: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, context } = body;

        // Get current date/time in PHT (Philippine Time)
        const phtDate = new Date().toLocaleDateString('en-PH', {
            timeZone: 'Asia/Manila',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const phtTime = new Date().toLocaleTimeString('en-PH', {
            timeZone: 'Asia/Manila',
            hour: '2-digit',
            minute: '2-digit'
        });
        const isoDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); // YYYY-MM-DD format

        // Extract the latest user message and add date context
        const userMessage = messages?.[messages.length - 1]?.content || "";
        const latestMessage = `[CURRENT_DATE: ${phtDate}, ${phtTime} PHT | Today is ${isoDate}]\n\nUser: ${userMessage}`;

        // Build history from previous messages
        const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
        if (messages && messages.length > 1) {
            for (const msg of messages.slice(0, -1)) {
                const role = msg.role === 'user' ? 'user' : 'assistant';
                if (msg.content) {
                    history.push({ role, content: msg.content });
                }
            }
        }

        // Call the backend knowledge-base chat endpoint
        const response = await fetch(`${KNOWLEDGE_BASE_API_URL}/knowledge-base/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
            body: JSON.stringify({
                query: latestMessage,
                agentId: "booking-assistant",
                history,
                tenantId: 1,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend error:", errorText);
            return NextResponse.json(
                {
                    message: "I'm having trouble connecting right now. Please try again!",
                    interactive: {
                        type: "quick_reply",
                        data: {
                            options: [
                                { label: "Try again", value: "retry" },
                                { label: "Use the form instead", value: "form" },
                            ],
                        },
                    },
                },
                { status: 200 }
            );
        }

        // Read the streaming response
        const reader = response.body?.getReader();
        let fullResponse = "";

        if (reader) {
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullResponse += decoder.decode(value, { stream: true });
            }
        }

        // Parse the response to extract structured data
        const parsedResponse = parseAIResponse(fullResponse, context);

        return NextResponse.json(parsedResponse);
    } catch (error) {
        console.error("Chat booking error:", error);
        return NextResponse.json(
            {
                message: "Something went wrong. Would you like to try again?",
                interactive: {
                    type: "quick_reply",
                    data: {
                        options: [
                            { label: "Try again", value: "retry" },
                            { label: "Use the form instead", value: "form" },
                        ],
                    },
                },
            },
            { status: 200 }
        );
    }
}

function parseAIResponse(
    response: string,
    context?: BookingContext
): ChatBookingResponse {
    const result: ChatBookingResponse = {
        message: response,
        context: context || {},
    };

    // Detect if AI is asking about ports
    const portKeywords = ["where", "destination", "going", "from", "to", "port"];
    const dateKeywords = ["when", "date", "travel", "depart"];
    const passengerKeywords = ["passenger", "people", "traveling", "how many"];
    const lowerResponse = response.toLowerCase();

    // Check for trip results in the response (from tool calls)
    const tripResultsMatch = response.match(/\[TRIPS\]([\s\S]*?)\[\/TRIPS\]/);
    if (tripResultsMatch) {
        try {
            const trips = JSON.parse(tripResultsMatch[1]);
            result.tripResults = trips;
            result.message = response.replace(/\[TRIPS\][\s\S]*?\[\/TRIPS\]/, "").trim();
            result.interactive = {
                type: "trip_results",
                data: { trips },
            };
            return result;
        } catch (e) {
            // Continue with normal parsing
        }
    }

    // Add interactive elements based on context analysis
    if (portKeywords.some(kw => lowerResponse.includes(kw)) && !context?.srcPort) {
        result.interactive = {
            type: "quick_reply",
            data: {
                options: [
                    { label: "Cebu to Bohol", value: "cebu_bohol" },
                    { label: "Cebu to Ormoc", value: "cebu_ormoc" },
                    { label: "Manila to Cebu", value: "manila_cebu" },
                    { label: "Other route", value: "other" },
                ],
            },
        };
    } else if (dateKeywords.some(kw => lowerResponse.includes(kw)) && context?.srcPort && !context?.departureDate) {
        result.interactive = {
            type: "date_picker",
            data: {
                minDate: new Date().toISOString(),
                maxDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            },
        };
    } else if (passengerKeywords.some(kw => lowerResponse.includes(kw)) && context?.departureDate && !context?.passengers) {
        result.interactive = {
            type: "passenger_selector",
            data: {
                defaults: { adults: 1, children: 0, seniors: 0, pwd: 0 },
            },
        };
    }

    return result;
}
