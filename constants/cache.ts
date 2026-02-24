// Cached items stored in sessionStorage (auto-cleared on tab close; also invalidated on logout)
export const sessionCacheKeys = <const>[
  'vehicle-types',
  'jwt',
];

// Cached items that will be invalidated when user signs out
export const accountRelatedCacheKeys = <const>[
  'logged-in-account',
  'my-notifications',
  ...sessionCacheKeys,
];

// Cached items that will only be invalidated if explicitly called
export const publicCacheKeys = <const>[
  'cabin-types',
  'ports',
  'ships',
  'shipping-lines',
  'vehicle-types',
  'commodities',
  'trips',
  'trips-by-id',
  'rate-tables-by-id',
  'saved-bookings',
  'booking-json',
  'booking-response',
  'query-params',
  'header-sections',
  'destinations',
  'promos',
  'hero-sections',
  'footer-sections',
  'partners',
  'passenger-types'
];

export const cacheKeys = <const>[
  ...accountRelatedCacheKeys,
  ...publicCacheKeys,
];

export type CacheKey = (typeof cacheKeys)[number];
