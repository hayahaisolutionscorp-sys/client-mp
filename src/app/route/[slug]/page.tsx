import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ports from '@/data/ports.json';
import ScheduleAndFares from '@/components/schedule-and-fares/ScheduleAndFares';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { CalendarIcon } from 'lucide-react';

// Helper to normalize strings for slug comparison
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface RoutePageProps {
    params: Promise<{ slug: string }>;
}

async function getRouteFromSlug(slug: string) {
    // Expected format: origin-name-to-destination-name
    // We need to find two ports where normalize(p1.name) + '-to-' + normalize(p2.name) === slug
    // This is O(N^2) but N is small (ports).

    const parts = slug.split('-to-');
    if (parts.length !== 2) return null;

    const [originSlug, destSlug] = parts;

    const origin = ports.find(p => normalize(p.name).includes(originSlug) || originSlug.includes(normalize(p.name)));
    const destination = ports.find(p => normalize(p.name).includes(destSlug) || destSlug.includes(normalize(p.name)));

    // More robust matching:
    // Iterate all pairs to find exact match if possible, or best guess.
    // actually, let's look for exact match of normalized names first.

    const originExact = ports.find(p => normalize(p.name) === originSlug);
    const destExact = ports.find(p => normalize(p.name) === destSlug);

    if (originExact && destExact) return { origin: originExact, destination: destExact };

    // Fallback: try to match by splitting the slug if it wasn't perfectly "A-to-B"
    // Assuming strict "origin-to-destination" format where origin and dest are exact normalized names is safest.
    // But user might want "bogo-to-palompon" where port name is "Bogo, Cebu".
    // content of ports.json: name="Bogo, Cebu" -> normalized="bogo-cebu"

    // Let's stick to the heuristic: normalized(port.name) must be contained in the slug part or vice versa.

    if (origin && destination) return { origin, destination };

    return null;
}


export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
    const { slug } = await params;
    const route = await getRouteFromSlug(slug);

    if (!route) {
        return {
            title: 'Route Not Found | Ayahay',
            description: 'The requested ferry route could not be found.',
        };
    }

    const { origin, destination } = route;

    return {
        title: `Ferry Schedule: ${origin.name} to ${destination.name} | Ayahay`,
        description: `Book ferry tickets from ${origin.name} to ${destination.name}. Check schedules, fares, and travel time. Secure online booking available.`,
    };
}

export default async function RoutePage({ params }: RoutePageProps) {
    const { slug } = await params;
    const route = await getRouteFromSlug(slug);

    if (!route) {
        notFound();
    }

    const { origin, destination } = route;

    return (
        <div className="container max-w-[1500px] mx-auto py-8 px-4 sm:px-6">
            {/* SEO Content */}
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Ferry Schedule: {origin.name} to {destination.name}
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                    Looking for trips from <strong>{origin.name}</strong> to <strong>{destination.name}</strong>?
                    View the latest schedule, ticket prices, and travel guidelines below.
                    Book your tickets online quickly and securely with Ayahay.
                </p>
            </div>

            <Card className="w-full max-w-none">
                <CardContent className="p-5 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 px-2">
                            <CalendarIcon className="w-6 h-6 text-sky-500" />
                            <span>Select Travel Date</span>
                        </h2>
                    </div>

                    {/* 
            Ideally, we would pass pre-selected ports to ScheduleAndFares.
            However, looking at ScheduleAndFares (I need to check if it accepts props), 
            I will assume for now it handles its own state. 
            If I can inject initial state, I should.
            For now, I'll render it as is, but at least the page is SEO optimized.
          */}
                    <ScheduleAndFares srcPortId={origin.id} destPortId={destination.id} />
                </CardContent>
                <CardFooter className="bg-slate-50 py-4 sm:py-5 px-6 sm:px-8 text-sm sm:text-base text-muted-foreground border-t">
                    Trip schedules from {origin.name} to {destination.name}. Book now!
                </CardFooter>
            </Card>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
                <section className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-2xl font-semibold mb-4">Travel Information</h2>
                    <ul className="space-y-3 text-gray-600">
                        <li><strong>Origin:</strong> {origin.name}</li>
                        <li><strong>Destination:</strong> {destination.name}</li>
                        <li><strong>Travel Tips:</strong> Arrive at the port at least 1 hour before departure.</li>
                    </ul>
                </section>
                <section className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                    <dl className="space-y-4">
                        <div>
                            <dt className="font-semibold text-gray-900">How do I book?</dt>
                            <dd className="text-gray-600">Select your date above and choose a trip to book online.</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-gray-900">Is online booking secure?</dt>
                            <dd className="text-gray-600">Yes, Ayahay provides continuous secure booking services.</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </div>
    );
}
