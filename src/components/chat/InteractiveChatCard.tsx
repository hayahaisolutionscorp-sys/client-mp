"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, FormInput, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import DatePickerPopup from "./DatePickerPopup";
import TripCard, { TripCardsContainer, TripData } from "./TripCard";

// Types for routes from database
export interface RouteData {
    id: number;
    tenant_id: number;
    tenant_route_id: number;
    src_port_code: string;
    src_port_id: number;
    src_port_name: string;
    dest_port_code: string;
    dest_port_id: number;
    dest_port_name: string;
}

// Types for interactive messages
export type InteractiveType =
    | "text"
    | "quick_reply"
    | "port_selector"
    | "date_picker"
    | "passenger_selector"
    | "trip_results"
    | "confirmation";

export interface QuickReplyOption {
    label: string;
    value: string;
    icon?: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    interactive?: {
        type: InteractiveType;
        data: unknown;
    };
    tripResults?: TripData[];
    timestamp: Date;
}

export interface BookingContext {
    originPort?: { id: number; name: string; code: string };
    destinationPort?: { id: number; name: string; code: string };
    departureDate?: string;
    departureDateLabel?: string;
    returnDate?: string;
    tripType?: "single" | "roundTrip";
    passengerCount?: number;
    vehicleCount?: number;
    selectedRoute?: RouteData;
}


const TEST_INDICATORS = [
    'test', 'fake', 'sample', 'demo', 'xxx', 'asdf', 'qwerty',
    'heaven', 'hell', 'neverland', 'tokyo', 'kyoto', 'val', 'ocampo', 'james',
    'judiel', '1port', '2port', 'port d', 'port c', 'hogwarts', 'arnel',
    'ceven', 'gelo', 'maurice', 'rage', 'taneca', 'laguna', 'mandaue',
    'dumlog', 'poblacion'
];

const isRealPort = (name: string) =>
    !TEST_INDICATORS.some((t) => name.toLowerCase().includes(t));

type PortInfo = { code: string; name: string; id: number };

const ROUTE_PREVIEW_COUNT = 6;

type AvailableRoute = { src: PortInfo; dest: PortInfo };

const buildRouteOptions = (availableRoutes: AvailableRoute[], showAll: boolean): QuickReplyOption[] => {
    const displayed = showAll ? availableRoutes : availableRoutes.slice(0, ROUTE_PREVIEW_COUNT);
    const options: QuickReplyOption[] = displayed.map((r) => ({
        label: `ðŸ“ ${r.src.name} â†’ ${r.dest.name}`,
        value: `route:${r.src.code}:${r.src.name}:${r.src.id}:${r.dest.code}:${r.dest.name}:${r.dest.id}`,
    }));
    if (!showAll && availableRoutes.length > ROUTE_PREVIEW_COUNT) {
        options.push({
            label: `ðŸ”½ See more (${availableRoutes.length - ROUTE_PREVIEW_COUNT} more routes)`,
            value: "show_more_routes",
        });
    }
    return options;
};

const findRouteByPorts = (routes: RouteData[], originCode: string, destCode: string): RouteData | undefined =>
    routes.find((r) => r.src_port_code === originCode && r.dest_port_code === destCode);

const buildContextSummary = (ctx: BookingContext): string => {
    const parts: string[] = [];
    if (ctx.originPort) parts.push(`Origin: ${ctx.originPort.name} (${ctx.originPort.code})`);
    if (ctx.destinationPort) parts.push(`Destination: ${ctx.destinationPort.name} (${ctx.destinationPort.code})`);
    if (ctx.departureDate) parts.push(`Date: ${ctx.departureDate}`);
    if (ctx.passengerCount) parts.push(`Passengers: ${ctx.passengerCount}`);
    if (ctx.vehicleCount != null) parts.push(`Vehicles: ${ctx.vehicleCount}`);
    return parts.length > 0
        ? `[QUICKCHAT CONTEXT: ${parts.join(", ")}]`
        : "[QUICKCHAT CONTEXT: No selections yet]";
};

