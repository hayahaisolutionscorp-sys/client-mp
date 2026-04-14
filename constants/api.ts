const trimTrailingSlash = (url?: string | null) => (url ?? '').replace(/\/+$/, '');

const clientModeFlag = process.env.NEXT_PUBLIC_IS_CLIENT;
export const IS_CLIENT = clientModeFlag === 'true';
const CLIENT_API_BASE_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
export const CORE_API_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

// If NEXT_PUBLIC_IS_CLIENT is omitted but a client API base URL is provided,
// default to client mode to avoid silently falling back to core API endpoints.
const hasClientApiBase = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
const isDevEnvironment =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
/** Tenant marketplace in dev: use client-api for whitelabel data (matches .env.example with TENANT_ID). */
const isDevTenantClientApi =
  isDevEnvironment &&
  Boolean(process.env.NEXT_PUBLIC_TENANT_ID) &&
  process.env.NEXT_PUBLIC_IS_CLIENT !== 'false';
/** Same boolean as choosing CLIENT_API_BASE_URL for BASE_URL (tenant client-api vs core). */
export const isEffectiveClientApiMode =
  IS_CLIENT || (!clientModeFlag && hasClientApiBase) || isDevTenantClientApi;
const BASE_URL = isEffectiveClientApiMode ? CLIENT_API_BASE_URL : CORE_API_URL;

const WHITELABEL_DEBUG = process.env.NEXT_PUBLIC_WHITELABEL_DEBUG === 'true';
const logScope = globalThis as typeof globalThis & {
  __WHITELABEL_API_CONFIG_LOGGED__?: boolean;
};

if (WHITELABEL_DEBUG && !logScope.__WHITELABEL_API_CONFIG_LOGGED__) {
  logScope.__WHITELABEL_API_CONFIG_LOGGED__ = true;
  console.info('[WhitelabelAPI] endpoint resolution', {
    isClientMode: IS_CLIENT,
    isEffectiveClientApiMode,
    clientModeFlag,
    hasClientApiBase,
    clientApiBaseUrl: CLIENT_API_BASE_URL,
    coreApiUrl: CORE_API_URL,
    effectiveBaseUrl: BASE_URL
  });
}

export const EFFECTIVE_API_BASE_URL = BASE_URL;

export const TENANT_PORTS_API = `${CORE_API_URL}/tenants/ports`;

export const THEME_SETTINGS_API = `${BASE_URL}/gen_configs`;
export const SEO_API = `${BASE_URL}/pages`;
export const BRANDING_API = `${BASE_URL}/gen_configs`;

export const HEADER_SECTION_API = `${BASE_URL}/pages/header-config`;
export const FOOTER_SECTION_API = `${BASE_URL}/pages/footer-config`;

export const HERO_SECTION_API = `${BASE_URL}/pages/home/page-sections/hero`;
export const PROMOS_API = `${BASE_URL}/travel-promotions`;
export const DESTINATIONS_API = `${BASE_URL}/route-recommendations`;

export const WHY_CHOOSE_REASONS_API = `${BASE_URL}/home/why_choose/section-cards`;
export const WHY_CHOOSE_SECTION_API = `${BASE_URL}/pages/home/page-sections/why_choose`;

export const GET_TO_KNOW_API = `${BASE_URL}/pages/home/page-sections/get_to_know`;
export const GET_TO_KNOW_MISSION_API = `${BASE_URL}/pages/home/page-sections/get_to_know_mission`;
export const GET_TO_KNOW_VISION_API = `${BASE_URL}/pages/home/page-sections/get_to_know_vision`;

export const OUR_PARTNERS_API = `${BASE_URL}/partners`;

export const ABOUT_US_SECTION_API = `${BASE_URL}/pages/about-us/page-sections`;
export const ABOUT_US_CORE_VALUES_API = `${BASE_URL}/about-us/core_values/section-cards`;

export const CONTACT_INFORMATION_API = `${BASE_URL}/contact-information`;
export const CONTACT_US_HERO_API = `${BASE_URL}/pages/contact-us/page-sections/hero`;

export const PRIVACY_POLICY_API = `${BASE_URL}/pages/privacy-policy`;

export const TERMS_AND_CONDITIONS_API = `${BASE_URL}/pages/terms-and-conditions`;

export const PRESS_RELEASES_API = `${BASE_URL}/press-releases`;

export const PRESS_API = `${BASE_URL}/press`;

export const FAQS_API = `${BASE_URL}/faqs`;

export const UPLOAD_API = `${BASE_URL}/upload`;
export const ACCOUNT_API = `${BASE_URL}/accounts`;
export const VERIFICATION_API = `${BASE_URL}/verification`;
export const AUTH_API = `${BASE_URL}/auth`;
export const BOOKING_API = `${BASE_URL}/bookings`;
export const CABIN_TYPES_API = `${BASE_URL}/cabin-types`;
export const CSV_API = `${BASE_URL}/csv`;
export const DISBURSEMENT_API = `${BASE_URL}/disbursement`;
export const EMAIL_API = `${BASE_URL}/email`;
export const NOTIFICATION_API = `${BASE_URL}/notifications`;
export const NOTIFICATION_USER_LIST_API = `${NOTIFICATION_API}/user-notifications`;
export const NOTIFICATION_MARK_READ_API = (id: string | number) => `${NOTIFICATION_API}/${id}/read`;
export const NOTIFICATION_MARK_ALL_READ_API = `${NOTIFICATION_API}/mark-all-read`;
export const PASSENGER_API = `${BASE_URL}/passengers`;
export const PASSENGER_TYPES_ACTIVE_API = `${BASE_URL}/passenger-types/active`;
export const PASSENGER_TYPES_API = `${BASE_URL}/passenger-types`;
export const PAYMENT_API = `${BASE_URL}/pay`;
export const PAYMONGO_API = `${BASE_URL}/payments/paymongo`;
export const MAYA_API = `${BASE_URL}/payments/maya`;
// Uses BASE_URL directly - provider config now synced to client api via outbox
export const PAYMENT_PROVIDERS_API = `${BASE_URL}/payments/providers`;
export const PORTS_API = `${BASE_URL}/ports`;
export const REPORTING_API = `${BASE_URL}/reporting`;
export const SEARCH_API = `${BASE_URL}/search`;
export const SHIPPING_LINE_API = `${BASE_URL}/shipping-lines`;
export const SHIPS_API = `${BASE_URL}/ships`;
export const TRIP_API = `${BASE_URL}/trips`;
export const CARGO_PLANNING_API = `${BASE_URL}/cargo-planning`;
export const ROUTE_API = `${BASE_URL}/routes`;
export const VEHICLE_TYPES_API = `${BASE_URL}/vehicle-types`;
export const VEHICLE_MODELS_API = `${BASE_URL}/vehicle-models`;
export const COMMODITIES_API = `${BASE_URL}/commodities`;
export const VOUCHERS_API = `${BASE_URL}/vouchers`;
export const WEBHOOKS_API = `${BASE_URL}/webhooks`;
export const RATE_TABLES_API = `${BASE_URL}/rate-tables`;
export const RATE_TABLE_ROWS_API = `${BASE_URL}/rate-table-rows`;
export const SEAT_PLAN_API = `${BASE_URL}/seat-plans`;
export const SEATMAP_PUBLIC_API = `${CLIENT_API_BASE_URL}/public`;

export const PROFILES_API = `${BASE_URL}/profiles`;
