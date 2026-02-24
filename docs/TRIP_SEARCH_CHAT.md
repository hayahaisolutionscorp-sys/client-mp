# Trip Search Chat Implementation

## Overview

The marketplace includes an AI-powered chat interface (`InteractiveChatCard`) that allows users to search for ferry trips through a conversational UI. This replaces the traditional form-based search with a more intuitive chat experience.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     InteractiveChatCard                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Routes    │───▶│    Date     │───▶│    Trip Search      │ │
│  │  Selection  │    │  Selection  │    │    & Results        │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Endpoints                              │
│  /api/routes          - Fetch available routes                  │
│  /api/trips           - Search trips (via /public/trips)        │
│  /api/trips/available-dates - Get dates with trips              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ayahay-client-api                             │
│  PublicRoutesController  - /public/routes (no auth)             │
│  PublicTripsController   - /public/trips (no auth)              │
│                         - /public/trips/available-dates         │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### InteractiveChatCard (`/src/components/chat/InteractiveChatCard.tsx`)

Main chat component that handles:
- Route selection via quick reply buttons
- Date selection (Tomorrow / Pick a date)
- Trip search and display
- Available dates suggestions when no trips found

**Key Features:**
- Real-time route fetching from database
- Public API endpoints (no authentication required for browsing)
- Responsive quick reply buttons
- Trip results cards with booking capability

### State Management

```typescript
interface BookingContext {
    selectedRoute?: RouteData;
    originPort?: PortInfo;
    destinationPort?: PortInfo;
    departureDate?: string;
    departureDateLabel?: string;
    passengers?: number;
}
```

## API Endpoints

### Public Routes (`/api/routes`)
Fetches available routes from the database.

**Request:**
```
GET /api/routes?tenantId=1
```

**Response:**
```json
{
  "data": [
    {
      "id": 401,
      "src_port_code": "TYK",
      "src_port_name": "Tokyo",
      "dest_port_code": "TLSY", 
      "dest_port_name": "Talisay, Cebu"
    }
  ]
}
```

### Public Trips (`/api/trips`)
Searches for available trips on a route and date.

**Request:**
```
GET /api/trips?origin_code=TYK&destination_code=TLSY&departure_date=2026-02-06&passenger_count=1&vehicle_count=0
```

**Response:**
```json
{
  "message": "Successfully found 2 trips",
  "data": [
    {
      "id": "direct-uuid",
      "type": "direct",
      "origin_name": "Tokyo",
      "destination_name": "Talisay, Cebu",
      "total_departure_time": "2026-02-06T05:04:00.000Z",
      "total_arrival_time": "2026-02-06T07:04:00.000Z",
      "total_duration_minutes": 120,
      "segments": [
        {
          "ship_name": "rick and morty",
          "scheduled_departure": "...",
          "scheduled_arrival": "..."
        }
      ]
    }
  ]
}
```

### Available Dates (`/api/trips/available-dates`)
Gets dates with available trips for a route (used when no trips found for selected date).

**Request:**
```
GET /api/trips/available-dates?origin_code=TYK&destination_code=TLSY&limit=5
```

**Response:**
```json
{
  "message": "Found 5 dates with available trips",
  "data": [
    { "date": "2026-02-05", "trip_count": 1 },
    { "date": "2026-02-06", "trip_count": 2 }
  ]
}
```

## Chat Flow

1. **Welcome** - Shows available routes as quick reply buttons
2. **Route Selection** - User clicks a route, shows date options
3. **Date Selection** - User picks "Tomorrow" or uses date picker
4. **Trip Search** - Fetches trips from `/public/trips`
5. **Results Display**:
   - If trips found: Shows trip cards with booking option
   - If no trips: Fetches `/public/trips/available-dates` and shows alternative dates

## Backend Controllers

### PublicRoutesController (`/src/modules/routes/public-routes.controller.ts`)

```typescript
@Controller('public/routes')
@ApiTags('Public Routes')
@Public()  // No authentication required
export class PublicRoutesController {
  @Get()
  async getRoutes(@Query('tenantId') tenantId: number) { ... }
}
```

### PublicTripsController (`/src/modules/trips/public-trips.controller.ts`)

```typescript
@Controller('public/trips')
@ApiTags('Public Trips')
@Public()  // No authentication required
export class PublicTripsController {
  @Get()
  async availableTrips(@Query() query: SearchTripsQueryDto) { ... }

  @Get('available-dates')
  async getAvailableDates(
    @Query('origin_code') originCode: string,
    @Query('destination_code') destinationCode: string,
    @Query('limit') limit?: string
  ) { ... }
}
```

## Security Notes

- **Public endpoints** allow unauthenticated access for browsing trips
- **Booking** still requires authentication
- No sensitive data exposed through public endpoints

## Testing

```bash
# Test routes API
curl "http://localhost:3000/public/routes?tenantId=1"

# Test trips API
curl "http://localhost:3000/public/trips?origin_code=TYK&destination_code=TLSY&departure_date=2026-02-06&passenger_count=1"

# Test available dates API
curl "http://localhost:3000/public/trips/available-dates?origin_code=TYK&destination_code=TLSY&limit=5"
```

## Dependencies

- `@ayahay/knowledge-base-sdk` v1.2.2 - AI chat capabilities
- `@ayahay/knowledge-base-chat-ui` v1.0.0 - Chat UI components
- `framer-motion` - Animations
- `lucide-react` - Icons
- `date-fns` - Date formatting