export interface AgentConfig {
    displayName?: string;
    welcomeMessage?: string;
    enabled?: boolean;
    model?: string;
    httpTools?: any[];
    agentType?: string;
    agentId?: string;
}

type Props = {
    onSwitchToForm?: () => void;
    showFormToggle?: boolean;
    agentConfig?: AgentConfig | null;
};

export default function InteractiveChatCard({
    onSwitchToForm,
    showFormToggle = true,
    agentConfig,
}: Props) {
    const router = useRouter();
    // Prefetch booking page so it's ready when user clicks Choose Trip
    useEffect(() => { router.prefetch('/booking/destination'); }, [router]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState<BookingContext>({});
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSearchingTrips, setIsSearchingTrips] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingRouteRef = useRef<RouteData | null>(null);
    const [step, setStep] = useState<"route" | "passengers" | "vehicles" | "date" | "complete">("route");
    const [availableRoutes, setAvailableRoutes] = useState<AvailableRoute[]>([]);
    const initAttempted = useRef(false);

    const displayName = agentConfig?.displayName || "AyahAI";
    // Use only the greeting portion of the welcome message (strip trailing questions)
    const rawWelcome = agentConfig?.welcomeMessage
        || "Hi! I'm AyahAI, your ferry booking assistant. ðŸ›³ï¸";
    const configWelcomeMsg = rawWelcome.split("\n").filter((line) => !line.trim().endsWith("?")).join("\n").trim()
        || rawWelcome.split("\n")[0];

    // Fetch routes then immediately show route selection (no async pre-filtering)
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await fetch("/api/routes?tenantId=1");
                if (!response.ok) return;
                const responseData = await response.json();
                const routesArray: RouteData[] = responseData.data || responseData;
                if (!Array.isArray(routesArray)) return;
                setRoutes(routesArray);

                // Build unique real (src, dest) pairs sorted alphabetically
                const seen = new Set<string>();
                const pairs: AvailableRoute[] = [];
                for (const r of routesArray) {
                    const key = `${r.src_port_code}:${r.dest_port_code}`;
                    if (!seen.has(key) && isRealPort(r.src_port_name) && isRealPort(r.dest_port_name)) {
                        seen.add(key);
                        pairs.push({
                            src: { code: r.src_port_code, name: r.src_port_name, id: r.src_port_id },
                            dest: { code: r.dest_port_code, name: r.dest_port_name, id: r.dest_port_id },
                        });
                    }
                }
                pairs.sort((a, b) => a.src.name.localeCompare(b.src.name) || a.dest.name.localeCompare(b.dest.name));
                setAvailableRoutes(pairs);
            } catch (error) {
                console.error("Failed to fetch routes:", error);
            }
        };
        fetchRoutes();
    }, []);

    // Show route selection as soon as routes are loaded
    useEffect(() => {
        if (availableRoutes.length === 0 || messages.length > 0 || initAttempted.current) return;
        initAttempted.current = true;

        const options = buildRouteOptions(availableRoutes, false);
        setMessages([{
            id: crypto.randomUUID(),
            role: "assistant",
            content: `${configWelcomeMsg}\n\nWhere would you like to go?`,
            interactive: { type: "quick_reply", data: { options } },
            timestamp: new Date(),
        }]);
    }, [availableRoutes, messages.length, configWelcomeMsg]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, showDatePicker]);

    // Handle date selection â€” now triggers search (passengers + vehicles already collected)
    const handleDateSelect = async (date: Date, label: string) => {
        setShowDatePicker(false);
        const dateStr = date.toLocaleDateString("en-CA");

        setContext((prev) => ({ ...prev, departureDate: dateStr, departureDateLabel: label }));

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: label,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setStep("complete");

        // Search trips with current context
        const route = context.selectedRoute || pendingRouteRef.current;
        if (route) {
            await searchTrips(dateStr, context.passengerCount, context.vehicleCount);
        }
    };

    // Search for trips based on current context
    const searchTrips = async (departureDate: string, passengerOverride?: number, vehicleOverride?: number) => {
        // Use pendingRouteRef if context isn't updated yet (React state batching)
        const route = context.selectedRoute || pendingRouteRef.current;
        if (!route) {
            console.error("No route selected");
            return;
        }
        // Keep route in ref for subsequent searches (e.g., when user picks from available dates)
        if (!pendingRouteRef.current) {
            pendingRouteRef.current = route;
        }

        setIsSearchingTrips(true);

        // Add searching message
        const searchingMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "ðŸ” Searching for available trips...",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, searchingMessage]);

        try {
            const params = new URLSearchParams({
                origin_code: route.src_port_code,
                destination_code: route.dest_port_code,
                departure_date: departureDate,
                passenger_count: String(passengerOverride || context.passengerCount || 1),
                vehicle_count: String(vehicleOverride ?? context.vehicleCount ?? 0),
                sort: "departureDate",
                page: "1",
            });

            const response = await fetch(`/api/trips?${params.toString()}`);

            // Remove searching message
            setMessages((prev) => prev.filter((m) => m.id !== searchingMessage.id));

            if (response.ok) {
                const tripResults = await response.json();
                
                // Extract trips array from response - API returns { message, data: [...trips] }
                const tripsArray = tripResults.data || [];
                
                const trips: TripData[] = tripsArray.map((t: any) => {
                    const firstSegment = t.segments?.[0];
                    const shipName = firstSegment?.ship_name || t.ship_name || "Unknown";
                    // Price: base_fare (adult ECO) from first segment
                    const price = firstSegment?.base_fare
                        ?? firstSegment?.passenger_rates?.find((r: any) => r.passenger_type_code === "ADULT")?.amount
                        ?? 0;
                    // Seats: bottleneck remaining across all segments
                    const availableSeats = (t.segments ?? [firstSegment]).reduce((min: number, s: any) => {
                        const cabinCaps: Record<string, { remaining: number }> = s?.cabin_capacities ?? {};
                        const total = Object.values(cabinCaps).reduce((sum, c) => sum + (c.remaining ?? 0), 0);
                        return total > 0 ? Math.min(min, total) : min;
                    }, Infinity);
                    return {
                        id: t.id?.toString() || crypto.randomUUID(),
                        shippingLine: shipName,
                        vesselName: shipName,
                        srcPort: t.origin_name || route.src_port_name,
                        destPort: t.destination_name || route.dest_port_name,
                        departureTime: t.total_departure_time || t.scheduled_departure,
                        arrivalTime: t.total_arrival_time || t.scheduled_arrival || "",
                        duration: t.total_duration_minutes ? `${Math.floor(t.total_duration_minutes / 60)}h ${t.total_duration_minutes % 60}m` : "",
                        price,
                        availableSeats: isFinite(availableSeats) ? availableSeats : 0,
                    };
                });
                

                let resultMessage: Message;

                if (trips.length > 0) {
                    resultMessage = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: `I found ${trips.length} trip${trips.length > 1 ? "s" : ""} for you! ðŸŽ‰`,
                        tripResults: trips,
                        interactive: {
                            type: "quick_reply",
                            data: {
                                options: [
                                    { label: "ðŸ”„ Different date", value: "try a different date" },
                                    { label: "ðŸ  Start over", value: "start over" },
                                ],
                            },
                        },
                        timestamp: new Date(),
                    };
                } else {
                    // No trips found - fetch available dates for this route
                    let availableDatesOptions: QuickReplyOption[] = [
                        { label: "ðŸ”„ Different route", value: "start over" },
                    ];

                    try {
                        const datesResponse = await fetch(
                            `/api/trips/available-dates?origin_code=${route.src_port_code}&destination_code=${route.dest_port_code}&limit=5&vehicle_count=${context.vehicleCount ?? 0}`
                        );
                        if (datesResponse.ok) {
                            const datesData = await datesResponse.json();
                            if (datesData.data && datesData.data.length > 0) {
                                const dateOptions = datesData.data.map((d: { date: string; trip_count: number }) => {
                                    const date = new Date(d.date + "T00:00:00"); // Parse as local time
                                    const label = date.toLocaleDateString("en-US", { 
                                        weekday: "short", 
                                        month: "short", 
                                        day: "numeric" 
                                    });
                                    // Ensure value is in YYYY-MM-DD format
                                    const dateValue = d.date.split("T")[0]; // Handle ISO format
                                    return {
                                        label: `ðŸ“… ${label} (${d.trip_count} trip${d.trip_count > 1 ? "s" : ""})`,
                                        value: dateValue,
                                    };
                                });
                                availableDatesOptions = [...dateOptions, { label: "ðŸ”„ Different route", value: "start over" }];
                            }
                        }
                    } catch (e) {
                        console.error("Error fetching available dates:", e);
                    }

                    const hasAvailableDates = availableDatesOptions.length > 1;
                    resultMessage = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: hasAvailableDates
                            ? `No trips found for that date. Here are dates with available trips on this route:`
                            : "Sorry, no trips found for this route. Would you like to try a different route?",
                        interactive: {
                            type: "quick_reply",
                            data: { options: availableDatesOptions },
                        },
                        timestamp: new Date(),
                    };
                }

                setMessages((prev) => [...prev, resultMessage]);
            } else {
                throw new Error("Failed to fetch trips");
            }

        } catch (error) {
            console.error("Error searching trips:", error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, I couldn't search for trips right now. Please try again!",
                interactive: {
                    type: "quick_reply",
                    data: {
                        options: [
                            { label: "ðŸ”„ Try again", value: "try again" },
                            { label: "ðŸ  Start over", value: "start over" },
                        ],
                    },
                },
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsSearchingTrips(false);
        }
    };

    // Handle trip selection - navigate to booking destination with search context
    const handleTripSelect = (trip: TripData) => {
        const route = context.selectedRoute;
        const depDate = context.departureDate
            || (trip.departureTime
                ? new Date(trip.departureTime).toLocaleDateString("en-CA")
                : new Date().toLocaleDateString("en-CA"));

        const params = new URLSearchParams({
            departure_date: depDate,
            passenger_count: String(context.passengerCount || 1),
            vehicle_count: String(context.vehicleCount || 0),
            sort: "departureDate",
            page: "1",
        });
        if (route?.src_port_code) params.set("origin_code", route.src_port_code);
        if (route?.dest_port_code) params.set("destination_code", route.dest_port_code);

        router.push(`/booking/destination?${params.toString()}`);
    };

    // Fuzzy-match a user-typed port name against available routes
    const findPort = useCallback((query: string) => {
        const q = query.toLowerCase().trim();
        // exact substring match first
        let match = availableRoutes.flatMap(r => [r.src, r.dest])
            .find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));
        if (match) return match;
        // word-overlap fallback (e.g. "talisay" matches "Talisay, Cebu")
        const words = q.split(/\s+/);
        match = availableRoutes.flatMap(r => [r.src, r.dest])
            .find(p => words.some(w => w.length >= 4 && p.name.toLowerCase().includes(w)));
        return match ?? null;
    }, [availableRoutes]);

    // Detect "from X to Y [at/on DATE]" intent â€” extracts ports and optional date string
    const detectRouteQuery = useCallback((text: string): { src: string; dest: string; dateHint?: string } | null => {
        const t = text.toLowerCase();
        // Strip trailing date phrases so they don't bleed into dest name
        const stripped = t.replace(/\s+(?:at|on)\s+[\w,.\s]+\d{4}.*$/, "").trim();
        const fromTo = stripped.match(/from\s+(.+?)\s+to\s+(.+?)(?:\?|$)/);
        if (fromTo) {
            // Try to extract a date from the original text (e.g. "Apr. 11, 2026" or "2026-04-11")
            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})/);
            return { src: fromTo[1].trim(), dest: fromTo[2].trim(), dateHint: dateMatch?.[0] };
        }
        const xTo = stripped.match(/(?:^|\s)(.+?)\s+to\s+(.+?)(?:\?|$)/);
        if (xTo) {
            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})/);
            return { src: xTo[1].trim(), dest: xTo[2].trim(), dateHint: dateMatch?.[0] };
        }
        return null;
    }, []);

    // Always send typed input to AI with quickchat context
    // AI responses always include a "Start over" button so users can re-enter the guided flow
    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            // --- Route intent intercept ---
            const routeQuery = detectRouteQuery(text);
            if (routeQuery && availableRoutes.length > 0) {
                const srcPort = findPort(routeQuery.src);
                const destPort = findPort(routeQuery.dest);
                if (srcPort && destPort && srcPort.code !== destPort.code) {
                    const matchedRoute = availableRoutes.find(
                        r => r.src.code === srcPort.code && r.dest.code === destPort.code
                    );
                    if (matchedRoute) {
                        const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text, timestamp: new Date() };
                        setMessages(prev => [...prev, userMessage]);
                        setInput("");
                        const routeObj = findRouteByPorts(routes, srcPort.code, destPort.code) ?? null;
                        pendingRouteRef.current = routeObj;
                        // Parse date hint if provided ("Apr. 11, 2026" â†’ "2026-04-11")
                        let parsedDate: string | null = null;
                        if (routeQuery.dateHint) {
                            const MONTHS: Record<string, number> = {
                                jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
                                jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
                            };
                            const hint = routeQuery.dateHint;
                            // ISO: "2026-04-11"
                            const iso = hint.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                            if (iso) {
                                parsedDate = hint;
                            } else {
                                // "Apr. 11, 2026" / "Apr 11, 2026" / "April 11, 2026"
                                const m = hint.match(/([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/);
                                if (m) {
                                    const mo = MONTHS[m[1].toLowerCase().slice(0, 3)];
                                    if (mo !== undefined) {
                                        const day = parseInt(m[2], 10);
                                        const year = parseInt(m[3], 10);
                                        parsedDate = `${year}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    }
                                }
                            }
                        }
                        setContext(prev => ({
                            ...prev,
                            originPort: srcPort,
                            destinationPort: destPort,
                            selectedRoute: routeObj ?? undefined,
                            ...(parsedDate ? { departureDate: parsedDate } : {}),
                            passengerCount: prev.passengerCount || 1,
                            vehicleCount: prev.vehicleCount ?? 0,
                        }));
                        if (parsedDate) {
                            // Date known â€” search immediately with default 1 pax / 0 vehicles
                            setStep("complete");
                            await searchTrips(parsedDate, context.passengerCount || 1, context.vehicleCount ?? 0);
                        } else {
                            // No date â€” ask passengers first
                            const passengerOptions: QuickReplyOption[] = [1,2,3,4,5,6,7,8,9,10].map(n => ({
                                label: `ðŸ‘¤ ${n} passenger${n > 1 ? "s" : ""}`,
                                value: `passengers:${n}`,
                            }));
                            setMessages(prev => [...prev, {
                                id: crypto.randomUUID(), role: "assistant",
                                content: `**${srcPort.name} â†’ ${destPort.name}** ðŸ›³ï¸\n\nHow many passengers will be traveling?`,
                                interactive: { type: "quick_reply", data: { options: passengerOptions } },
                                timestamp: new Date(),
                            }]);
                            setStep("passengers");
                        }
                        return;
                    }
                }
            }
            // --- end intercept ---

            // Clear previous interactive options so old buttons disappear
            setMessages((prev) => prev.map((m) => m.interactive ? { ...m, interactive: undefined } : m));

            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setInput("");
            setIsLoading(true);

            try {
                const contextSummary = buildContextSummary(context);
                const response = await fetch("/api/chat-booking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: [...messages, userMessage].map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                        context,
                        contextSummary,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: data.message,
                        interactive: {
                            type: "quick_reply",
                            data: {
                                options: [{ label: "ðŸ  Start a new search", value: "start over" }],
                            },
                        },
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                } else {
                    throw new Error("API request failed");
                }
            } catch (error) {
                console.error("Chat error:", error);
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "I'm having a bit of trouble right now. Please try again!",
                    interactive: {
                        type: "quick_reply",
                        data: {
                            options: [{ label: "ðŸ  Start a new search", value: "start over" }],
                        },
                    },
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } finally {
                setIsLoading(false);
            }
        },
        [context, messages, availableRoutes, routes, findPort, detectRouteQuery, searchTrips]
    );

    // Handle form submit â€” intercept typed input for passengers/vehicles steps
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        // If on passengers step and input is a number, handle as passenger count
        if (step === "passengers") {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num >= 1 && num <= 20) {
                setInput("");
                handleQuickReply(`passengers:${num}`, `${num} passenger${num > 1 ? "s" : ""}`);
                return;
            }
        }

        // If on vehicles step and input is a number, handle as vehicle count
        if (step === "vehicles") {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num >= 0 && num <= 10) {
                setInput("");
                handleQuickReply(`vehicles:${num}`, num === 0 ? "No vehicles" : `${num} vehicle${num > 1 ? "s" : ""}`);
                return;
            }
        }

        handleSendMessage(trimmed);
    };

    // Strip interactive options from all previous messages so old buttons disappear
    const clearPreviousOptions = () => {
        setMessages((prev) =>
            prev.map((m) =>
                m.interactive ? { ...m, interactive: undefined } : m
            )
        );
    };

    // Step-by-step quick reply handler
    const handleQuickReply = async (value: string, label: string) => {
        // --- Start Over ---
        if (value === "start over" || value.toLowerCase().includes("start over")) {
            setContext({});
            setMessages([]);
            setStep("route");
            pendingRouteRef.current = null;
            initAttempted.current = false;
            return;
        }

        // --- Show more routes (expand without clearing) ---
        if (value === "show_more_routes") {
            const allOptions = buildRouteOptions(availableRoutes, true);
            setMessages((prev) => {
                const updated = [...prev];
                for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i].role === "assistant" && updated[i].interactive) {
                        updated[i] = { ...updated[i], interactive: { type: "quick_reply", data: { options: allOptions } } };
                        break;
                    }
                }
                return updated;
            });
            return;
        }

        // Clear previous interactive options so old buttons disappear
        clearPreviousOptions();

        // --- Choose another route ---
        if (value === "choose_origin" || value === "choose_route") {
            const options = buildRouteOptions(availableRoutes, false);
            const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: "Choose another route", timestamp: new Date() };
            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Where would you like to go?",
                interactive: { type: "quick_reply", data: { options } },
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            return;
        }

        // --- Route selected (combined origin + destination) â†’ ask passengers ---
        if (value.startsWith("route:")) {
            const parts = value.split(":");
            const srcCode = parts[1];
            const srcName = parts[2];
            const srcId = parseInt(parts[3], 10);
            const destCode = parts[4];
            const destName = parts[5];
            const destId = parseInt(parts[6], 10);

            const route = findRouteByPorts(routes, srcCode, destCode);
            if (route) {
                pendingRouteRef.current = route;
                setContext((prev) => ({
                    ...prev,
                    originPort: { code: srcCode, name: srcName, id: srcId },
                    destinationPort: { code: destCode, name: destName, id: destId },
                    selectedRoute: route,
                }));
            }

            const passengerOptions: QuickReplyOption[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
                label: `ðŸ‘¤ ${n} passenger${n > 1 ? "s" : ""}`,
                value: `passengers:${n}`,
            }));

            const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: `${srcName} â†’ ${destName}`, timestamp: new Date() };
            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `**${srcName} â†’ ${destName}** ðŸ›³ï¸\n\nHow many passengers will be traveling?\nOr type a number below for larger groups.`,
                interactive: { type: "quick_reply", data: { options: passengerOptions } },
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            setStep("passengers");
            return;
        }

        // --- Passengers selected â†’ ask vehicles ---
        if (value.startsWith("passengers:")) {
            const count = parseInt(value.split(":")[1], 10);
            setContext((prev) => ({ ...prev, passengerCount: count }));

            const vehicleOptions: QuickReplyOption[] = [
                { label: "ðŸš« No vehicles", value: "vehicles:0" },
                { label: "ðŸš— 1 vehicle", value: "vehicles:1" },
                { label: "ðŸš— 2 vehicles", value: "vehicles:2" },
                { label: "ðŸš— 3 vehicles", value: "vehicles:3" },
                { label: "ðŸš— 4 vehicles", value: "vehicles:4" },
                { label: "ðŸš— 5 vehicles", value: "vehicles:5" },
            ];

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: `${count} passenger${count > 1 ? "s" : ""}`,
                timestamp: new Date(),
            };
            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Will you be bringing any vehicles?\nOr type a number below for more.",
                interactive: { type: "quick_reply", data: { options: vehicleOptions } },
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            setStep("vehicles");
            return;
        }

        // --- Vehicles selected â†’ show available dates ---
        if (value.startsWith("vehicles:")) {
            const vCount = parseInt(value.split(":")[1], 10);
            setContext((prev) => ({ ...prev, vehicleCount: vCount }));

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: vCount === 0 ? "No vehicles" : `${vCount} vehicle${vCount > 1 ? "s" : ""}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setStep("date");

            // Fetch available dates for this route
            const route = context.selectedRoute || pendingRouteRef.current;
            if (route) {
                setIsSearchingTrips(true);
                try {
                    const datesResponse = await fetch(
                        `/api/trips/available-dates?origin_code=${route.src_port_code}&destination_code=${route.dest_port_code}&limit=7&vehicle_count=${vCount}`
                    );
                    let dateOptions: QuickReplyOption[] = [];
                    if (datesResponse.ok) {
                        const datesData = await datesResponse.json();
                        if (datesData.data && datesData.data.length > 0) {
                            dateOptions = datesData.data.map((d: { date: string; trip_count: number }) => {
                                const date = new Date(d.date + "T00:00:00");
                                const lbl = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                                const dateValue = d.date.split("T")[0];
                                return {
                                    label: `ðŸ“… ${lbl} (${d.trip_count} trip${d.trip_count > 1 ? "s" : ""})`,
                                    value: dateValue,
                                };
                            });
                        }
                    }

                    if (dateOptions.length > 0) {
                        dateOptions.push({ label: "ðŸ—“ï¸ Pick another date", value: "pick_date" });
                        const assistantMsg: Message = {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            content: "Here are dates with available trips on this route.\nWhen would you like to travel?",
                            interactive: { type: "quick_reply", data: { options: dateOptions } },
                            timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, assistantMsg]);
                    } else {
                        const assistantMsg: Message = {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            content: "Sorry, there are no upcoming trips scheduled for this route yet. Would you like to try a different route?",
                            interactive: {
                                type: "quick_reply",
                                data: { options: [{ label: "ðŸ”„ Different route", value: "start over" }] },
                            },
                            timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, assistantMsg]);
                    }
                } catch (e) {
                    console.error("Error fetching available dates:", e);
                    // Fallback to manual date picker
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowLabel = tomorrow.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    const assistantMsg: Message = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: "When would you like to travel?",
                        interactive: {
                            type: "quick_reply",
                            data: {
                                options: [
                                    { label: `ðŸ“… Tomorrow (${tomorrowLabel})`, value: "tomorrow" },
                                    { label: "ðŸ—“ï¸ Pick a date", value: "pick_date" },
                                ],
                            },
                        },
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMsg]);
                } finally {
                    setIsSearchingTrips(false);
                }
            }
            return;
        }

        // --- Date shortcuts ---
        if (value === "pick_date") {
            setShowDatePicker(true);
            return;
        }
        if (value === "tomorrow") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowLabel = tomorrow.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            await handleDateSelect(tomorrow, `Tomorrow (${tomorrowLabel})`);
            return;
        }
        // Date value from available dates (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const selectedDate = new Date(value + "T00:00:00");
            const dateLabel = selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            await handleDateSelect(selectedDate, dateLabel);
            return;
        }

        // --- Different date ---
        if (value.toLowerCase().includes("different date")) {
            setShowDatePicker(true);
            const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: label, timestamp: new Date() };
            const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "No problem! Select a new date:", timestamp: new Date() };
            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            return;
        }

        // --- Fallback: send to AI ---
        handleSendMessage(label);
    };

    return (
        <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow-xl p-0 w-full h-auto transition-all duration-300 ease-in-out hover:shadow-2xl overflow-hidden mb-16 relative">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1a2b3b] to-[#2a4a5b] px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">
                            Where Do You Want to Go?
                        </h2>
                        <p className="text-[10px] text-sky-200/80">
                            Chat with {displayName} to find your trip
                        </p>
                    </div>
                </div>
                {showFormToggle && onSwitchToForm && (
                    <button
                        onClick={onSwitchToForm}
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors"
                    >
                        <FormInput className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Form</span>
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            <div
                ref={scrollRef}
                className="h-[320px] overflow-y-auto bg-transparent p-3 scroll-smooth"
            >
                <div className="space-y-3">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Message row wrapper â€” avatar + bubble */}
                                <div className={cn(
                                    "flex items-start gap-2",
                                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}>
                                {/* Bot avatar */}
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mt-0.5">
                                        <Bot className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                )}
                                {/* Message Bubble */}
                                <div
                                    className={cn(
                                        "flex w-max max-w-[85%] flex-col gap-1 rounded-xl px-3 py-2 text-xs shadow-sm",
                                        message.role === "user"
                                            ? "ml-auto bg-blue-600 text-white rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <div className="text-[10px] text-blue-500 font-medium">
                                            {displayName}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {message.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                            part.startsWith('**') && part.endsWith('**')
                                                ? <strong key={i}>{part.slice(2, -2)}</strong>
                                                : part
                                        )}
                                    </div>
                                </div>

                                {/* Trip Results */}
                                {message.tripResults && message.tripResults.length > 0 && (
                                    <TripCardsContainer
                                        trips={message.tripResults}
                                        onSelectTrip={handleTripSelect}
                                    />
                                )}

                                {/* Quick Reply Options */}
                                {message.interactive?.type === "quick_reply" && (
                                    <div className="mt-3 flex flex-wrap gap-2 ml-0">
                                        {(message.interactive.data as { options: QuickReplyOption[] }).options.map(
                                            (option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleQuickReply(option.value, option.label)}
                                                    className="px-3 py-1.5 rounded-full border border-blue-200 bg-white text-blue-600 text-xs font-medium hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                                                >
                                                    {option.label}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* Date Picker Trigger */}
                                {message.interactive?.type === "date_picker" && (
                                    <div className="mt-3 flex flex-wrap gap-2 ml-0">
                                        <button
                                            onClick={() => setShowDatePicker(true)}
                                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Select Travel Date
                                        </button>
                                    </div>
                                )}
                                </div>{/* end row wrapper */}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {(isLoading || isSearchingTrips) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-2"
                        >
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mt-0.5">
                                <Bot className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div className="flex w-max items-center gap-1.5 rounded-xl rounded-bl-none bg-white px-3 py-2 text-xs text-gray-500 shadow-sm border border-gray-100">
                                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                <span>{isSearchingTrips ? "Searching trips..." : `${displayName} is thinking...`}</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Date Picker Popup */}
            <AnimatePresence>
                {showDatePicker && (
                    <DatePickerPopup
                        onDateSelect={handleDateSelect}
                        onClose={() => setShowDatePicker(false)}
                    />
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-white p-3">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all"
                >
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Where do you want to go?"
                        className="flex-1 bg-transparent px-2 py-1 text-xs outline-none placeholder:text-gray-400"
                        disabled={isLoading || isSearchingTrips}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isSearchingTrips || !input.trim()}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Send className="h-3.5 w-3.5 ml-0.5" />
                    </button>
                </form>
                <div className="mt-1.5 text-center flex justify-center items-center gap-1 opacity-50">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span className="text-[9px] font-medium">Powered by AyahAI</span>
                </div>
            </div>
        </div>
    );
}
